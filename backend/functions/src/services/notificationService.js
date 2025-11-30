const nodemailer = require('nodemailer');
const webpush = require('web-push');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Email transporter configuration
const emailTransporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Web Push configuration (for browser notifications)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:careerportal@nul.ls',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

module.exports = {
  // Email Notifications
  email: {
    // Application submitted notification
    async sendApplicationSubmitted(application) {
      try {
        const student = await User.findById(application.user);
        const job = await Job.findById(application.job).populate('employer', 'companyName');

        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: student.email,
          subject: 'Application Submitted Successfully',
          template: 'application-submitted',
          context: {
            studentName: student.name,
            jobTitle: job.title,
            companyName: job.employer.companyName,
            applicationDate: new Date().toLocaleDateString(),
            applicationId: application._id
          }
        };

        await this.sendEmail(mailOptions);
        
        // Log notification
        await this.logNotification({
          type: 'email',
          recipient: student._id,
          title: 'Application Submitted',
          message: `Your application for ${job.title} at ${job.employer.companyName} has been submitted successfully.`,
          relatedEntity: {
            type: 'application',
            id: application._id
          }
        });

        return { success: true };
      } catch (error) {
        console.error('Application submitted email error:', error);
        return { success: false, error: error.message };
      }
    },

    // New application alert for employer
    async sendNewApplicationAlert(employerId, application) {
      try {
        const employer = await User.findById(employerId);
        const student = await User.findById(application.user);
        const job = await Job.findById(application.job);

        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: employer.email,
          subject: 'New Job Application Received',
          template: 'new-application',
          context: {
            employerName: employer.companyName,
            studentName: student.name,
            jobTitle: job.title,
            studentUniversity: student.university,
            studentCourse: student.course,
            applicationDate: new Date().toLocaleDateString()
          }
        };

        await this.sendEmail(mailOptions);
        
        await this.logNotification({
          type: 'email',
          recipient: employer._id,
          title: 'New Application',
          message: `${student.name} applied for ${job.title}`,
          relatedEntity: {
            type: 'application',
            id: application._id
          }
        });

        return { success: true };
      } catch (error) {
        console.error('New application alert email error:', error);
        return { success: false, error: error.message };
      }
    },

    // Application status update
    async sendApplicationStatusUpdate(application, status) {
      try {
        const student = await User.findById(application.user);
        const job = await Job.findById(application.job).populate('employer', 'companyName');

        const statusTemplates = {
          'under_review': {
            subject: 'Application Under Review',
            template: 'application-under-review'
          },
          'interview': {
            subject: 'Interview Invitation',
            template: 'interview-scheduled'
          },
          'approved': {
            subject: 'Application Approved!',
            template: 'application-approved'
          },
          'rejected': {
            subject: 'Application Update',
            template: 'application-rejected'
          }
        };

        const template = statusTemplates[status];
        if (!template) return { success: false, error: 'Invalid status' };

        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: student.email,
          subject: template.subject,
          template: template.template,
          context: {
            studentName: student.name,
            jobTitle: job.title,
            companyName: job.employer.companyName,
            status: status,
            feedback: application.feedback || '',
            interviewDate: application.interviewDate || ''
          }
        };

        await this.sendEmail(mailOptions);
        
        await this.logNotification({
          type: 'email',
          recipient: student._id,
          title: template.subject,
          message: `Your application for ${job.title} has been updated to ${status}.`,
          relatedEntity: {
            type: 'application',
            id: application._id
          }
        });

        return { success: true };
      } catch (error) {
        console.error('Application status email error:', error);
        return { success: false, error: error.message };
      }
    },

    // Course application confirmation
    async sendCourseApplicationConfirmation(application) {
      try {
        const { firstName, lastName, email, university, course } = application;

        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: email,
          subject: 'Course Application Received',
          template: 'course-application',
          context: {
            firstName,
            lastName,
            university,
            course,
            applicationDate: new Date().toLocaleDateString(),
            applicationId: application._id
          }
        };

        await this.sendEmail(mailOptions);

        return { success: true };
      } catch (error) {
        console.error('Course application email error:', error);
        return { success: false, error: error.message };
      }
    },

    // Job alert notifications
    async sendJobAlerts(studentId, matchingJobs) {
      try {
        const student = await User.findById(studentId);
        
        if (!student.notificationSettings.jobAlerts) {
          return { success: false, error: 'Job alerts disabled' };
        }

        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: student.email,
          subject: `New Job Matches - ${matchingJobs.length} Opportunities`,
          template: 'job-alerts',
          context: {
            studentName: student.name,
            jobs: matchingJobs.slice(0, 5), // Limit to 5 jobs
            totalMatches: matchingJobs.length,
            alertDate: new Date().toLocaleDateString()
          }
        };

        await this.sendEmail(mailOptions);

        await this.logNotification({
          type: 'email',
          recipient: student._id,
          title: 'New Job Matches',
          message: `We found ${matchingJobs.length} new jobs matching your profile.`,
          relatedEntity: { type: 'job_alert' }
        });

        return { success: true };
      } catch (error) {
        console.error('Job alert email error:', error);
        return { success: false, error: error.message };
      }
    },

    // Generic email sender
    async sendEmail(mailOptions) {
      try {
        // In production, use a template engine like Handlebars
        const htmlContent = this.generateEmailHTML(mailOptions.template, mailOptions.context);
        
        const emailData = {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: htmlContent,
          text: this.generateEmailText(mailOptions.template, mailOptions.context)
        };

        await emailTransporter.sendMail(emailData);
        return { success: true };
      } catch (error) {
        console.error('Email sending error:', error);
        throw error;
      }
    }
  },

  // Push Notifications
  push: {
    // Subscribe user to push notifications
    async subscribeUser(userId, subscription) {
      try {
        await User.findByIdAndUpdate(userId, {
          $addToSet: { pushSubscriptions: subscription }
        });
        
        return { success: true };
      } catch (error) {
        console.error('Push subscription error:', error);
        return { success: false, error: error.message };
      }
    },

    // Unsubscribe user from push notifications
    async unsubscribeUser(userId, endpoint) {
      try {
        await User.findByIdAndUpdate(userId, {
          $pull: { pushSubscriptions: { endpoint } }
        });
        
        return { success: true };
      } catch (error) {
        console.error('Push unsubscription error:', error);
        return { success: false, error: error.message };
      }
    },

    // Send push notification
    async sendPushNotification(userId, notificationData) {
      try {
        const user = await User.findById(userId);
        if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
          return { success: false, error: 'No push subscriptions found' };
        }

        const payload = JSON.stringify({
          title: notificationData.title,
          body: notificationData.message,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data: {
            url: notificationData.url || '/notifications',
            relatedEntity: notificationData.relatedEntity
          }
        });

        // Send to all user's devices
        const sendPromises = user.pushSubscriptions.map(subscription => {
          return webpush.sendNotification(subscription, payload)
            .catch(error => {
              // Remove invalid subscriptions
              if (error.statusCode === 410) {
                this.unsubscribeUser(userId, subscription.endpoint);
              }
              return null;
            });
        });

        await Promise.all(sendPromises);

        await this.logNotification({
          type: 'push',
          recipient: userId,
          title: notificationData.title,
          message: notificationData.message,
          relatedEntity: notificationData.relatedEntity
        });

        return { success: true };
      } catch (error) {
        console.error('Push notification error:', error);
        return { success: false, error: error.message };
      }
    },

    // Send bulk push notifications
    async sendBulkPushNotifications(userIds, notificationData) {
      try {
        const sendPromises = userIds.map(userId => 
          this.sendPushNotification(userId, notificationData)
        );

        const results = await Promise.all(sendPromises);
        const successful = results.filter(result => result.success).length;

        return {
          success: true,
          total: userIds.length,
          successful,
          failed: userIds.length - successful
        };
      } catch (error) {
        console.error('Bulk push notification error:', error);
        return { success: false, error: error.message };
      }
    }
  },

  // In-App Notifications
  inApp: {
    // Create in-app notification
    async createNotification(notificationData) {
      try {
        const notification = await Notification.create({
          recipient: notificationData.recipient,
          type: notificationData.type || 'info',
          title: notificationData.title,
          message: notificationData.message,
          relatedEntity: notificationData.relatedEntity,
          isRead: false,
          priority: notificationData.priority || 'normal'
        });

        // Emit real-time event (if using Socket.io)
        this.emitNotification(notification);

        return { success: true, notification };
      } catch (error) {
        console.error('Create notification error:', error);
        return { success: false, error: error.message };
      }
    },

    // Get user notifications
    async getUserNotifications(userId, options = {}) {
      try {
        const { page = 1, limit = 20, unreadOnly = false } = options;
        
        const filter = { recipient: userId };
        if (unreadOnly) filter.isRead = false;

        const notifications = await Notification.find(filter)
          .sort({ createdAt: -1 })
          .limit(limit * 1)
          .skip((page - 1) * limit);

        const total = await Notification.countDocuments(filter);
        const unreadCount = await Notification.countDocuments({
          recipient: userId,
          isRead: false
        });

        return {
          success: true,
          notifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          },
          unreadCount
        };
      } catch (error) {
        console.error('Get notifications error:', error);
        return { success: false, error: error.message };
      }
    },

    // Mark notification as read
    async markAsRead(notificationId, userId) {
      try {
        const notification = await Notification.findOneAndUpdate(
          { _id: notificationId, recipient: userId },
          { isRead: true, readAt: new Date() },
          { new: true }
        );

        if (!notification) {
          return { success: false, error: 'Notification not found' };
        }

        return { success: true, notification };
      } catch (error) {
        console.error('Mark as read error:', error);
        return { success: false, error: error.message };
      }
    },

    // Mark all notifications as read
    async markAllAsRead(userId) {
      try {
        const result = await Notification.updateMany(
          { recipient: userId, isRead: false },
          { isRead: true, readAt: new Date() }
        );

        return {
          success: true,
          modifiedCount: result.modifiedCount
        };
      } catch (error) {
        console.error('Mark all as read error:', error);
        return { success: false, error: error.message };
      }
    },

    // Delete notification
    async deleteNotification(notificationId, userId) {
      try {
        const notification = await Notification.findOneAndDelete({
          _id: notificationId,
          recipient: userId
        });

        if (!notification) {
          return { success: false, error: 'Notification not found' };
        }

        return { success: true };
      } catch (error) {
        console.error('Delete notification error:', error);
        return { success: false, error: error.message };
      }
    }
  },

  // Notification Templates
  templates: {
    // Application status templates
    APPLICATION_SUBMITTED: {
      email: 'application-submitted',
      push: 'Your application has been submitted successfully',
      inApp: 'Application submitted'
    },
    APPLICATION_UNDER_REVIEW: {
      email: 'application-under-review',
      push: 'Your application is under review',
      inApp: 'Application under review'
    },
    INTERVIEW_SCHEDULED: {
      email: 'interview-scheduled',
      push: 'Interview scheduled for your application',
      inApp: 'Interview scheduled'
    },
    APPLICATION_APPROVED: {
      email: 'application-approved',
      push: 'Congratulations! Your application has been approved',
      inApp: 'Application approved'
    },
    APPLICATION_REJECTED: {
      email: 'application-rejected',
      push: 'Update on your job application',
      inApp: 'Application status updated'
    }
  },

  // Notification Dispatcher (Main entry point)
  async dispatchNotification(notificationType, data, channels = ['email', 'inApp', 'push']) {
    try {
      const results = {};

      // Determine recipients based on notification type
      const recipients = await this.getRecipients(notificationType, data);
      
      // Send through each channel
      for (const channel of channels) {
        if (this[channel] && this[channel].send) {
          results[channel] = await this[channel].send(recipients, data);
        }
      }

      return {
        success: true,
        channels: results,
        totalRecipients: recipients.length
      };
    } catch (error) {
      console.error('Notification dispatch error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get recipients for notification type
  async getRecipients(notificationType, data) {
    switch (notificationType) {
      case 'application_submitted':
        return [data.studentId];
      
      case 'new_application':
        return [data.employerId];
      
      case 'application_status_update':
        return [data.studentId];
      
      case 'job_alert':
        return await this.getStudentsForJobAlerts(data.filters);
      
      case 'system_announcement':
        return await this.getAllActiveUsers();
      
      default:
        return [];
    }
  },

  // Get students who want job alerts
  async getStudentsForJobAlerts(filters) {
    const students = await User.find({
      role: 'student',
      isActive: true,
      'notificationSettings.jobAlerts': true,
      ...filters
    }).select('_id');
    
    return students.map(s => s._id);
  },

  // Get all active users
  async getAllActiveUsers() {
    const users = await User.find({ isActive: true }).select('_id');
    return users.map(u => u._id);
  },

  // Log notification for analytics
  async logNotification(notificationLog) {
    try {
      await NotificationLog.create({
        ...notificationLog,
        sentAt: new Date()
      });
    } catch (error) {
      console.error('Notification log error:', error);
    }
  },

  // Generate email HTML content (simplified)
  generateEmailHTML(template, context) {
    const templates = {
      'application-submitted': `
        <h2>Application Submitted Successfully</h2>
        <p>Dear ${context.studentName},</p>
        <p>Your application for <strong>${context.jobTitle}</strong> at 
        <strong>${context.companyName}</strong> has been submitted successfully.</p>
        <p>Application Date: ${context.applicationDate}</p>
        <p>We will notify you of any updates.</p>
      `,
      'new-application': `
        <h2>New Job Application Received</h2>
        <p>Hello ${context.employerName},</p>
        <p>You have received a new application for <strong>${context.jobTitle}</strong>.</p>
        <p><strong>Applicant:</strong> ${context.studentName}</p>
        <p><strong>University:</strong> ${context.studentUniversity}</p>
        <p><strong>Course:</strong> ${context.studentCourse}</p>
      `,
      'job-alerts': `
        <h2>New Job Matches for You</h2>
        <p>Hello ${context.studentName},</p>
        <p>We found ${context.totalMatches} new jobs matching your profile:</p>
        <ul>
          ${context.jobs.map(job => `
            <li>
              <strong>${job.title}</strong> at ${job.company} - ${job.location}
            </li>
          `).join('')}
        </ul>
      `
    };

    return templates[template] || '<p>Notification content</p>';
  },

  // Generate email text content
  generateEmailText(template, context) {
    // Simplified text version
    return this.generateEmailHTML(template, context)
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  },

  // Emit real-time notification (Socket.io)
  emitNotification(notification) {
    // This would integrate with your real-time system
    if (global.io) {
      global.io.to(notification.recipient.toString()).emit('notification', notification);
    }
  }
};