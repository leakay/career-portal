import React, { useEffect } from 'react';

export default function Modal({ show, title, children, onClose, size = 'md' }) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.keyCode === 27 && onClose) onClose();
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [show, onClose]);

  if (!show) return null;

  const sizeClass = {
    sm: 'modal-sm',
    md: '',
    lg: 'modal-lg',
    xl: 'modal-xl'
  }[size];

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      tabIndex="-1"
      onClick={onClose}
    >
      <div 
        className={`modal-dialog modal-dialog-centered ${sizeClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content shadow">
          {/* Modal Header */}
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title">
              {title}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          
          {/* Modal Body */}
          <div className="modal-body">
            {children}
          </div>
          
          {/* Modal Footer */}
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}