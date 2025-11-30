class Application {
    constructor(data = {}) {
      this.id = data.id || null;
      this.user = data.user || null;
      this.job = data.job || null;
      this.employer = data.employer || null;
      this.coverLetter = data.coverLetter || '';
      this.resume = data.resume || '';
      this.additionalInfo = data.additionalInfo || '';
      this.status = data.status || 'submitted';
      this.appliedDate = data.appliedDate || new Date();
      this.reviewedDate = data.reviewedDate || null;
      this.interviewDate = data.interviewDate || null;
      this.feedback = data.feedback || '';
      this.notes = data.notes || '';
      this.createdAt = data.createdAt || new Date();
      this.updatedAt = data.updatedAt || new Date();
    }
  
    // Validation methods
    isValid() {
      const errors = [];
  
      if (!this.user) errors.push('User is required');
      if (!this.job) errors.push('Job is required');
      if (!this.coverLetter || this.coverLetter.length < 50) {
        errors.push('Cover letter must be at least 50 characters');
      }
      if (!this.resume) errors.push('Resume is required');
      if (!this.isValidStatus(this.status)) {
        errors.push('Invalid application status');
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    isValidStatus(status) {
      const validStatuses = ['submitted', 'under_review', 'interview', 'approved', 'rejected'];
      return validStatuses.includes(status);
    }
  
    // Status management methods
    markAsUnderReview() {
      if (this.status === 'submitted') {
        this.status = 'under_review';
        this.reviewedDate = new Date();
        this.updatedAt = new Date();
        return true;
      }
      return false;
    }
  
    scheduleInterview(date) {
      if (this.status === 'under_review' || this.status === 'submitted') {
        this.status = 'interview';
        this.interviewDate = date;
        this.updatedAt = new Date();
        return true;
      }
      return false;
    }
  
    approve() {
      if (this.status === 'interview' || this.status === 'under_review') {
        this.status = 'approved';
        this.updatedAt = new Date();
        return true;
      }
      return false;
    }
  
    reject(feedback = '') {
      if (this.status !== 'approved' && this.status !== 'rejected') {
        this.status = 'rejected';
        this.feedback = feedback;
        this.updatedAt = new Date();
        return true;
      }
      return false;
    }
  
    // Utility methods
    getStatusInfo() {
      const statusInfo = {
        submitted: { label: 'Submitted', color: 'secondary', icon: '📤' },
        under_review: { label: 'Under Review', color: 'warning', icon: '👀' },
        interview: { label: 'Interview', color: 'info', icon: '📅' },
        approved: { label: 'Approved', color: 'success', icon: '✅' },
        rejected: { label: 'Not Selected', color: 'danger', icon: '❌' }
      };
      return statusInfo[this.status] || statusInfo.submitted;
    }
  
    isPending() {
      return ['submitted', 'under_review', 'interview'].includes(this.status);
    }
  
    isProcessed() {
      return ['approved', 'rejected'].includes(this.status);
    }
  
    getDaysSinceApplied() {
      const applied = new Date(this.appliedDate);
      const today = new Date();
      const diffTime = Math.abs(today - applied);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  
    // Serialization methods
    toJSON() {
      return {
        id: this.id,
        user: this.user,
        job: this.job,
        employer: this.employer,
        coverLetter: this.coverLetter,
        resume: this.resume,
        additionalInfo: this.additionalInfo,
        status: this.status,
        appliedDate: this.appliedDate,
        reviewedDate: this.reviewedDate,
        interviewDate: this.interviewDate,
        feedback: this.feedback,
        notes: this.notes,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        statusInfo: this.getStatusInfo(),
        isPending: this.isPending(),
        isProcessed: this.isProcessed(),
        daysSinceApplied: this.getDaysSinceApplied()
      };
    }
  
    // Static methods
    static createFromRequest(req) {
      return new Application({
        user: req.user.id,
        job: req.body.jobId,
        employer: req.body.employerId,
        coverLetter: req.body.coverLetter,
        resume: req.body.resume || req.user.resume,
        additionalInfo: req.body.additionalInfo
      });
    }
  
    static getStatusOptions() {
      return [
        { value: 'submitted', label: 'Submitted' },
        { value: 'under_review', label: 'Under Review' },
        { value: 'interview', label: 'Interview' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
      ];
    }
  }
  
  module.exports = Application;