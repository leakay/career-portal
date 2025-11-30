const admin = require('firebase-admin');
const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const matchingService = require('../services/matchingService');

// Get company stats
exports.getCompanyStats = async (req, res) => {
  try {
    const companyId = req.user.uid;
    const db = admin.firestore();

    // Get jobs count - use 'employer' field to match frontend data
    const jobsSnapshot = await db.collection('jobs')
      .where('employer', '==', companyId)
      .where('status', '==', 'active')
      .get();

    // Get applications count
    const applicationsSnapshot = await db.collection('applications')
      .where('companyId', '==', companyId)
      .get();

    // Get interviews scheduled count
    const interviewsSnapshot = await db.collection('applications')
      .where('companyId', '==', companyId)
      .where('status', '==', 'interview')
      .get();

    // Get offers made count
    const offersSnapshot = await db.collection('applications')
      .where('companyId', '==', companyId)
      .where('status', '==', 'approved')
      .get();

    const stats = {
      jobs: jobsSnapshot.size,
      applicants: applicationsSnapshot.size,
      interviews: interviewsSnapshot.size,
      offers: offersSnapshot.size
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching company stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all jobs for the company
exports.getJobs = async (req, res) => {
  try {
    const companyId = req.user.uid;
    const db = admin.firestore();

    // Query jobs for the specific company using employer field
    const jobsSnapshot = await db.collection('jobs')
      .where('employer', '==', companyId)
      .get();

    const jobs = [];
    jobsSnapshot.forEach(doc => {
      const jobData = doc.data();
      jobs.push({
        id: doc.id,
        title: jobData.title || '',
        category: jobData.category || '',
        location: jobData.location || '',
        status: jobData.status || 'active',
        applicants: jobData.applicants || 0,
        postedDate: jobData.createdAt?.toDate?.()?.toISOString()?.split('T')[0] || '',
        createdAt: jobData.createdAt?.toDate?.()?.toISOString() || '',
        description: jobData.description || '',
        requirements: jobData.requirements || {},
        companyName: jobData.companyName || '',
        salary: jobData.salary || '',
        ...jobData
      });
    });

    res.json({ message: 'Jobs retrieved successfully', data: jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new job
exports.createJob = async (req, res) => {
  try {
    const companyId = req.user.uid;
    const db = admin.firestore();

    const jobData = {
      ...req.body,
      employer: companyId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: req.body.status || 'active'
    };

    const docRef = await db.collection('jobs').add(jobData);

    res.status(201).json({
      message: 'Job created successfully',
      data: { id: docRef.id, ...jobData }
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const companyId = req.user.uid;
    const db = admin.firestore();

    const jobRef = db.collection('jobs').doc(jobId);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const jobData = jobDoc.data();
    if (jobData.employer !== companyId) {
      return res.status(403).json({ error: 'Unauthorized to update this job' });
    }

    const updatedJob = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await jobRef.update(updatedJob);

    res.json({ message: 'Job updated successfully', data: { id: jobId, ...updatedJob } });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const companyId = req.user.uid;
    const db = admin.firestore();

    const jobRef = db.collection('jobs').doc(jobId);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const jobData = jobDoc.data();
    if (jobData.employer !== companyId) {
      return res.status(403).json({ error: 'Unauthorized to delete this job' });
    }

    await jobRef.delete();

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get filtered applicants for a specific job using matching service
exports.getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const companyId = req.user.uid;
    const { minScore = 0, status = 'all' } = req.query;

    // Use the matching service to get applicants
    const matchingResult = await matchingService.matchStudentsToJob(jobId, 50);

    if (!matchingResult.success) {
      return res.status(500).json({ error: matchingResult.error });
    }

    let filteredMatches = matchingResult.matches;

    // Apply additional filters
    if (minScore > 0) {
      filteredMatches = filteredMatches.filter(match => match.matchScore >= parseInt(minScore));
    }

    if (status !== 'all') {
      const statusMap = {
        'qualified': match => match.compatibility === 'Good' || match.compatibility === 'Excellent',
        'highly-qualified': match => match.compatibility === 'Excellent'
      };
      if (statusMap[status]) {
        filteredMatches = filteredMatches.filter(statusMap[status]);
      }
    }

    res.json({
      job: matchingResult.job,
      applicants: filteredMatches,
      totalApplicants: matchingResult.totalStudents,
      filteredCount: filteredMatches.length
    });
  } catch (error) {
    console.error('Error fetching job applicants:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get company profile
exports.getCompanyProfile = async (req, res) => {
  try {
    const companyId = req.user.id;
    const profile = {
      companyName: 'Tech Innovations Inc.',
      industry: 'Information Technology',
      size: '100-500',
      website: 'https://techinnovations.com',
      description: 'Leading technology company specializing in innovative solutions.',
      contactEmail: 'hr@techinnovations.com',
      phone: '+1-555-0123',
      address: '123 Tech Street, Silicon Valley, CA',
      foundedYear: '2015',
      logo: '',
      linkedin: 'https://linkedin.com/company/techinnovations',
      twitter: 'https://twitter.com/techinnovations',
      facebook: 'https://facebook.com/techinnovations',
      benefits: 'Health insurance, 401k matching, flexible work hours, professional development budget',
      culture: 'We foster innovation, collaboration, and work-life balance. Our team values diversity and continuous learning.'
    };
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update company profile
exports.updateCompanyProfile = async (req, res) => {
  try {
    const companyId = req.user.id;
    const profileData = req.body;
    res.json({ message: 'Company profile updated successfully', data: profileData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Schedule interview for applicant
exports.scheduleInterview = async (req, res) => {
  try {
    const { applicantId, jobId } = req.body;
    const companyId = req.user.id;
    res.json({ message: 'Interview scheduled successfully', data: { applicantId, jobId, scheduled: true } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get applicant details
exports.getApplicantDetails = async (req, res) => {
  try {
    const { applicantId } = req.params;
    const companyId = req.user.id;
    // Mock student data - replace with database query
    const student = {
      id: applicantId,
      name: 'John Doe',
      email: 'john@example.com',
      university: 'National University of Lesotho',
      course: 'Computer Science',
      year: '4th Year',
      gpa: 3.8,
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: '3 years software development',
      certificates: ['AWS Certified', 'Google Cloud Professional'],
      resume: 'path/to/resume.pdf',
      bio: 'Passionate software developer with experience in full-stack development.'
    };
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
