class Job {
    constructor(data = {}) {
      this.id = data.id || null;
      this.title = data.title || '';
      this.company = data.company || '';
      this.employer = data.employer || null;
      this.description = data.description || '';
      this.requirements = data.requirements || '';
      this.responsibilities = data.responsibilities || '';
      this.location = data.location || '';
      this.type = data.type || 'full-time';
      this.category = data.category || '';
      this.salary = data.salary || {};
      this.applicationDeadline = data.applicationDeadline || null;
      this.startDate = data.startDate || null;
      this.contactInfo = data.contactInfo || {};
      this.preferredUniversities = data.preferredUniversities || [];
      this.requiredSkills = data.requiredSkills || [];
      this.benefits = data.benefits || [];
      this.applicationProcess = data.applicationProcess || '';
      this.status = data.status || 'active';
      this.featured = data.featured || false;
      this.urgent = data.urgent || false;
      this.remote = data.remote || false;
      this.views = data.views || 0;
      this.applicationCount = data.applicationCount || 0;
      this.createdAt = data.createdAt || new Date();
      this.updatedAt = data.updatedAt || new Date();
    }
  
    // Validation methods
    isValid() {
      const errors = [];
  
      if (!this.title || this.title.length < 3) {
        errors.push('Job title must be at least 3 characters');
      }
      if (!this.company) errors.push('Company name is required');
      if (!this.description || this.description.length < 50) {
        errors.push('Job description must be at least 50 characters');
      }
      if (!this.location) errors.push('Location is required');
      if (!this.isValidType(this.type)) {
        errors.push('Invalid job type');
      }
      if (!this.isValidCategory(this.category)) {
        errors.push('Invalid job category');
      }
      if (this.applicationDeadline && new Date(this.applicationDeadline) < new Date()) {
        errors.push('Application deadline must be in the future');
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    isValidType(type) {
      const validTypes = ['full-time', 'part-time', 'contract', 'internship', 'remote', 'freelance'];
      return validTypes.includes(type);
    }
  
    isValidCategory(category) {
      const validCategories = [
        'technology', 'business', 'healthcare', 'education', 'creative', 
        'sales', 'marketing', 'engineering', 'design', 'other'
      ];
      return validCategories.includes(category);
    }
  
    // Application methods
    canApply() {
      if (this.status !== 'active') return false;
      if (!this.applicationDeadline) return true;
      return new Date(this.applicationDeadline) > new Date();
    }
  
    getApplicationStatus() {
      if (this.status !== 'active') return 'closed';
      if (this.applicationDeadline && new Date(this.applicationDeadline) < new Date()) {
        return 'expired';
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
  
    isNew() {
      const created = new Date(this.createdAt);
      const today = new Date();
      const diffTime = today - created;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
  
    // Salary methods
    setSalary(min, max, currency = 'M', period = 'monthly') {
      this.salary = {
        min: parseInt(min),
        max: parseInt(max),
        currency,
        period,
        range: `${currency} ${min} - ${max} per ${period}`
      };
      return this;
    }
  
    getSalaryRange() {
      if (!this.salary.min && !this.salary.max) return 'Negotiable';
      if (this.salary.min && !this.salary.max) return `From ${this.salary.currency} ${this.salary.min}`;
      if (!this.salary.min && this.salary.max) return `Up to ${this.salary.currency} ${this.salary.max}`;
      return `${this.salary.currency} ${this.salary.min} - ${this.salary.max} per ${this.salary.period}`;
    }
  
    getAverageSalary() {
      if (this.salary.min && this.salary.max) {
        return Math.round((this.salary.min + this.salary.max) / 2);
      }
      return null;
    }
  
    // Skill management methods
    addSkill(skill) {
      if (!this.requiredSkills.includes(skill)) {
        this.requiredSkills.push(skill);
      }
      return this;
    }
  
    removeSkill(skill) {
      this.requiredSkills = this.requiredSkills.filter(s => s !== skill);
      return this;
    }
  
    hasSkill(skill) {
      return this.requiredSkills.includes(skill);
    }
  
    // University preference methods
    addPreferredUniversity(university) {
      const validUniversities = [
        'National University of Lesotho',
        'Limkokwing University', 
        'Botho University'
      ];
      
      if (validUniversities.includes(university) && !this.preferredUniversities.includes(university)) {
        this.preferredUniversities.push(university);
      }
      return this;
    }
  
    isUniversityPreferred(university) {
      return this.preferredUniversities.length === 0 || this.preferredUniversities.includes(university);
    }
  
    // View and application tracking
    incrementViews() {
      this.views += 1;
      this.updatedAt = new Date();
      return this;
    }
  
    incrementApplications() {
      this.applicationCount += 1;
      this.updatedAt = new Date();
      return this;
    }
  
    getApplicationRate() {
      if (this.views === 0) return 0;
      return ((this.applicationCount / this.views) * 100).toFixed(1);
    }
  
    // Utility methods
    getTypeInfo() {
      const typeInfo = {
        'full-time': { label: 'Full Time', color: 'success', icon: '💼' },
        'part-time': { label: 'Part Time', color: 'info', icon: '⏰' },
        'contract': { label: 'Contract', color: 'warning', icon: '📝' },
        'internship': { label: 'Internship', color: 'primary', icon: '🎓' },
        'remote': { label: 'Remote', color: 'dark', icon: '🏠' },
        'freelance': { label: 'Freelance', color: 'secondary', icon: '🌟' }
      };
      return typeInfo[this.type] || typeInfo['full-time'];
    }
  
    getCategoryInfo() {
      const categoryInfo = {
        'technology': { label: 'Technology', color: 'primary', icon: '💻' },
        'business': { label: 'Business', color: 'success', icon: '📊' },
        'healthcare': { label: 'Healthcare', color: 'danger', icon: '🏥' },
        'education': { label: 'Education', color: 'info', icon: '📚' },
        'creative': { label: 'Creative', color: 'warning', icon: '🎨' },
        'sales': { label: 'Sales', color: 'secondary', icon: '💰' },
        'marketing': { label: 'Marketing', color: 'dark', icon: '📢' },
        'engineering': { label: 'Engineering', color: 'primary', icon: '⚙️' },
        'design': { label: 'Design', color: 'warning', icon: '✏️' },
        'other': { label: 'Other', color: 'secondary', icon: '📦' }
      };
      return categoryInfo[this.category] || categoryInfo['other'];
    }
  
    isFeatured() {
      return this.featured && this.status === 'active';
    }
  
    isUrgent() {
      return this.urgent && this.status === 'active';
    }
  
    isRemote() {
      return this.remote;
    }
  
    // Search and matching methods
    matchesSearch(query) {
      const searchableFields = [
        this.title,
        this.company,
        this.description,
        this.requirements,
        this.location,
        this.category
      ].join(' ').toLowerCase();
      
      return searchableFields.includes(query.toLowerCase());
    }
  
    matchesFilters(filters = {}) {
      if (filters.type && this.type !== filters.type) return false;
      if (filters.category && this.category !== filters.category) return false;
      if (filters.location && !this.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.remote && !this.remote) return false;
      if (filters.salaryMin && this.getAverageSalary() < parseInt(filters.salaryMin)) return false;
      if (filters.university && !this.isUniversityPreferred(filters.university)) return false;
      
      return true;
    }
  
    // Serialization methods
    toJSON() {
      return {
        id: this.id,
        title: this.title,
        company: this.company,
        employer: this.employer,
        description: this.description,
        requirements: this.requirements,
        responsibilities: this.responsibilities,
        location: this.location,
        type: this.type,
        typeInfo: this.getTypeInfo(),
        category: this.category,
        categoryInfo: this.getCategoryInfo(),
        salary: this.salary,
        salaryRange: this.getSalaryRange(),
        averageSalary: this.getAverageSalary(),
        applicationDeadline: this.applicationDeadline,
        startDate: this.startDate,
        contactInfo: this.contactInfo,
        preferredUniversities: this.preferredUniversities,
        requiredSkills: this.requiredSkills,
        benefits: this.benefits,
        applicationProcess: this.applicationProcess,
        status: this.status,
        featured: this.featured,
        urgent: this.urgent,
        remote: this.remote,
        views: this.views,
        applicationCount: this.applicationCount,
        canApply: this.canApply(),
        applicationStatus: this.getApplicationStatus(),
        daysUntilDeadline: this.daysUntilDeadline(),
        isNew: this.isNew(),
        applicationRate: this.getApplicationRate(),
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    }
  
    // Static methods
    static createFromRequest(req) {
      return new Job({
        title: req.body.title,
        company: req.body.company,
        employer: req.user.id,
        description: req.body.description,
        requirements: req.body.requirements,
        responsibilities: req.body.responsibilities,
        location: req.body.location,
        type: req.body.type,
        category: req.body.category,
        salary: req.body.salary,
        applicationDeadline: req.body.applicationDeadline,
        startDate: req.body.startDate,
        contactInfo: req.body.contactInfo,
        preferredUniversities: req.body.preferredUniversities || [],
        requiredSkills: req.body.requiredSkills || [],
        benefits: req.body.benefits || [],
        applicationProcess: req.body.applicationProcess,
        featured: req.body.featured || false,
        urgent: req.body.urgent || false,
        remote: req.body.remote || false
      });
    }
  
    static getTypeOptions() {
      return [
        { value: 'full-time', label: 'Full Time' },
        { value: 'part-time', label: 'Part Time' },
        { value: 'contract', label: 'Contract' },
        { value: 'internship', label: 'Internship' },
        { value: 'remote', label: 'Remote' },
        { value: 'freelance', label: 'Freelance' }
      ];
    }
  
    static getCategoryOptions() {
      return [
        { value: 'technology', label: 'Technology' },
        { value: 'business', label: 'Business' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'education', label: 'Education' },
        { value: 'creative', label: 'Creative' },
        { value: 'sales', label: 'Sales' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'engineering', label: 'Engineering' },
        { value: 'design', label: 'Design' },
        { value: 'other', label: 'Other' }
      ];
    }
  
    static getUniversityOptions() {
      return [
        'National University of Lesotho',
        'Limkokwing University',
        'Botho University'
      ];
    }
  }
  
  module.exports = Job;