import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-light border-top py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h5 className="text-dark">Career Portal</h5>
            <p className="text-muted small">
              Connecting students with opportunities across Lesotho's top universities.
            </p>
          </div>
          <div className="col-md-4 mb-3">
            <h6 className="text-dark">Quick Links</h6>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-muted text-decoration-none">Home</Link></li>
              <li><Link to="/reviews" className="text-muted text-decoration-none">Reviews</Link></li>
              <li><Link to="/institutes" className="text-muted text-decoration-none">Universities</Link></li>
            </ul>
          </div>
          <div className="col-md-4 mb-3">
            <h6 className="text-dark">Universities</h6>
            <ul className="list-unstyled">
              <li><span className="text-muted">National University of Lesotho</span></li>
              <li><span className="text-muted">Limkokwing University</span></li>
              <li><span className="text-muted">Botho University</span></li>
            </ul>
          </div>
        </div>
        <hr className="my-3" />
        <div className="row">
          <div className="col-12">
            <p className="text-center text-muted mb-0">© 2025 Career Portal. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}