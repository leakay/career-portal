import React from 'react';

export default function JobCard({ job, onApply, onSave, onDetails }) {
  if (!job) return null;

  const getJobTypeColor = (type) => {
    const colors = {
      'Full-time': 'success',
      'Part-time': 'warning',
      'Contract': 'info',
      'Internship': 'primary',
      'Remote': 'dark'
    };
    return colors[type] || 'secondary';
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Negotiable';
    if (typeof salary === 'string') return salary;
    return `M${salary.toLocaleString()}/year`;
  };

  const isNewJob = () => {
    const postedDate = new Date(job.postedDate);
    const today = new Date();
    const diffTime = Math.abs(today - postedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <div className="card h-100 shadow-sm border-0 job-card">
      <div className="card-body d-flex flex-column">
        {/* Job Header */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="flex-grow-1">
            <h5 className="card-title text-dark mb-1">{job.title}</h5>
            <p className="card-text text-muted mb-1">
              <i className="bi bi-building me-1"></i>
              {job.company}
            </p>
            {job.location && (
              <p className="card-text text-muted small mb-2">
                <i className="bi bi-geo-alt me-1"></i>
                {job.location}
              </p>
            )}
          </div>
          
          {/* Save Button */}
          {onSave && (
            <button 
              className="btn btn-outline-secondary btn-sm border-0"
              onClick={() => onSave(job)}
              title="Save job"
            >
              <i className="bi bi-bookmark"></i>
            </button>
          )}
        </div>

        {/* Job Badges */}
        <div className="mb-3">
          <div className="d-flex flex-wrap gap-2">
            {job.type && (
              <span className={`badge bg-${getJobTypeColor(job.type)}`}>
                {job.type}
              </span>
            )}
            
            {isNewJob() && (
              <span className="badge bg-danger">New</span>
            )}
            
            {job.urgent && (
              <span className="badge bg-warning text-dark">Urgent</span>
            )}
          </div>
        </div>

        {/* Job Description */}
        {job.description && (
          <p className="card-text text-muted small flex-grow-1">
            {job.description.length > 120 
              ? `${job.description.substring(0, 120)}...` 
              : job.description
            }
          </p>
        )}

        {/* Job Details */}
        <div className="job-meta mb-3">
          {job.salary && (
            <div className="d-flex align-items-center text-success small mb-1">
              <i className="bi bi-currency-dollar me-2"></i>
              <strong>{formatSalary(job.salary)}</strong>
            </div>
          )}
          
          {job.requirements && (
            <div className="d-flex align-items-center text-muted small">
              <i className="bi bi-award me-2"></i>
              <span>{job.requirements}</span>
            </div>
          )}
        </div>

        {/* Posted Date */}
        {job.postedDate && (
          <div className="text-muted small mb-3">
            <i className="bi bi-clock me-1"></i>
            Posted {new Date(job.postedDate).toLocaleDateString()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="d-flex gap-2 mt-auto">
          {onDetails && (
            <button 
              className="btn btn-outline-primary btn-sm flex-fill"
              onClick={() => onDetails(job)}
            >
              <i className="bi bi-eye me-1"></i>
              Details
            </button>
          )}
          
          {onApply && (
            <button 
              className="btn btn-primary btn-sm flex-fill"
              onClick={() => onApply(job)}
            >
              <i className="bi bi-send me-1"></i>
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}