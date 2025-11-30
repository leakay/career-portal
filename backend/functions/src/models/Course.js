class Course {
    constructor(data = {}) {
      this.id = data.id || null;
      this.name = data.name || '';
      this.code = data.code || '';
      this.description = data.description || '';
      this.institution = data.institution || null;
      this.department = data.department || '';
      this.level = data.level || 'undergraduate';
      this.duration = data.duration || '';
      this.credits = data.credits || 0;
      this.fees = data.fees || {};
      this.requirements = data.requirements || [];
      this.curriculum = data.curriculum || [];
      this.careerOpportunities = data.careerOpportunities || [];
      this.intakePeriods = data.intakePeriods || [];
      this.applicationDeadline = data.applicationDeadline || null;
      this.contactInfo = data.contactInfo || {};
      this.isActive = data.isActive !== undefined ? data.isActive : true;
      this.featured = data.featured || false;
      this.popularity = data.popularity || 0;
      this.rating = data.rating || 0;
      this.totalReviews = data.totalReviews || 0;
      this.createdAt = data.createdAt || new Date();
      this.updatedAt = data.updatedAt || new Date();
    }
  
    // Validation methods
    isValid() {
      const errors = [];
  
      if (!this.name || this.name.length < 3) {
        errors.push('Course name must be at least 3 characters');
      }
      if (!this.code) errors.push('Course code is required');
      if (!this.description || this.description.length < 50) {
        errors.push('Course description must be at least 50 characters');
      }
      if (!this.institution) errors.push('Institution is required');
      if (!this.isValidLevel(this.level)) {
        errors.push('Invalid course level');
      }
      if (!this.duration) errors.push('Duration is required');
      if (this.credits < 0) errors.push('Credits cannot be negative');
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    isValidLevel(level) {
      const validLevels = ['certificate', 'diploma', 'undergraduate', 'postgraduate', 'phd'];
      return validLevels.includes(level);
    }
  
    // Fee management methods
    setFees(localFee, internationalFee = null, currency = 'M') {
      this.fees = {
        local: { amount: localFee, currency },
        international: internationalFee ? { amount: internationalFee, currency } : null
      };
      return this;
    }
  
    getLocalFee() {
      return this.fees.local ? `${this.fees.local.currency} ${this.fees.local.amount}` : 'Not specified';
    }
  
    // Application methods
    canApply() {
      if (!this.isActive) return false;
      if (!this.applicationDeadline) return true;
      return new Date(this.applicationDeadline) > new Date();
    }
  
    getApplicationStatus() {
      if (!this.isActive) return 'closed';
      if (this.applicationDeadline && new Date(this.applicationDeadline) < new Date()) {
        return 'deadline_passed';
      }
      return 'open';
    }
  
    daysUntilDeadline() {
      if (!this.applicationDeadline) return null;
      const deadline = new Date(this.applicationDeadline);
      const today = new Date();
      const diffTime = deadline - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  
    // Rating methods
    addRating(rating, review) {
      const newTotalRating = (this.rating * this.totalReviews) + rating;
      this.totalReviews += 1;
      this.rating = newTotalRating / this.totalReviews;
      return this;
    }
  
    getRatingStars() {
      const fullStars = Math.floor(this.rating);
      const halfStar = this.rating % 1 >= 0.5 ? 1 : 0;
      const emptyStars = 5 - fullStars - halfStar;
  
      return {
        full: fullStars,
        half: halfStar,
        empty: emptyStars,
        display: '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars)
      };
    }
  
    // Career opportunity methods
    addCareerOpportunity(opportunity) {
      if (!this.careerOpportunities.includes(opportunity)) {
        this.careerOpportunities.push(opportunity);
      }
      return this;
    }
  
    removeCareerOpportunity(opportunity) {
      this.careerOpportunities = this.careerOpportunities.filter(opp => opp !== opportunity);
      return this;
    }
  
    // Curriculum methods
    addModule(moduleName, credits = 0) {
      this.curriculum.push({
        module: moduleName,
        credits: credits
      });
      return this;
    }
  
    getTotalCurriculumCredits() {
      return this.curriculum.reduce((total, module) => total + (module.credits || 0), 0);
    }
  
    // Utility methods
    getLevelInfo() {
      const levelInfo = {
        certificate: { label: 'Certificate', color: 'info', duration: '6-12 months' },
        diploma: { label: 'Diploma', color: 'primary', duration: '1-2 years' },
        undergraduate: { label: 'Undergraduate', color: 'success', duration: '3-4 years' },
        postgraduate: { label: 'Postgraduate', color: 'warning', duration: '1-2 years' },
        phd: { label: 'PhD', color: 'danger', duration: '3-5 years' }
      };
      return levelInfo[this.level] || levelInfo.undergraduate;
    }
  
    isFeatured() {
      return this.featured && this.isActive;
    }
  
    incrementPopularity() {
      this.popularity += 1;
      this.updatedAt = new Date();
      return this;
    }
  
    // Serialization methods
    toJSON() {
      return {
        id: this.id,
        name: this.name,
        code: this.code,
        description: this.description,
        institution: this.institution,
        department: this.department,
        level: this.level,
        levelInfo: this.getLevelInfo(),
        duration: this.duration,
        credits: this.credits,
        fees: this.fees,
        requirements: this.requirements,
        curriculum: this.curriculum,
        careerOpportunities: this.careerOpportunities,
        intakePeriods: this.intakePeriods,
        applicationDeadline: this.applicationDeadline,
        contactInfo: this.contactInfo,
        isActive: this.isActive,
        featured: this.featured,
        popularity: this.popularity,
        rating: this.rating,
        totalReviews: this.totalReviews,
        canApply: this.canApply(),
        applicationStatus: this.getApplicationStatus(),
        daysUntilDeadline: this.daysUntilDeadline(),
        ratingStars: this.getRatingStars(),
        totalCurriculumCredits: this.getTotalCurriculumCredits(),
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    }
  
    // Static methods
    static createFromRequest(req) {
      return new Course({
        name: req.body.name,
        code: req.body.code,
        description: req.body.description,
        institution: req.body.institution,
        department: req.body.department,
        level: req.body.level,
        duration: req.body.duration,
        credits: req.body.credits,
        fees: req.body.fees,
        requirements: req.body.requirements || [],
        curriculum: req.body.curriculum || [],
        careerOpportunities: req.body.careerOpportunities || [],
        intakePeriods: req.body.intakePeriods || [],
        applicationDeadline: req.body.applicationDeadline,
        contactInfo: req.body.contactInfo || {}
      });
    }
  
    static getLevelOptions() {
      return [
        { value: 'certificate', label: 'Certificate' },
        { value: 'diploma', label: 'Diploma' },
        { value: 'undergraduate', label: 'Undergraduate' },
        { value: 'postgraduate', label: 'Postgraduate' },
        { value: 'phd', label: 'PhD' }
      ];
    }
  
    static getIntakePeriods() {
      return ['January', 'May', 'September'];
    }
  }
  
  module.exports = Course;