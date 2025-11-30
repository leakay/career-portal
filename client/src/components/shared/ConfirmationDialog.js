import React, { useEffect } from 'react';

export default function ConfirmationDialog({
  show,
  onConfirm,
  onCancel,
  children,
  title = "Confirm Action",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // danger, warning, primary, success
  size = "md"
}) {
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.keyCode === 27 && onCancel) onCancel();
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [show, onCancel]);

  if (!show) return null;

  const sizeClass = {
    sm: 'modal-sm',
    md: '',
    lg: 'modal-lg'
  }[size];

  const btnVariant = {
    danger: 'btn-danger',
    warning: 'btn-warning',
    primary: 'btn-primary',
    success: 'btn-success'
  }[variant];

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      tabIndex="-1"
      onClick={onCancel}
    >
      <div 
        className={`modal-dialog modal-dialog-centered ${sizeClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content shadow">
          {/* Header */}
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title text-dark">
              <i className={`bi bi-exclamation-triangle-fill text-${variant} me-2`}></i>
              {title}
            </h5>
          </div>
          
          {/* Body */}
          <div className="modal-body py-3">
            <div className="text-dark">
              {children}
            </div>
          </div>
          
          {/* Footer */}
          <div className="modal-footer border-0">
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button 
              type="button" 
              className={`btn ${btnVariant}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}