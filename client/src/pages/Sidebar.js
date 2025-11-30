import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: 'bi-house', label: 'Home' },
    { path: '/reviews', icon: 'bi-chat-text', label: 'Reviews' },
    { path: '/institutes', icon: 'bi-building', label: 'Universities' },
    { path: '/add-review', icon: 'bi-pencil', label: 'Write Review' },
    { path: '/profile', icon: 'bi-person', label: 'Profile' },
  ];

  return (
    <div className="bg-dark text-white" style={{ width: '250px', minHeight: '100vh' }}>
      <div className="p-3 border-bottom border-secondary">
        <h5 className="text-center mb-0">Navigation</h5>
      </div>
      <nav className="nav flex-column p-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link text-white mb-2 rounded ${
              location.pathname === item.path ? 'bg-primary' : 'hover-bg-light'
            }`}
          >
            <i className={`${item.icon} me-2`}></i>
            {item.label}
          </Link>
        ))}
        
        {/* University Quick Links */}
        <div className="mt-4 pt-3 border-top border-secondary">
          <small className="text-muted">UNIVERSITIES</small>
          <div className="mt-2">
            <div className="text-muted small mb-1">• National University of Lesotho</div>
            <div className="text-muted small mb-1">• Limkokwing University</div>
            <div className="text-muted small">• Botho University</div>
          </div>
        </div>
      </nav>
    </div>
  );
}