import React, { useState } from 'react';

export default function JobApplication() {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    
    // Education
    educationLevel: '',
    institution: '',
    fieldOfStudy: '',
    graduationYear: '',
    
    // Experience
    experience: '',
    currentEmployer: '',
    currentPosition: '',
    
    // Application Details
    coverLetter: '',
    salaryExpectation: '',
    noticePeriod: '',
    
    // Documents
    resume: null,
    coverLetterFile: null,
    certificates: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const educationLevels = [
    'High School',
    'Certificate',
    'Diploma',
    'Undergraduate Degree',
    'Postgraduate Degree',
    'PhD'
  ];

  const experienceLevels = [
    'No experience',
    '0-1 years',
    '1-3 years',
    '3-5 years',
    '5-10 years',
    '10+ years'
  ];

  const noticePeriods = [
    'Immediately',
    '1 week',
    '2 weeks',
    '1 month',
    '2 months',
    '3 months'
  ];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Job application submitted:', formData);
    setSubmitted(true);
    // Here you would typically send data to your backend
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  if (submitted) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm text-center">
              <div className="card-body py-5">
                <div className="text-success mb-4">
                  <i className="bi bi-check-circle-fill" style={{ fontSize: '4rem' }}></i>
                </div>
                <h3 className="text-success mb-3">Application Submitted!</h3>
                <p className="text-muted mb-4">
                  Thank you for applying. We have received your application and will 
                  review it carefully. You will hear back from us within 5-7 business days.
                </p>
                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                  <button className="btn btn-primary me-md-2">
                    Track Application
                  </button>
                  <button className="btn btn-outline-secondary">
                    Apply to More Jobs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            {/* Header */}
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-1">
                    <i className="bi bi-briefcase me-2"></i>
                    Job Application
                  </h3>
                  <p className="mb-0 small">Software Developer at Tech Solutions Lesotho</p>
                </div>
                <div className="text-end">
                  <div className="badge bg-light text-primary p-2">Step {currentStep} of 4</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="progress mt-3" style={{ height: '6px' }}>
                <div 
                  className="progress-bar bg-light" 
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div>
                    <h5 className="text-primary mb-4">
                      <i className="bi bi-person me-2"></i>
                      Personal Information
                    </h5>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Phone Number *</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Street, City, Postal Code"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Education & Experience */}
                {currentStep === 2 && (
                  <div>
                    <h5 className="text-primary mb-4">
                      <i className="bi bi-mortarboard me-2"></i>
                      Education & Experience
                    </h5>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Highest Education Level *</label>
                        <select
                          className="form-select"
                          name="educationLevel"
                          value={formData.educationLevel}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Level</option>
                          {educationLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Institution *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="institution"
                          value={formData.institution}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Field of Study</label>
                        <input
                          type="text"
                          className="form-control"
                          name="fieldOfStudy"
                          value={formData.fieldOfStudy}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Graduation Year</label>
                        <input
                          type="number"
                          className="form-control"
                          name="graduationYear"
                          value={formData.graduationYear}
                          onChange={handleChange}
                          min="1980"
                          max="2030"
                        />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Years of Experience *</label>
                        <select
                          className="form-select"
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Experience</option>
                          {experienceLevels.map(exp => (
                            <option key={exp} value={exp}>{exp}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Current Employer</label>
                        <input
                          type="text"
                          className="form-control"
                          name="currentEmployer"
                          value={formData.currentEmployer}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Current Position</label>
                      <input
                        type="text"
                        className="form-control"
                        name="currentPosition"
                        value={formData.currentPosition}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Application Details */}
                {currentStep === 3 && (
                  <div>
                    <h5 className="text-primary mb-4">
                      <i className="bi bi-file-text me-2"></i>
                      Application Details
                    </h5>
                    
                    <div className="mb-3">
                      <label className="form-label">Cover Letter *</label>
                      <textarea
                        className="form-control"
                        rows="6"
                        name="coverLetter"
                        value={formData.coverLetter}
                        onChange={handleChange}
                        placeholder="Tell us why you're interested in this position and what makes you a good fit..."
                        required
                      ></textarea>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Salary Expectation (M)</label>
                        <input
                          type="text"
                          className="form-control"
                          name="salaryExpectation"
                          value={formData.salaryExpectation}
                          onChange={handleChange}
                          placeholder="e.g., 15,000 - 20,000"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Notice Period *</label>
                        <select
                          className="form-select"
                          name="noticePeriod"
                          value={formData.noticePeriod}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Notice Period</option>
                          {noticePeriods.map(period => (
                            <option key={period} value={period}>{period}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Documents */}
                {currentStep === 4 && (
                  <div>
                    <h5 className="text-primary mb-4">
                      <i className="bi bi-paperclip me-2"></i>
                      Upload Documents
                    </h5>
                    
                    <div className="mb-4">
                      <label className="form-label">Resume/CV *</label>
                      <input
                        type="file"
                        className="form-control"
                        name="resume"
                        onChange={handleChange}
                        accept=".pdf,.doc,.docx"
                        required
                      />
                      <div className="form-text">
                        Accepted formats: PDF, DOC, DOCX (Max: 5MB)
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label">Cover Letter (Optional)</label>
                      <input
                        type="file"
                        className="form-control"
                        name="coverLetterFile"
                        onChange={handleChange}
                        accept=".pdf,.doc,.docx"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Certificates (Optional)</label>
                      <input
                        type="file"
                        className="form-control"
                        multiple
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            certificates: Array.from(e.target.files)
                          }));
                        }}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <div className="form-text">
                        Upload relevant certificates, awards, or portfolio items
                      </div>
                    </div>
                    
                    <div className="alert alert-info">
                      <h6 className="alert-heading">
                        <i className="bi bi-info-circle me-2"></i>
                        Application Review
                      </h6>
                      <p className="mb-0 small">
                        Please review all information before submitting. You can go back to previous steps to make changes.
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="d-flex justify-content-between mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Previous
                  </button>
                  
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={nextStep}
                    >
                      Next
                      <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-success"
                    >
                      <i className="bi bi-send me-2"></i>
                      Submit Application
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}