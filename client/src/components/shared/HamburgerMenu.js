import React, { useState } from 'react';
import { Button, Offcanvas, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function HamburgerMenu() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { logout, user, userProfile } = useAuth();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.clear();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const role = (userProfile && userProfile.role) || (user && user.role) || 'student';

  // Base links visible to all roles
  const baseLinks = [
    { label: 'Home', path: '/', desc: 'Explore the portal' },
    { label: 'Jobs', path: '/student/jobs', desc: 'Browse job opportunities' },
    { label: 'Profile', path: '/student/profile', desc: 'View and edit your profile' },
    { label: 'Universities', path: '/universities', desc: 'Browse institutions & courses' }
  ];

  // Role-specific links appended after base links
  const roleLinks = {
    student: [
      { label: 'My Applications', path: '/student-dashboard', desc: 'Your applications & status' },
      { label: 'Documents', path: '/student/documents', desc: 'Upload supporting docs' }
    ],
    company: [
      { label: 'Company Jobs', path: '/company/jobs', desc: 'Manage your job postings' },
      { label: 'Applicants', path: '/company/applicants', desc: 'View applicants & matches' },
      { label: 'Company Profile', path: '/company/profile', desc: 'Manage company info' }
    ],
    institute: [
      { label: 'Applications', path: '/institute-dashboard', desc: 'Manage student applications' },
      { label: 'Course Management', path: '/course-management', desc: 'Manage courses & faculties' }
    ],
    admin: [
      { label: 'Manage Institutions', path: '/admin/institutions', desc: 'Institutions & faculties' },
      { label: 'System Reports', path: '/admin/reports', desc: 'View system reports' }
    ]
  };

  const items = [...baseLinks, ...(roleLinks[role] || [])];

  return (
    <>
      <Button variant="outline-light" className="me-2 hamburger-btn" onClick={handleShow} aria-label="Open menu">
        <span className="hamburger-icon">☰</span>
      </Button>

      <Offcanvas show={show} onHide={handleClose} placement="start" className="hamburger-offcanvas">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="fw-bold">Navigation</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column hamburger-nav">
            {items.map((it, idx) => (
              <Nav.Link key={idx} className="nav-item" onClick={() => { handleClose(); navigate(it.path); }}>
                <strong>{it.label}</strong>
                {it.desc && <div className="nav-desc">{it.desc}</div>}
              </Nav.Link>
            ))}

            <hr />

            <div className="mt-2">
              <Button variant="outline-danger" className="w-100" onClick={() => { handleClose(); handleLogout(); }}>
                Logout
              </Button>
            </div>

          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
