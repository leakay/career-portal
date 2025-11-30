import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function StudentSidebar() {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarItems = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: '📊',
      path: '/student-dashboard',
      description: 'View your dashboard stats'
    },
    {
      id: 'applications',
      label: 'My Applications',
      icon: '📝',
      path: '/student/applications',
      description: 'Track your university applications'
    },
    {
      id: 'universities',
      label: 'Browse Universities',
      icon: '🏛️',
      path: '/universities',
      description: 'Explore available institutions'
    },
    {
      id: 'jobs',
      label: 'Job Opportunities',
      icon: '💼',
      path: '/student/jobs',
      description: 'Find career opportunities'
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: '👤',
      path: '/student/profile',
      description: 'Update your information'
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: '📄',
      path: '/student/documents',
      description: 'Upload supporting documents'
    }
  ];

  return (
    <>
      {/* Mobile menu toggle button */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle sidebar"
      >
        <i className={`bi ${isMobileOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
      </button>

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isMobileOpen ? 'show' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      ></div>

      {/* Sidebar */}
      <div className={`student-sidebar bg-white shadow-sm ${isMobileOpen ? 'show' : ''}`}>
        <div className="sidebar-header p-3 border-bottom">
          <h6 className="mb-0 fw-bold text-primary">
            <i className="bi bi-person-circle me-2"></i>
            Student Portal
          </h6>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={(e) => {
                // Close mobile sidebar when clicking a link
                setIsMobileOpen(false);
                // For dashboard overview, scroll to top
                if (item.id === 'overview') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <div className="sidebar-nav-icon">
                {item.icon}
              </div>
              <div className="sidebar-nav-content">
                <div className="sidebar-nav-label">{item.label}</div>
                <div className="sidebar-nav-desc">{item.description}</div>
              </div>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer p-3 border-top">
          <button
            className="btn btn-outline-danger btn-sm w-100"
            onClick={() => {
              // Handle logout
              localStorage.clear();
              navigate('/login');
              setIsMobileOpen(false);
            }}
          >
            <i className="bi bi-box-arrow-right me-1"></i>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
