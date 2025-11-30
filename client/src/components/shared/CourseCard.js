import React from 'react';

export default function CourseCard({ course, university, onEnroll, onDetails }) {
  if (!course) return null;

  const getUniversityColor = (uniName) => {
    const colors = {
      'National University of Lesotho': 'primary',
      'Limkokwing University': 'info',
      'Botho University': 'success'
    };
    return colors[uniName] || 'secondary';
  };

  const universityColor = getUniversityColor(course.university || university);

  return (
    <div className="card h-100 shadow-sm border-0 course-card">
      <div className="card-body d-flex flex-column">
        {/* University Badge */}
        {(course.university || university) && (
          <div className="mb-2">
            <span className={`badge bg-${universityColor} text-white`}>
              {course.university || university}
            </span>
          </div>
        )}
        
        {/* Course Title */}
        <h5 className="card-title text-dark mb-2">{course.title}</h5>
        
        {/* Course Summary */}
        <p className="card-text text-muted flex-grow-1">
          {course.summary}
        </p>
        
        {/* Course Details */}
        <div className="course-meta mb-3">
          {course.duration && (
            <div className="d-flex align-items-center text-muted small mb-1">
              <i className="bi bi-clock me-2"></i>
              <span>{course.duration}</span>
            </div>
          )}
          
          {course.level && (
            <div className="d-flex align-items-center text-muted small mb-1">
              <i className="bi bi-graph-up me-2"></i>
              <span>{course.level}</span>
            </div>
          )}
          
          {course.fees && (
            <div className="d-flex align-items-center text-muted small">
              <i className="bi bi-currency-dollar me-2"></i>
              <span>{course.fees}</span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="d-flex gap-2 mt-auto">
          {onDetails && (
            <button 
              className="btn btn-outline-primary btn-sm flex-fill"
              onClick={() => onDetails(course)}
            >
              <i className="bi bi-info-circle me-1"></i>
              Details
            </button>
          )}
          
          {onEnroll && (
            <button 
              className={`btn btn-${universityColor} btn-sm flex-fill`}
              onClick={() => onEnroll(course)}
            >
              <i className="bi bi-bookmark-plus me-1"></i>
              Enroll
            </button>
          )}
        </div>
      </div>
    </div>
  );
}