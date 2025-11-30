import React from 'react';

export default function LoadingSpinner({ 
  size = 'medium', 
  color = 'light', 
  message = 'Loading...' 
}) {
  const sizeClass = {
    small: 'spinner-border-sm',
    medium: '',
    large: 'spinner-border-lg'
  }[size];

  return (
    <div className="text-center p-4">
      <div className={`spinner-border text-${color} ${sizeClass}`} role="status">
        <span className="visually-hidden">{message}</span>
      </div>
      {message && (
        <div className="mt-2 text-muted small">{message}</div>
      )}
    </div>
  );
}