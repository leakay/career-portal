import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function CompanySidebar() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
      if (window.innerWidth > 992) {
        setIsOpen(true); // Always open on desktop
      } else {
        setIsOpen(false); // Closed by default on mobile
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const sidebarItems = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: '📊',
      path: '/company-dashboard',
      description: 'View your dashboard stats'
    },
    {
      id: 'jobs',
      label: 'Job Management',
      icon: '💼',
      path: '/company/jobs',
      description: 'Manage your job postings'
    },
    {
      id: 'post-job',
      label: 'Post New Job',
      icon: '📝',
      path: '/company/jobs/post',
      description: 'Create a new job posting'
    },
    {
      id: 'applicants',
      label: 'View Applicants',
      icon: '👥',
      path: '/company/applicants',
      description: 'Review job applications'
    },
    {
      id: 'profile',
      label: 'Company Profile',
      icon: '🏢',
      path: '/company/profile',
      description: 'Update company information'
    }
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          className="mobile-sidebar-toggle btn btn-primary"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list"></i>
        </button>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isMobile && isOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`company-sidebar ${isMobile ? 'mobile' : 'desktop'} ${isOpen ? 'open' : 'closed'}`}>
        <div className="company-sidebar-header p-3 border-bottom">
          <h6 className="mb-0 fw-bold text-primary">
            <i className="bi bi-building me-2"></i>
            Company Portal
          </h6>
        </div>

        <nav className="company-sidebar-nav">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `company-sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              <div className="company-sidebar-nav-icon">
                {item.icon}
              </div>
              <div className="company-sidebar-nav-content">
                <div className="company-sidebar-nav-label">{item.label}</div>
                <div className="company-sidebar-nav-desc">{item.description}</div>
              </div>
            </NavLink>
          ))}
        </nav>

        <div className="company-sidebar-footer p-3 border-top">
          <button
            className="btn btn-outline-danger btn-sm w-100"
            onClick={() => {
              // Handle logout
              localStorage.clear();
              navigate('/login');
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
