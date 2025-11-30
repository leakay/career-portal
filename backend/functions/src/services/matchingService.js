const natural = require('natural');
const tf = require('@tensorflow/tfjs');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

module.exports = {
  // Job-Student Matching Algorithm
  async matchStudentsToJob(jobId, limit = 10) {
    try {
      const job = await Job.findById(jobId)
        .populate('employer', 'companyName');
      
      if (!job) {
        throw new Error('Job not found');
      }

      // Get all active students
      const students = await User.find({
        role: 'student',
        isActive: true,
        profileCompleted: true
      }).select('name email university course year skills interests gpa resume bio');

      // Calculate match scores for each student
      const matches = students.map(student => {
        const matchScore = this.calculateJobMatchScore(job, student);
        return {
          student: {
            id: student._id,
            name: student.name,
            email: student.email,
            university: student.university,
            course: student.course,
            year: student.year,
            skills: student.skills,
            gpa: student.gpa
          },
          matchScore: matchScore.overall,
          breakdown: matchScore.breakdown,
          compatibility: this.getCompatibilityLevel(matchScore.overall)
        };
      });

      // Sort by match score and return top matches
      const sortedMatches = matches
        .filter(match => match.matchScore > 0.3) // Minimum threshold
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

      return {
        success: true,
        job: {
          id: job._id,
          title: job.title,
          company: job.employer.companyName,
          requiredSkills: job.requiredSkills,
          preferredUniversities: job.preferredUniversities
        },
        matches: sortedMatches,
        totalStudents: students.length,
        matchingStudents: sortedMatches.length
      };

    } catch (error) {
      console.error('Job matching error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Student-Job Recommendation Engine
  async recommendJobsForStudent(studentId, limit = 10) {
    try {
      const student = await User.findById(studentId);
      if (!student || student.role !== 'student') {
        throw new Error('Student not found');
      }

      // Get active jobs
      const jobs = await Job.find({
        status: 'active',
        applicationDeadline: { $gt: new Date() }
      }).populate('employer', 'companyName logo');

      // Calculate match scores for each job
      const recommendations = jobs.map(job => {
        const matchScore = this.calculateJobMatchScore(job, student);
        const isQualified = this.checkJobQualification(job, student); // Strict qualification check

        return {
          job: {
            id: job._id,
            title: job.title,
            company: job.employer.companyName,
            location: job.location,
            type: job.type,
            salary: job.salary,
            applicationDeadline: job.applicationDeadline
          },
          matchScore: matchScore.overall,
          breakdown: matchScore.breakdown,
          compatibility: this.getCompatibilityLevel(matchScore.overall),
          urgency: this.calculateJobUrgency(job),
          isQualified: isQualified // Only recommend if qualified
        };
      });

      // Sort and filter recommendations - only show qualified jobs
      const sortedRecommendations = recommendations
        .filter(rec => rec.isQualified && rec.matchScore > 0.4) // Must be qualified AND meet minimum match score
        .sort((a, b) => {
          // Sort by match score and urgency
          const scoreA = a.matchScore + (a.urgency * 0.1);
          const scoreB = b.matchScore + (b.urgency * 0.1);
          return scoreB - scoreA;
        })
        .slice(0, limit);

      return {
        success: true,
        student: {
          id: student._id,
          name: student.name,
          university: student.university,
          course: student.course
        },
        recommendations: sortedRecommendations,
        totalJobs: jobs.length,
        recommendedJobs: sortedRecommendations.length
      };

    } catch (error) {
      console.error('Job recommendation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Core Matching Algorithm
  calculateJobMatchScore(job, student) {
    const weights = {
      skills: 0.35,
      education: 0.25,
      university: 0.15,
      experience: 0.15,
      location: 0.10
    };

    const breakdown = {
      skills: this.calculateSkillsMatch(job.requiredSkills, student.skills),
      education: this.calculateEducationMatch(job, student),
      university: this.calculateUniversityMatch(job.preferredUniversities, student.university),
      experience: this.calculateExperienceMatch(job, student),
      location: this.calculateLocationPreference(job.location, student.location)
    };

    // Calculate weighted overall score
    const overall = Object.keys(breakdown).reduce((total, key) => {
      return total + (breakdown[key] * weights[key]);
    }, 0);

    return {
      overall: Math.min(1, overall), // Cap at 1.0
      breakdown
    };
  },

  // Skills Matching
  calculateSkillsMatch(requiredSkills, studentSkills) {
    if (!requiredSkills || requiredSkills.length === 0) return 0.5; // Neutral if no skills specified
    
    const matchingSkills = studentSkills.filter(skill => 
      requiredSkills.some(requiredSkill => 
        this.calculateSkillSimilarity(skill, requiredSkill) > 0.7
      )
    );

    return matchingSkills.length / requiredSkills.length;
  },

  calculateSkillSimilarity(skill1, skill2) {
    // Use Jaro-Winkler distance for skill similarity
    return natural.JaroWinklerDistance(
      skill1.toLowerCase(),
      skill2.toLowerCase()
    );
  },

  // Education Matching
  calculateEducationMatch(job, student) {
    let score = 0.5; // Base score

    // Course relevance (simple keyword matching)
    if (student.course && job.description) {
      const courseKeywords = student.course.toLowerCase().split(/[\s\/&]+/);
      const jobText = (job.description + ' ' + job.requirements).toLowerCase();
      
      const matchingKeywords = courseKeywords.filter(keyword => 
        jobText.includes(keyword) && keyword.length > 3
      );
      
      score += (matchingKeywords.length / courseKeywords.length) * 0.3;
    }

    // Year of study consideration
    if (student.year) {
      const yearScore = this.calculateYearRelevance(student.year, job.type);
      score += yearScore * 0.2;
    }

    return Math.min(1, score);
  },

  calculateYearRelevance(studentYear, jobType) {
    const yearScores = {
      '1': { 'internship': 0.8, 'part-time': 0.6, 'full-time': 0.3 },
      '2': { 'internship': 0.9, 'part-time': 0.7, 'full-time': 0.4 },
      '3': { 'internship': 0.7, 'part-time': 0.8, 'full-time': 0.7 },
      '4': { 'internship': 0.5, 'part-time': 0.6, 'full-time': 0.9 },
      '5+': { 'internship': 0.3, 'part-time': 0.4, 'full-time': 1.0 }
    };

    return yearScores[studentYear]?.[jobType] || 0.5;
  },

  // University Preference Matching
  calculateUniversityMatch(preferredUniversities, studentUniversity) {
    if (!preferredUniversities || preferredUniversities.length === 0) {
      return 0.5; // Neutral if no preference
    }
    
    return preferredUniversities.includes(studentUniversity) ? 1.0 : 0.2;
  },

  // Experience Matching
  calculateExperienceMatch(job, student) {
    // This would integrate with student's experience data
    // For now, using year of study as proxy for experience
    const yearExperienceMap = {
      '1': 0.2, '2': 0.4, '3': 0.6, '4': 0.8, '5+': 1.0
    };
    
    return yearExperienceMap[student.year] || 0.5;
  },

  // Location Preference
  calculateLocationPreference(jobLocation, studentLocation) {
    if (!studentLocation) return 0.5;
    
    // Simple location matching - in production, use geocoding
    const jobCity = jobLocation.split(',')[0].toLowerCase().trim();
    const studentCity = studentLocation.split(',')[0].toLowerCase().trim();
    
    return jobCity === studentCity ? 1.0 : 0.3;
  },

  // Job Urgency Calculation
  calculateJobUrgency(job) {
    let urgency = 0.5; // Base urgency

    // Application deadline proximity
    if (job.applicationDeadline) {
      const daysUntilDeadline = Math.ceil(
        (new Date(job.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilDeadline <= 3) urgency += 0.4;
      else if (daysUntilDeadline <= 7) urgency += 0.2;
    }

    // Urgent flag
    if (job.urgent) urgency += 0.3;

    // Featured job
    if (job.featured) urgency += 0.1;

    return Math.min(1, urgency);
  },

  // Strict Job Qualification Check
  checkJobQualification(job, student) {
    if (!student || !job.requirements) return false;

    const requirements = job.requirements;
    const qualifications = student.qualifications || {};

    // Check minimum GPA requirements
    if (requirements.minGPA && student.gpa) {
      const studentGPA = parseFloat(student.gpa);
      const requiredGPA = parseFloat(requirements.minGPA);
      if (isNaN(studentGPA) || studentGPA < requiredGPA) {
        return false;
      }
    }

    // Check required qualifications/skills
    if (requirements.qualifications && requirements.qualifications.length > 0) {
      const studentQuals = Array.isArray(qualifications.subjects)
        ? qualifications.subjects
        : (qualifications.subjects ? qualifications.subjects.split(',').map(s => s.trim()) : []);

      const hasRequiredQualifications = requirements.qualifications.every(reqQual =>
        studentQuals.some(studentQual =>
          studentQual.toLowerCase().includes(reqQual.toLowerCase())
        )
      );
      if (!hasRequiredQualifications) return false;
    }

    // Check course relevance
    if (requirements.course && student.course) {
      const jobCourseKeywords = requirements.course.toLowerCase().split(/[\s\/&]+/);
      const studentCourse = student.course.toLowerCase();

      const hasRelevantCourse = jobCourseKeywords.some(keyword =>
        studentCourse.includes(keyword) && keyword.length > 3
      );
      if (!hasRelevantCourse) return false;
    }

    // Check experience requirements (using year as proxy)
    if (requirements.experience && student.year) {
      const yearMap = { '1': 0, '2': 1, '3': 2, '4': 3, '5+': 4 };
      const studentExp = yearMap[student.year] || 0;
      const requiredExp = parseInt(requirements.experience) || 0;
      if (studentExp < requiredExp) return false;
    }

    // Check portfolio requirement for creative roles
    if (requirements.portfolioRequired && !qualifications.portfolio) {
      return false;
    }

    return true;
  },

  // Compatibility Level
  getCompatibilityLevel(score) {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  },

  // University-Specific Matching
  async getUniversitySpecificMatches(university, limit = 5) {
    try {
      const jobs = await Job.find({
        status: 'active',
        $or: [
          { preferredUniversities: university },
          { preferredUniversities: { $size: 0 } } // Jobs with no specific preference
        ]
      })
      .populate('employer', 'companyName logo')
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit);

      return {
        success: true,
        university,
        jobs: jobs.map(job => ({
          id: job._id,
          title: job.title,
          company: job.employer.companyName,
          location: job.location,
          type: job.type,
          salary: job.salary,
          isPreferred: job.preferredUniversities.includes(university)
        }))
      };

    } catch (error) {
      console.error('University matching error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Skill Gap Analysis
  analyzeSkillGaps(studentId, jobId) {
    return new Promise(async (resolve) => {
      try {
        const [student, job] = await Promise.all([
          User.findById(studentId),
          Job.findById(jobId)
        ]);

        if (!student || !job) {
          resolve({ success: false, error: 'Student or job not found' });
          return;
        }

        const studentSkills = student.skills || [];
        const requiredSkills = job.requiredSkills || [];

        const missingSkills = requiredSkills.filter(requiredSkill => 
          !studentSkills.some(studentSkill => 
            this.calculateSkillSimilarity(studentSkill, requiredSkill) > 0.7
          )
        );

        const existingSkills = studentSkills.filter(studentSkill =>
          requiredSkills.some(requiredSkill =>
            this.calculateSkillSimilarity(studentSkill, requiredSkill) > 0.7
          )
        );

        resolve({
          success: true,
          student: student.name,
          job: job.title,
          missingSkills,
          existingSkills,
          coverage: existingSkills.length / requiredSkills.length,
          recommendation: this.generateSkillRecommendations(missingSkills)
        });

      } catch (error) {
        resolve({ success: false, error: error.message });
      }
    });
  },

  generateSkillRecommendations(missingSkills) {
    const skillResources = {
      'JavaScript': ['freeCodeCamp JavaScript Course', 'MDN JavaScript Guide'],
      'Python': ['Python.org Tutorial', 'Real Python Tutorials'],
      'React': ['React Official Tutorial', 'FreeCodeCamp React Course'],
      'Node.js': ['Node.js Official Docs', 'The Net Ninja Node.js Course'],
      'MongoDB': ['MongoDB University', 'MongoDB Docs'],
      'SQL': ['SQLBolt', 'Khan Academy SQL'],
      'Communication': ['Coursera Communication Skills', 'Toastmasters'],
      'Problem Solving': ['HackerRank', 'LeetCode'],
      'Teamwork': ['LinkedIn Learning Teamwork Course']
    };

    return missingSkills.map(skill => ({
      skill,
      resources: skillResources[skill] || ['General online courses and practice'],
      priority: 'High'
    }));
  },

  // Career Path Suggestions
  async suggestCareerPaths(studentId) {
    try {
      const student = await User.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const popularCareerPaths = {
        'Computer Science': ['Software Developer', 'Data Scientist', 'Web Developer', 'Systems Analyst'],
        'Business Administration': ['Business Analyst', 'Project Manager', 'Marketing Specialist', 'HR Coordinator'],
        'Engineering': ['Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer', 'Project Engineer'],
        'Healthcare': ['Registered Nurse', 'Medical Technician', 'Healthcare Administrator', 'Pharmaceutical Sales'],
        'Creative Arts': ['Graphic Designer', 'Content Creator', 'UX Designer', 'Marketing Coordinator']
      };

      // Determine student's field based on course
      const studentField = this.mapCourseToField(student.course);
      const suggestedPaths = popularCareerPaths[studentField] || ['Various professional roles'];

      return {
        success: true,
        student: {
          name: student.name,
          course: student.course,
          field: studentField
        },
        suggestedCareerPaths: suggestedPaths,
        growthAreas: this.identifyGrowthAreas(student.skills, studentField)
      };

    } catch (error) {
      console.error('Career path suggestion error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  mapCourseToField(course) {
    const fieldMapping = {
      'Computer Science': 'Computer Science',
      'Information Technology': 'Computer Science',
      'Software Engineering': 'Computer Science',
      'Business Administration': 'Business Administration',
      'Accounting': 'Business Administration',
      'Marketing': 'Business Administration',
      'Mechanical Engineering': 'Engineering',
      'Civil Engineering': 'Engineering',
      'Electrical Engineering': 'Engineering',
      'Nursing': 'Healthcare',
      'Medicine': 'Healthcare',
      'Pharmacy': 'Healthcare',
      'Graphic Design': 'Creative Arts',
      'Multimedia Design': 'Creative Arts'
    };

    for (const [key, value] of Object.entries(fieldMapping)) {
      if (course?.includes(key)) {
        return value;
      }
    }

    return 'General';
  },

  identifyGrowthAreas(skills, field) {
    const fieldSkillRequirements = {
      'Computer Science': ['Cloud Computing', 'Machine Learning', 'DevOps', 'Cybersecurity'],
      'Business Administration': ['Data Analysis', 'Digital Marketing', 'Financial Modeling', 'Leadership'],
      'Engineering': ['CAD Software', 'Project Management', 'Sustainable Design', 'Technical Writing'],
      'Healthcare': ['Telemedicine', 'Healthcare IT', 'Patient Care Technology', 'Medical Research'],
      'Creative Arts': ['Digital Marketing', 'UI/UX Design', 'Video Editing', 'Social Media Management']
    };

    const requiredSkills = fieldSkillRequirements[field] || [];
    return requiredSkills.filter(skill => !skills?.includes(skill));
  }
};