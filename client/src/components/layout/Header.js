import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          🎓 Career Portal
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/reviews">
                Reviews
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/institutes">
                Universities
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/add-review">
                Write Review
              </Link>
            </li>
          </ul>
          
          <div className="navbar-nav">
            <Link className="nav-link" to="/profile">
              <i className="bi bi-person-circle me-1"></i>
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}