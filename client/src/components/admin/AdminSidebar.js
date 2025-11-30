import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function AdminSidebar() {
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
      label: 'Admin Dashboard',
      icon: '📊',
      path: '/admin',
      description: 'System overview and stats'
    },
    {
      id: 'institutions',
      label: 'Manage Institutions',
      icon: '🏫',
      path: '/admin/institutions',
      description: 'Universities and colleges'
    },
    {
      id: 'faculties',
      label: 'Manage Faculties',
      icon: '🏛️',
      path: '/admin/faculties',
      description: 'Academic faculties'
    },
    {
      id: 'courses',
      label: 'Manage Courses',
      icon: '📚',
      path: '/admin/courses',
      description: 'Course offerings'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: '👥',
      path: '/admin/users',
      description: 'Manage system users'
    },
    {
      id: 'companies',
      label: 'Company Management',
      icon: '🏢',
      path: '/admin/companies',
      description: 'Manage companies'
    },
    {
      id: 'admissions',
      label: 'Admissions',
      icon: '📝',
      path: '/admin/admissions',
      description: 'Admission management'
    },
    {
      id: 'reports',
      label: 'System Reports',
      icon: '📈',
      path: '/admin/reports',
      description: 'Analytics and reports'
    },
    {
      id: 'security',
      label: 'Security Settings',
      icon: '🔒',
      path: '/admin/security',
      description: 'System security'
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
      <div className={`admin-sidebar ${isMobile ? 'mobile' : 'desktop'} ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header p-3 border-bottom">
          <h6 className="mb-0 fw-bold text-primary">
            <i className="bi bi-shield-check me-2"></i>
            Admin Portal
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
          ))}
        </nav>

        <div className="sidebar-footer p-3 border-top">
          <button
            className="btn btn-outline-danger btn-sm w-100"
            onClick={() => {
              // Handle logout
              localStorage.clear();
              navigate('/admin/login');
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
