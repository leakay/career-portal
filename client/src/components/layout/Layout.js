import React from 'react';
import { Link, useLocation } from 'react-router-dom';


const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            🎓 Career Platform
          </Link>
          <nav className="nav">
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
            >
              Home
            </Link>
            <Link 
              to="/institute" 
              className={location.pathname.startsWith('/institute') ? 'nav-link active' : 'nav-link'}
            >
              Institute
            </Link>
            <Link 
              to="/student" 
              className={location.pathname === '/student' ? 'nav-link active' : 'nav-link'}
            >
              Student
            </Link>
            <Link 
              to="/company" 
              className={location.pathname === '/company' ? 'nav-link active' : 'nav-link'}
            >
              Company
            </Link>
            <Link 
              to="/admin" 
              className={location.pathname === '/admin' ? 'nav-link active' : 'nav-link'}
            >
              Admin
            </Link>
          </nav>
          <div className="auth-buttons">
            <button className="btn-login">Login</button>
            <button className="btn-register">Register</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 Career Guidance & Employment Integration Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;