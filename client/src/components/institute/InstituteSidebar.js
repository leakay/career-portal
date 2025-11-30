import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function InstituteSidebar({ onTabChange }) {
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
      path: '/institute-dashboard#dashboard',
      description: 'View your dashboard stats'
    },
    {
      id: 'applications',
      label: 'Application Management',
      icon: '📝',
      path: '/institute-dashboard#applications',
      description: 'Review student applications'
    },
    {
      id: 'faculties',
      label: 'Manage Faculties',
      icon: '🏫',
      path: '/institute-dashboard#faculties',
      description: 'Manage faculty information'
    },
    {
      id: 'courses',
      label: 'Manage Courses',
      icon: '📚',
      path: '/institute-dashboard#courses',
      description: 'Manage course offerings'
    },
    {
      id: 'profile',
      label: 'Institute Profile',
      icon: '🏛️',
      path: '/institute/profile',
      description: 'Update institute information'
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
      <div className={`institute-sidebar ${isMobile ? 'mobile' : 'desktop'} ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header p-3 border-bottom">
          <h6 className="mb-0 fw-bold text-primary">
            <i className="bi bi-bank me-2"></i>
            Institute Portal
          </h6>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item) => {
            if (item.id === 'profile') {
              // Profile goes to a separate page
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-nav-item ${isActive ? 'active' : ''}`
                  }
                  onClick={closeSidebar}
                >
                  <div className="sidebar-nav-icon">
                    {item.icon}
                  </div>
                  <div className="sidebar-nav-content">
                    <div className="sidebar-nav-label">{item.label}</div>
                    <div className="sidebar-nav-desc">{item.description}</div>
                  </div>
                </NavLink>
              );
            } else {
              // Dashboard tabs use callback function
              return (
                <button
                  key={item.id}
                  className="sidebar-nav-item"
                  onClick={() => {
                    if (onTabChange) {
                      onTabChange(item.id === 'overview' ? 'dashboard' : item.id);
                    }
                    closeSidebar();
                  }}
                >
                  <div className="sidebar-nav-icon">
                    {item.icon}
                  </div>
                  <div className="sidebar-nav-content">
                    <div className="sidebar-nav-label">{item.label}</div>
                    <div className="sidebar-nav-desc">{item.description}</div>
                  </div>
                </button>
              );
            }
          })}
        </nav>

        <div className="sidebar-footer p-3 border-top">
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
