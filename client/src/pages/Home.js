import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const stats = [
    { number: '500+', label: 'Active Jobs', icon: '💼', color: 'primary' },
    { number: '50+', label: 'Partner Companies', icon: '🏢', color: 'success' },
    { number: '3', label: 'Universities', icon: '🎓', color: 'info' },
    { number: '2,000+', label: 'Students', icon: '👥', color: 'warning' }
  ];

  const quickActions = [
    {
      title: 'Find Jobs',
      description: 'Browse latest job opportunities',
      icon: '🔍',
      link: '/jobs',
      color: 'primary'
    },
    {
      title: 'Apply to Courses',
      description: 'Explore university courses',
      icon: '📚',
      link: '/courses',
      color: 'success'
    },
    {
      title: 'University Reviews',
      description: 'See what students are saying',
      icon: '⭐',
      link: '/reviews',
      color: 'info'
    },
    {
      title: 'Career Resources',
      description: 'Resume tips & interview prep',
      icon: '💡',
      link: '/resources',
      color: 'warning'
    }
  ];

  const featuredJobs = [
    {
      id: 1,
      title: 'Software Developer Intern',
      company: 'Tech Solutions Lesotho',
      location: 'Maseru',
      type: 'Internship',
      salary: 'M8,000 - M12,000',
      urgent: true
    },
    {
      id: 2,
      title: 'Marketing Assistant',
      company: 'Creative Agency',
      location: 'Roma',
      type: 'Full-time',
      salary: 'M10,000 - M15,000',
      urgent: false
    },
    {
      id: 3,
      title: 'Data Analyst',
      company: 'Finance Corp',
      location: 'Remote',
      type: 'Contract',
      salary: 'M15,000 - M20,000',
      urgent: true
    }
  ];

  const universities = [
    {
      name: 'National University of Lesotho',
      logo: '🏛️',
      courses: 45,
      location: 'Roma'
    },
    {
      name: 'Limkokwing University',
      logo: '🎨',
      courses: 32,
      location: 'Maseru'
    },
    {
      name: 'Botho University',
      logo: '💼',
      courses: 28,
      location: 'Maseru'
    }
  ];

  return (
    <div className="container-fluid px-4">
      {/* Hero Section */}
      <div className="row align-items-center py-5 mb-4" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '15px',
        color: 'white'
      }}>
        <div className="col-lg-8">
          <h1 className="display-4 fw-bold mb-3">
            Welcome to Career Portal Lesotho
          </h1>
          <p className="lead mb-4">
            Your gateway to career opportunities and educational excellence. 
            Connect with top employers and discover courses from Lesotho's leading universities.
          </p>
          <div className="d-flex gap-3">
            <Link to="/jobs" className="btn btn-light btn-lg px-4">
              Find Jobs
            </Link>
            <Link to="/courses" className="btn btn-outline-light btn-lg px-4">
              Explore Courses
            </Link>
          </div>
        </div>
        <div className="col-lg-4 text-center">
          <div style={{ fontSize: '8rem' }}></div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="row mb-5">
        {stats.map((stat, index) => (
          <div key={index} className="col-xl-3 col-md-6 mb-4">
            <div className={`card border-0 bg-${stat.color} text-white shadow-sm`}>
              <div className="card-body text-center py-4">
                <div className="display-4 mb-2">{stat.icon}</div>
                <h3 className="card-title">{stat.number}</h3>
                <p className="card-text mb-0">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="row mb-5">
        <div className="col-12">
          <h3 className="text-primary mb-4">Quick Access</h3>
        </div>
        {quickActions.map((action, index) => (
          <div key={index} className="col-xl-3 col-md-6 mb-4">
            <Link to={action.link} className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-lift">
                <div className="card-body text-center p-4">
                  <div 
                    className={`rounded-circle bg-${action.color} text-white d-inline-flex align-items-center justify-content-center mb-3`}
                    style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                  >
                    {action.icon}
                  </div>
                  <h5 className="card-title text-dark">{action.title}</h5>
                  <p className="card-text text-muted">{action.description}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row">
        {/* Featured Jobs */}
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">🔥 Featured Jobs</h5>
              <Link to="/jobs" className="btn btn-outline-primary btn-sm">
                View All
              </Link>
            </div>
            <div className="card-body">
              {featuredJobs.map(job => (
                <div key={job.id} className="border-bottom pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                  <div className="row align-items-center">
                    <div className="col-8">
                      <div className="d-flex align-items-center mb-1">
                        <h6 className="mb-0 me-2">{job.title}</h6>
                        {job.urgent && (
                          <span className="badge bg-danger">Urgent</span>
                        )}
                      </div>
                      <p className="text-muted small mb-1">{job.company} • {job.location}</p>
                      <div className="d-flex gap-2">
                        <span className="badge bg-light text-dark">{job.type}</span>
                        <span className="text-success small">{job.salary}</span>
                      </div>
                    </div>
                    <div className="col-4 text-end">
                      <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
                        Apply Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Partner Universities */}
        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">🎓 Partner Universities</h5>
            </div>
            <div className="card-body">
              {universities.map((uni, index) => (
                <div key={index} className="d-flex align-items-center mb-3 last:mb-0">
                  <div 
                    className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3"
                    style={{ width: '50px', height: '50px', fontSize: '1.5rem' }}
                  >
                    {uni.logo}
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{uni.name}</h6>
                    <p className="text-muted small mb-0">
                      {uni.courses} courses • {uni.location}
                    </p>
                  </div>
                </div>
              ))}
              <Link to="/universities" className="btn btn-outline-primary btn-sm w-100 mt-3">
                Explore All Universities
              </Link>
            </div>
          </div>

          {/* Announcements */}
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">📢 Announcements</h5>
            </div>
            <div className="card-body">
              <div className="alert alert-info mb-3">
                <strong>Career Fair 2024:</strong> Join us on February 15th at NUL Campus.
              </div>
              <div className="alert alert-warning mb-0">
                <strong>New Features:</strong> Transcript upload now available!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card bg-dark text-white">
            <div className="card-body text-center py-5">
              <h3 className="mb-3">Ready to Start Your Career Journey?</h3>
              <p className="mb-4">Join thousands of students and professionals using Career Portal</p>
              <div className="d-flex gap-3 justify-content-center">
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Create Account
                </Link>
                <Link to="/admin/login" className="btn btn-secondary btn-lg">
                  Admin Login
                </Link>
                <Link to="/about" className="btn btn-outline-light btn-lg">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}