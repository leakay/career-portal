import React from 'react';

export default function UserProfile({ user, onEdit, onLogout }) {
  if (!user) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase() || 'U';
  };

  const getRoleBadge = (role) => {
    const roles = {
      student: { class: 'bg-primary', label: 'Student' },
      alumni: { class: 'bg-success', label: 'Alumni' },
      employer: { class: 'bg-warning text-dark', label: 'Employer' },
      admin: { class: 'bg-danger', label: 'Admin' }
    };
    return roles[role] || { class: 'bg-secondary', label: 'User' };
  };

  const roleInfo = getRoleBadge(user.role);

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body text-center p-4">
        {/* Avatar */}
        <div className="mb-3">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.name}
              className="rounded-circle"
              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
            />
          ) : (
            <div
              className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center"
              style={{ width: '80px', height: '80px', fontSize: '1.5rem' }}
            >
              {getInitials(user.name)}
            </div>
          )}
        </div>

        {/* User Name */}
        <h5 className="card-title mb-1">{user.name}</h5>
        
        {/* Role Badge */}
        <span className={`badge ${roleInfo.class} mb-3`}>
          {roleInfo.label}
        </span>

        {/* User Details */}
        <div className="text-muted small mb-3">
          {user.email && (
            <div className="mb-1">
              <i className="bi bi-envelope me-2"></i>
              {user.email}
            </div>
          )}
          {user.university && (
            <div className="mb-1">
              <i className="bi bi-building me-2"></i>
              {user.university}
            </div>
          )}
          {user.course && (
            <div>
              <i className="bi bi-book me-2"></i>
              {user.course}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="row text-center mb-3">
          <div className="col-4">
            <div className="fw-bold text-primary">12</div>
            <small className="text-muted">Applied</small>
          </div>
          <div className="col-4">
            <div className="fw-bold text-success">3</div>
            <small className="text-muted">Saved</small>
          </div>
          <div className="col-4">
            <div className="fw-bold text-info">5</div>
            <small className="text-muted">Reviews</small>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-grid gap-2">
          {onEdit && (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={onEdit}
            >
              <i className="bi bi-pencil me-2"></i>
              Edit Profile
            </button>
          )}
          {onLogout && (
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={onLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}