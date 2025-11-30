const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const NotificationService = require('./NotificationService');

module.exports = {
  // Application submission logic
  async submitApplication(applicationData, userId) {
    try {
      const { jobId, coverLetter, resume, additionalInfo } = applicationData;

      // Validate job exists and is active
      const job = await Job.findById(jobId);
      if (!job || job.status !== 'active') {
        throw new Error('Job not found or no longer available');
      }

      // Check if user has already applied
      const existingApplication = await Application.findOne({
        user: userId,
        job: jobId
      });

      if (existingApplication) {
        throw new Error('You have already applied to this job');
      }

      // Check application deadline
      if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
        throw new Error('Application deadline has passed');
      }

      // Check if user profile is complete enough
      const user = await User.findById(userId);
      if (user.profileCompletion < 60) {
        throw new Error('Please complete your profile before applying (minimum 60% complete)');
      }

      // Create application
      const application = await Application.create({
        user: userId,
        job: jobId,
        employer: job.employer,
        coverLetter,
        resume: resume || user.resume,
        additionalInfo,
        status: 'submitted',
        appliedDate: new Date()
      });

      // Update job application count
      await Job.findByIdAndUpdate(jobId, {
        $inc: { applicationCount: 1 }
      });

      // Send notifications
      await NotificationService.sendApplicationSubmitted(application);
      await NotificationService.sendNewApplicationAlert(job.employer, application);

      // Populate and return application
      const populatedApplication = await Application.findById(application._id)
        .populate('user', 'name email university course')
        .populate('job', 'title company')
        .populate('employer', 'companyName');

      return {
        success: true,
        application: populatedApplication,
        message: 'Application submitted successfully'
      };

    } catch (error) {
      console.error('Application submission error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Application status update logic
  async updateApplicationStatus(applicationId, statusData, employerId) {
    try {
      const { status, feedback, interviewDate } = statusData;

      const application = await Application.findById(applicationId)
        .populate('user', 'name email notificationSettings')
        .populate('job', 'title company');

      if (!application) {
        throw new Error('Application not found');
      }

      // Verify employer owns this application
      if (application.employer.toString() !== employerId) {
        throw new Error('Not authorized to update this application');
      }

      // Validate status transition
      const validTransitions = {
        submitted: ['under_review', 'rejected'],
        under_review: ['interview', 'rejected'],
        interview: ['approved', 'rejected'],
        approved: [],
        rejected: []
      };

      if (!validTransitions[application.status]?.includes(status)) {
        throw new Error(`Invalid status transition from ${application.status} to ${status}`);
      }

      // Update application
      const updateData = { status };
      if (feedback) updateData.feedback = feedback;
      if (interviewDate) updateData.interviewDate = interviewDate;
      if (status === 'under_review') updateData.reviewedDate = new Date();

      const updatedApplication = await Application.findByIdAndUpdate(
        applicationId,
        updateData,
        { new: true, runValidators: true }
      ).populate('user', 'name email')
       .populate('job', 'title company');

      // Send appropriate notification
      switch (status) {
        case 'under_review':
          await NotificationService.sendApplicationUnderReview(updatedApplication);
          break;
        case 'interview':
          await NotificationService.sendInterviewScheduled(updatedApplication);
          break;
        case 'approved':
          await NotificationService.sendApplicationApproved(updatedApplication);
          break;
        case 'rejected':
          await NotificationService.sendApplicationRejected(updatedApplication);
          break;
      }

      return {
        success: true,
        application: updatedApplication,
        message: `Application status updated to ${status}`
      };

    } catch (error) {
      console.error('Application status update error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Application filtering and search logic
  async getApplications(filters = {}, user) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        jobId,
        dateFrom,
        dateTo,
        sortBy = 'appliedDate',
        sortOrder = 'desc'
      } = filters;

      // Build base filter based on user role
      let baseFilter = {};

      if (user.role === 'student') {
        baseFilter.user = user.id;
      } else if (user.role === 'employer') {
        const employerJobs = await Job.find({ employer: user.id }).select('_id');
        baseFilter.job = { $in: employerJobs.map(job => job._id) };
      }

      // Apply additional filters
      if (status) baseFilter.status = status;
      if (jobId) baseFilter.job = jobId;
      if (dateFrom || dateTo) {
        baseFilter.appliedDate = {};
        if (dateFrom) baseFilter.appliedDate.$gte = new Date(dateFrom);
        if (dateTo) baseFilter.appliedDate.$lte = new Date(dateTo);
      }

      // Sort configuration
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const applications = await Application.find(baseFilter)
        .populate('user', 'name email university course phone skills')
        .populate('job', 'title company location type')
        .populate('employer', 'companyName logo')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Application.countDocuments(baseFilter);

      return {
        success: true,
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Get applications error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Application analytics logic
  async getApplicationStats(userId, userRole, timeRange = '30d') {
    try {
      let filter = {};
      const now = new Date();
      let startDate = new Date();

      // Calculate date range
      switch (timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      filter.appliedDate = { $gte: startDate };

      // Role-based filtering
      if (userRole === 'student') {
        filter.user = userId;
      } else if (userRole === 'employer') {
        const employerJobs = await Job.find({ employer: userId }).select('_id');
        filter.job = { $in: employerJobs.map(job => job._id) };
      }

      // Get status distribution
      const statusStats = await Application.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get applications over time (for charts)
      const timelineStats = await Application.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$appliedDate' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Get top jobs with most applications (for employers)
      let topJobs = [];
      if (userRole === 'employer') {
        topJobs = await Application.aggregate([
          { $match: filter },
          {
            $group: {
              _id: '$job',
              applicationCount: { $sum: 1 }
            }
          },
          {
            $lookup: {
              from: 'jobs',
              localField: '_id',
              foreignField: '_id',
              as: 'jobDetails'
            }
          },
          { $unwind: '$jobDetails' },
          {
            $project: {
              jobTitle: '$jobDetails.title',
              applicationCount: 1
            }
          },
          { $sort: { applicationCount: -1 } },
          { $limit: 5 }
        ]);
      }

      // Calculate conversion rate (for employers)
      let conversionRate = 0;
      if (userRole === 'employer') {
        const totalApplications = await Application.countDocuments(filter);
        const approvedApplications = await Application.countDocuments({
          ...filter,
          status: 'approved'
        });
        conversionRate = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;
      }

      return {
        success: true,
        stats: {
          total: statusStats.reduce((sum, stat) => sum + stat.count, 0),
          byStatus: statusStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {}),
          timeline: timelineStats,
          topJobs,
          conversionRate: Math.round(conversionRate * 100) / 100
        }
      };

    } catch (error) {
      console.error('Get application stats error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Application withdrawal logic
  async withdrawApplication(applicationId, userId) {
    try {
      const application = await Application.findById(applicationId);

      if (!application) {
        throw new Error('Application not found');
      }

      // Verify user owns the application
      if (application.user.toString() !== userId) {
        throw new Error('Not authorized to withdraw this application');
      }

      // Check if application can be withdrawn
      if (!['submitted', 'under_review'].includes(application.status)) {
        throw new Error('Cannot withdraw application in current status');
      }

      // Update application status
      const withdrawnApplication = await Application.findByIdAndUpdate(
        applicationId,
        { status: 'withdrawn', updatedAt: new Date() },
        { new: true }
      ).populate('job', 'title company');

      // Send notification to employer
      await NotificationService.sendApplicationWithdrawn(withdrawnApplication);

      return {
        success: true,
        application: withdrawnApplication,
        message: 'Application withdrawn successfully'
      };

    } catch (error) {
      console.error('Withdraw application error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Bulk application status update (for employers)
  async bulkUpdateApplications(applicationIds, statusData, employerId) {
    try {
      const { status, feedback } = statusData;

      // Verify all applications belong to this employer
      const applications = await Application.find({
        _id: { $in: applicationIds },
        employer: employerId
      });

      if (applications.length !== applicationIds.length) {
        throw new Error('Some applications not found or not authorized');
      }

      // Update all applications
      const updateResult = await Application.updateMany(
        { _id: { $in: applicationIds } },
        {
          status,
          feedback: feedback || '',
          updatedAt: new Date()
        }
      );

      // Send bulk notifications
      const updatedApplications = await Application.find({
        _id: { $in: applicationIds }
      }).populate('user', 'name email');

      for (const application of updatedApplications) {
        await NotificationService.sendApplicationStatusUpdate(application, status);
      }

      return {
        success: true,
        updatedCount: updateResult.modifiedCount,
        message: `Updated ${updateResult.modifiedCount} applications to ${status}`
      };

    } catch (error) {
      console.error('Bulk update applications error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Application matching logic (for job recommendations)
  async findMatchingApplications(jobId, limit = 10) {
    try {
      const job = await Job.findById(jobId)
        .populate('employer', 'companyName');

      if (!job) {
        throw new Error('Job not found');
      }

      // Find students whose skills match job requirements
      const matchingApplications = await Application.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userData'
          }
        },
        { $unwind: '$userData' },
        {
          $match: {
            'userData.role': 'student',
            'userData.isActive': true,
            'userData.skills': { $in: job.requiredSkills }
          }
        },
        {
          $addFields: {
            matchScore: {
              $size: {
                $setIntersection: ['$userData.skills', job.requiredSkills]
              }
            }
          }
        },
        { $sort: { matchScore: -1 } },
        { $limit: limit }
      ]);

      return {
        success: true,
        job: job.title,
        company: job.employer.companyName,
        matches: matchingApplications.map(app => ({
          applicationId: app._id,
          studentName: app.userData.name,
          university: app.userData.university,
          course: app.userData.course,
          skills: app.userData.skills,
          matchScore: app.matchScore,
          matchPercentage: Math.round((app.matchScore / job.requiredSkills.length) * 100)
        }))
      };

    } catch (error) {
      console.error('Find matching applications error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};