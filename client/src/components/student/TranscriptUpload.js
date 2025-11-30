import React, { useState, useRef } from 'react';

export default function TranscriptUpload() {
  const [uploadState, setUploadState] = useState({
    file: null,
    university: '',
    course: '',
    year: '',
    semester: '',
    isUploading: false,
    isUploaded: false,
    error: null
  });
  const [academicHistory, setAcademicHistory] = useState([]);
  const fileInputRef = useRef(null);

  const universities = [
    'National University of Lesotho',
    'Limkokwing University',
    'Botho University',
    'Other'
  ];

  const courses = [
    'Computer Science',
    'Business Administration',
    'Engineering',
    'Medicine',
    'Law',
    'Other'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year+'];
  const semesters = ['Semester 1', 'Semester 2', 'Summer Semester', 'Full Year'];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setUploadState(prev => ({
          ...prev,
          error: 'Please upload a PDF, JPEG, or PNG file'
        }));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setUploadState(prev => ({
          ...prev,
          error: 'File size must be less than 5MB'
        }));
        return;
      }

      setUploadState(prev => ({
        ...prev,
        file,
        error: null
      }));
    }
  };

  const handleUpload = async () => {
    if (!uploadState.file || !uploadState.university || !uploadState.course || !uploadState.year) {
      setUploadState(prev => ({
        ...prev,
        error: 'Please fill all required fields and select a file'
      }));
      return;
    }

    setUploadState(prev => ({ ...prev, isUploading: true, error: null }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTranscript = {
        id: Date.now(),
        filename: uploadState.file.name,
        university: uploadState.university,
        course: uploadState.course,
        year: uploadState.year,
        semester: uploadState.semester,
        uploadDate: new Date().toISOString(),
        status: 'verified',
        gpa: '3.8', // This would come from backend processing
        credits: '90'
      };

      setAcademicHistory(prev => [newTranscript, ...prev]);
      
      setUploadState({
        file: null,
        university: '',
        course: '',
        year: '',
        semester: '',
        isUploading: false,
        isUploaded: true,
        error: null
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reset success message after 3 seconds
      setTimeout(() => {
        setUploadState(prev => ({ ...prev, isUploaded: false }));
      }, 3000);

    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: 'Upload failed. Please try again.'
      }));
    }
  };

  const handleRemoveFile = () => {
    setUploadState(prev => ({
      ...prev,
      file: null,
      error: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      verified: { class: 'success', label: 'Verified', icon: '✅' },
      pending: { class: 'warning', label: 'Pending Review', icon: '⏳' },
      rejected: { class: 'danger', label: 'Rejected', icon: '❌' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`badge bg-${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h3 className="text-primary mb-4">
            <i className="bi bi-file-earmark-text me-2"></i>
            Transcript Upload
          </h3>
        </div>
      </div>

      <div className="row">
        {/* Upload Form */}
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Upload New Transcript</h5>
            </div>
            <div className="card-body">
              {/* Success Message */}
              {uploadState.isUploaded && (
                <div className="alert alert-success d-flex align-items-center">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Transcript uploaded successfully and is being processed!
                </div>
              )}

              {/* Error Message */}
              {uploadState.error && (
                <div className="alert alert-danger d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {uploadState.error}
                </div>
              )}

              {/* Academic Information */}
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    University <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={uploadState.university}
                    onChange={(e) => setUploadState(prev => ({ ...prev, university: e.target.value }))}
                  >
                    <option value="">Select University</option>
                    {universities.map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Course/Program <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={uploadState.course}
                    onChange={(e) => setUploadState(prev => ({ ...prev, course: e.target.value }))}
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Year <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={uploadState.year}
                    onChange={(e) => setUploadState(prev => ({ ...prev, year: e.target.value }))}
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Semester</label>
                  <select
                    className="form-select"
                    value={uploadState.semester}
                    onChange={(e) => setUploadState(prev => ({ ...prev, semester: e.target.value }))}
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="mb-4">
                <label className="form-label">
                  Transcript File <span className="text-danger">*</span>
                </label>
                
                {!uploadState.file ? (
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center cursor-pointer"
                    style={{ border: '2px dashed #dee2e6', borderRadius: '0.375rem' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="bi bi-cloud-upload display-4 text-muted mb-3"></i>
                    <h5 className="text-muted">Drag & drop your transcript here</h5>
                    <p className="text-muted small mb-3">or click to browse files</p>
                    <small className="text-muted">
                      Supported formats: PDF, JPG, PNG (Max: 5MB)
                    </small>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="d-none"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </div>
                ) : (
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-file-earmark-text text-primary me-3" style={{ fontSize: '1.5rem' }}></i>
                          <div>
                            <h6 className="mb-1">{uploadState.file.name}</h6>
                            <small className="text-muted">
                              {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
                            </small>
                          </div>
                        </div>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={handleRemoveFile}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="d-grid">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleUpload}
                  disabled={uploadState.isUploading}
                >
                  {uploadState.isUploading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Uploading...</span>
                      </div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-upload me-2"></i>
                      Upload Transcript
                    </>
                  )}
                </button>
              </div>

              {/* Requirements */}
              <div className="alert alert-info mt-4">
                <h6 className="alert-heading">
                  <i className="bi bi-info-circle me-2"></i>
                  Transcript Requirements
                </h6>
                <ul className="mb-0 small">
                  <li>File must be clear and readable</li>
                  <li>Include your full name and student ID</li>
                  <li>Show complete academic record</li>
                  <li>Official transcripts are preferred</li>
                  <li>Files are securely stored and encrypted</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Upload History */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Upload History</h5>
            </div>
            <div className="card-body">
              {academicHistory.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-file-earmark-text display-4 text-muted mb-3"></i>
                  <p className="text-muted">No transcripts uploaded yet</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {academicHistory.map(transcript => (
                    <div key={transcript.id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-1">{transcript.filename}</h6>
                        {getStatusBadge(transcript.status)}
                      </div>
                      <p className="text-muted small mb-1">
                        {transcript.university} • {transcript.course}
                      </p>
                      <p className="text-muted small mb-1">
                        {transcript.year} • {transcript.semester}
                      </p>
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">
                          {new Date(transcript.uploadDate).toLocaleDateString()}
                        </small>
                        {transcript.gpa && (
                          <small className="text-success">
                            GPA: {transcript.gpa}
                          </small>
                        )}
                      </div>
                      <div className="mt-2">
                        <button className="btn btn-outline-primary btn-sm me-2">
                          <i className="bi bi-download me-1"></i>
                          Download
                        </button>
                        <button className="btn btn-outline-danger btn-sm">
                          <i className="bi bi-trash me-1"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h6 className="card-title">Transcript Stats</h6>
              <div className="row text-center">
                <div className="col-6">
                  <div className="h4 text-primary mb-1">{academicHistory.length}</div>
                  <small className="text-muted">Total Uploads</small>
                </div>
                <div className="col-6">
                  <div className="h4 text-success mb-1">
                    {academicHistory.filter(t => t.status === 'verified').length}
                  </div>
                  <small className="text-muted">Verified</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}