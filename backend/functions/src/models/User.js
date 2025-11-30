class User {
    constructor(data = {}) {
      this.id = data.id || null;
      this.name = data.name || '';
      this.email = data.email || '';
      this.password = data.password || '';
      this.role = data.role || 'student';
      this.avatar = data.avatar || '';
      this.phone = data.phone || '';
      this.location = data.location || '';
      this.bio = data.bio || '';
      
      // Student-specific fields
      this.university = data.university || '';
      this.course = data.course || '';
      this.year = data.year || '';
      this.studentId = data.studentId || '';
      this.graduationYear = data.graduationYear || '';
      this.gpa = data.gpa || null;
      this.skills = data.skills || [];
      this.interests = data.interests || [];
      this.resume = data.resume || '';
      this.transcript = data.transcript || '';
      
      // Employer-specific fields
      this.companyName = data.companyName || '';
      this.companySize = data.companySize || '';
      this.industry = data.industry || '';
      this.website = data.website || '';
      this.companyDescription = data.companyDescription || '';
      this.companyLogo = data.companyLogo || '';
      
      // Common fields
      this.isVerified = data.isVerified || false;
      this.isActive = data.isActive !== undefined ? data.isActive : true;
      this.lastLogin = data.lastLogin || null;
      this.loginCount = data.loginCount || 0;
      this.profileCompleted = data.profileCompleted || false;
      this.notificationSettings = data.notificationSettings || {
        email: true,
        jobAlerts: true,
        applicationUpdates: true
      };
      this.createdAt = data.createdAt || new Date();
      this.updatedAt = data.updatedAt || new Date();
    }
  
    // Validation methods
    isValid() {
      const errors = [];
  
      if (!this.name || this.name.length < 2) {
        errors.push('Name must be at least 2 characters');
      }
      if (!this.isValidEmail(this.email)) {
        errors.push('Please provide a valid email');
      }
      if (!this.password || this.password.length < 6) {
        errors.push('Password must be at least 6 characters');
      }
      if (!this.isValidRole(this.role)) {
        errors.push('Invalid user role');
      }
  
      // Role-specific validations
      if (this.role === 'student' && !this.university) {
        errors.push('University is required for students');
      }
      if (this.role === 'employer' && !this.companyName) {
        errors.push('Company name is required for employers');
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  
    isValidRole(role) {
      const validRoles = ['student', 'employer', 'admin'];
      return validRoles.includes(role);
    }
  
    // Authentication methods
    validatePassword(password) {
      // In a real app, you'd compare with hashed password
      return this.password === password;
    }
  
    updateLastLogin() {
      this.lastLogin = new Date();
      this.loginCount += 1;
      this.updatedAt = new Date();
      return this;
    }
  
    // Profile completion methods
    calculateProfileCompletion() {
      let completedFields = 0;
      const totalFields = 8; // Adjust based on required fields
  
      if (this.name) completedFields++;
      if (this.email) completedFields++;
      if (this.phone) completedFields++;
      if (this.location) completedFields++;
      if (this.bio) completedFields++;
      
      if (this.role === 'student') {
        if (this.university) completedFields++;
        if (this.course) completedFields++;
        if (this.skills.length > 0) completedFields++;
      } else if (this.role === 'employer') {
        if (this.companyName) completedFields++;
        if (this.industry) completedFields++;
        if (this.companyDescription) completedFields++;
      }
  
      this.profileCompleted = (completedFields / totalFields) >= 0.8;
      return Math.round((completedFields / totalFields) * 100);
    }
  
    markProfileComplete() {
      const completionPercentage = this.calculateProfileCompletion();
      this.profileCompleted = completionPercentage >= 80;
      return completionPercentage;
    }
  
    // Student-specific methods
    addSkill(skill) {
      if (!this.skills.includes(skill)) {
        this.skills.push(skill);
        this.updatedAt = new Date();
      }
      return this;
    }
  
    removeSkill(skill) {
      this.skills = this.skills.filter(s => s !== skill);
      this.updatedAt = new Date();
      return this;
    }
  
    hasSkill(skill) {
      return this.skills.includes(skill);
    }
  
    getAcademicLevel() {
      if (!this.year) return 'Unknown';
      
      const yearMap = {
        '1': 'First Year',
        '2': 'Second Year',
        '3': 'Third Year',
        '4': 'Fourth Year',
        '5': 'Final Year'
      };
      return yearMap[this.year] || this.year;
    }
  
    isGraduatingSoon() {
      if (!this.graduationYear) return false;
      const currentYear = new Date().getFullYear();
      return this.graduationYear <= currentYear + 1;
    }
  
    // Employer-specific methods
    setCompanyInfo(companyData) {
      this.companyName = companyData.name || this.companyName;
      this.companySize = companyData.size || this.companySize;
      this.industry = companyData.industry || this.industry;
      this.website = companyData.website || this.website;
      this.companyDescription = companyData.description || this.companyDescription;
      this.companyLogo = companyData.logo || this.companyLogo;
      this.updatedAt = new Date();
      return this;
    }
  
    getCompanySizeLabel() {
      const sizeMap = {
        '1-10': 'Small (1-10 employees)',
        '11-50': 'Medium (11-50 employees)',
        '51-200': 'Large (51-200 employees)',
        '201-500': 'Enterprise (201-500 employees)',
        '501+': 'Corporate (500+ employees)'
      };
      return sizeMap[this.companySize] || this.companySize;
    }
  
    // Role-based utility methods
    isStudent() {
      return this.role === 'student';
    }
  
    isEmployer() {
      return this.role === 'employer';
    }
  
    isAdmin() {
      return this.role === 'admin';
    }
  
    canPostJobs() {
      return this.isEmployer() || this.isAdmin();
    }
  
    canApplyForJobs() {
      return this.isStudent();
    }
  
    canManageUsers() {
      return this.isAdmin();
    }
  
    // Notification methods
    updateNotificationSettings(settings) {
      this.notificationSettings = { ...this.notificationSettings, ...settings };
      this.updatedAt = new Date();
      return this;
    }
  
    shouldReceiveEmailNotifications() {
      return this.notificationSettings.email && this.isActive;
    }
  
    shouldReceiveJobAlerts() {
      return this.notificationSettings.jobAlerts && this.isStudent() && this.isActive;
    }
  
    // File management methods
    updateResume(resumeUrl) {
      this.resume = resumeUrl;
      this.updatedAt = new Date();
      return this;
    }
  
    updateTranscript(transcriptUrl) {
      this.transcript = transcriptUrl;
      this.updatedAt = new Date();
      return this;
    }
  
    updateAvatar(avatarUrl) {
      this.avatar = avatarUrl;
      this.updatedAt = new Date();
      return this;
    }
  
    // Utility methods
    getInitials() {
      return this.name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase();
    }
  
    getRoleInfo() {
      const roleInfo = {
        student: { label: 'Student', color: 'primary', icon: '🎓' },
        employer: { label: 'Employer', color: 'success', icon: '💼' },
        admin: { label: 'Administrator', color: 'danger', icon: '⚙️' }
      };
      return roleInfo[this.role] || roleInfo.student;
    }
  
    isProfilePublic() {
      return this.isActive && this.profileCompleted;
    }
  
    // Serialization methods (exclude sensitive data)
    toJSON() {
      return {
        id: this.id,
        name: this.name,
        email: this.email,
        role: this.role,
        roleInfo: this.getRoleInfo(),
        avatar: this.avatar,
        phone: this.phone,
        location: this.location,
        bio: this.bio,
        university: this.university,
        course: this.course,
        year: this.year,
        academicLevel: this.getAcademicLevel(),
        studentId: this.studentId,
        graduationYear: this.graduationYear,
        gpa: this.gpa,
        skills: this.skills,
        interests: this.interests,
        resume: this.resume,
        transcript: this.transcript,
        companyName: this.companyName,
        companySize: this.companySize,
        companySizeLabel: this.getCompanySizeLabel(),
        industry: this.industry,
        website: this.website,
        companyDescription: this.companyDescription,
        companyLogo: this.companyLogo,
        isVerified: this.isVerified,
        isActive: this.isActive,
        lastLogin: this.lastLogin,
        loginCount: this.loginCount,
        profileCompleted: this.profileCompleted,
        profileCompletion: this.calculateProfileCompletion(),
        notificationSettings: this.notificationSettings,
        isStudent: this.isStudent(),
        isEmployer: this.isEmployer(),
        isAdmin: this.isAdmin(),
        canPostJobs: this.canPostJobs(),
        canApplyForJobs: this.canApplyForJobs(),
        canManageUsers: this.canManageUsers(),
        isGraduatingSoon: this.isGraduatingSoon(),
        isProfilePublic: this.isProfilePublic(),
        initials: this.getInitials(),
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    }
  
    // Static methods
    static createFromRequest(req) {
      return new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role || 'student',
        phone: req.body.phone,
        location: req.body.location,
        university: req.body.university,
        course: req.body.course,
        year: req.body.year,
        companyName: req.body.companyName,
        industry: req.body.industry
      });
    }
  
    static getRoleOptions() {
      return [
        { value: 'student', label: 'Student' },
        { value: 'employer', label: 'Employer' },
        { value: 'admin', label: 'Administrator' }
      ];
    }
  
    static getUniversityOptions() {
      return [
        'National University of Lesotho',
        'Limkokwing University',
        'Botho University'
      ];
    }
  
    static getCompanySizeOptions() {
      return [
        { value: '1-10', label: 'Small (1-10 employees)' },
        { value: '11-50', label: 'Medium (11-50 employees)' },
        { value: '51-200', label: 'Large (51-200 employees)' },
        { value: '201-500', label: 'Enterprise (201-500 employees)' },
        { value: '501+', label: 'Corporate (500+ employees)' }
      ];
    }
  }
  
  module.exports = User;