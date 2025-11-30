import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');
  const [filters, setFilters] = useState({
    university: '',
    rating: '',
    status: '',
    sortBy: 'newest'
  });

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch applications, reviews, and institutions in parallel
        const [applicationsRes, reviewsRes, institutionsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/applications`),
          axios.get(`${API_BASE_URL}/reviews`),
          axios.get(`${API_BASE_URL}/institutions`)
        ]);

        if (applicationsRes.data.success) {
          setApplications(applicationsRes.data.data);
        }

        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.data);
          setFilteredReviews(reviewsRes.data.data);
        }

        if (institutionsRes.data.success) {
          setInstitutions(institutionsRes.data.data);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading data from server');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update application status
  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/applications/${applicationId}/status`,
        { status: newStatus }
      );

      if (response.data.success) {
        // Update local state
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus, lastUpdated: new Date().toISOString() }
            : app
        ));
        alert(`Application status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Error updating application status');
    }
  };

  // Update helpful count
  const handleHelpful = async (reviewId) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/reviews/${reviewId}/helpful`
      );

      if (response.data.success) {
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, helpful: response.data.data.helpful }
            : review
        ));
      }
    } catch (error) {
      console.error('Error updating helpful count:', error);
    }
  };

  // Filter and sort logic
  useEffect(() => {
    if (activeTab === 'reviews') {
      let results = [...reviews];
      
      if (filters.university && filters.university !== 'All Universities') {
        results = results.filter(review => 
          review.institution === filters.university
        );
      }
      
      if (filters.rating) {
        results = results.filter(review => review.rating === parseInt(filters.rating));
      }
      
      // Apply sorting
      results = sortReviews(results, filters.sortBy);
      setFilteredReviews(results);
    }
  }, [filters, reviews, activeTab]);

  // Get filtered applications
  const filteredApplications = applications.filter(app => {
    if (filters.university && filters.university !== 'All Universities' && app.institution !== filters.university) {
      return false;
    }
    if (filters.status && filters.status !== 'All Statuses' && app.status !== filters.status) {
      return false;
    }
    return true;
  });

  const sortReviews = (reviewsList, sortType) => {
    const sorted = [...reviewsList];
    switch (sortType) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'highest-rated':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'most-helpful':
        return sorted.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
      default:
        return sorted;
    }
  };

  const getRatingStars = (rating) => {
    return (
      <div className="rating-stars">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`star ${i < rating ? 'filled' : ''}`}
            style={{
              color: i < rating ? '#ffc107' : '#e4e5e9',
              fontSize: '1.2rem'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Pending Review': 'warning',
      'Under Review': 'info',
      'Approved': 'success',
      'Rejected': 'danger',
      'Initial Parties': 'secondary'
    };
    
    return (
      <span className={`badge bg-${statusColors[status] || 'secondary'}`}>
        {status}
      </span>
    );
  };

  // Get unique universities from data
  const universities = ['All Universities', ...new Set([
    ...applications.map(app => app.institution),
    ...reviews.map(review => review.institution)
  ].filter(Boolean))];

  const statusOptions = [
    'All Statuses',
    'Initial Parties',
    'Pending Review',
    'Under Review',
    'Approved',
    'Rejected'
  ];

  // Calculate university statistics
  const universityStats = institutions.reduce((stats, institution) => {
    const instApplications = applications.filter(app => app.institution === institution.name);
    const instReviews = reviews.filter(review => review.institution === institution.name);
    const averageRating = instReviews.length > 0 
      ? (instReviews.reduce((sum, review) => sum + review.rating, 0) / instReviews.length).toFixed(1)
      : '0.0';

    stats[institution.name] = {
      totalReviews: instReviews.length,
      averageRating: parseFloat(averageRating),
      totalApplications: instApplications.length
    };
    return stats;
  }, {});

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-primary mb-2">
                <i className="bi bi-speedometer2 me-2"></i>
                Admin Dashboard
              </h2>
              <p className="text-muted mb-0">
                Manage student applications and reviews
              </p>
            </div>
            <div>
              <span className="badge bg-primary me-2">
                {applications.length} Applications
              </span>
              <span className="badge bg-success">
                {reviews.length} Reviews
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'applications' ? 'active' : ''}`}
                onClick={() => setActiveTab('applications')}
              >
                <i className="bi bi-file-earmark-text me-2"></i>
                Student Applications ({applications.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <i className="bi bi-chat-square-text me-2"></i>
                Student Reviews ({reviews.length})
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* University Stats */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-light border-0">
            <div className="card-body">
              <h5 className="card-title mb-3">University Overview</h5>
              <div className="row text-center">
                {Object.entries(universityStats).map(([uni, stats]) => (
                  <div key={uni} className="col-md-4 mb-3">
                    <h6 className="text-dark">{uni}</h6>
                    <div className="row">
                      <div className="col-6">
                        <div className="h4 text-primary mb-1">{stats.averageRating}</div>
                        <div className="text-muted small">
                          {getRatingStars(stats.averageRating)}
                        </div>
                        <small className="text-muted">{stats.totalReviews} reviews</small>
                      </div>
                      <div className="col-6">
                        <div className="h4 text-info mb-1">{stats.totalApplications}</div>
                        <small className="text-muted">applications</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-md-3">
                  <label className="form-label">University</label>
                  <select
                    className="form-select"
                    value={filters.university}
                    onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value }))}
                  >
                    <option value="">All Universities</option>
                    {universities.filter(uni => uni !== 'All Universities').map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>
                
                {activeTab === 'reviews' ? (
                  <div className="col-md-3">
                    <label className="form-label">Rating</label>
                    <select
                      className="form-select"
                      value={filters.rating}
                      onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                    >
                      <option value="">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>
                ) : (
                  <div className="col-md-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="col-md-3">
                  <label className="form-label">Sort By</label>
                  <select
                    className="form-select"
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    {activeTab === 'reviews' && (
                      <>
                        <option value="highest-rated">Highest Rated</option>
                        <option value="most-helpful">Most Helpful</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="col-md-3">
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setFilters({ university: '', rating: '', status: '', sortBy: 'newest' })}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Tab Content */}
      {activeTab === 'applications' && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">Student Applications</h5>
                
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-file-earmark-x display-1 text-muted"></i>
                    <h4 className="text-muted mt-3">No applications found</h4>
                    <p className="text-muted">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>University</th>
                          <th>Course</th>
                          <th>Applied Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplications.map(application => (
                          <tr key={application.id}>
                            <td>
                              <div>
                                <strong>{application.studentName}</strong>
                                <br />
                                <small className="text-muted">{application.studentEmail}</small>
                              </div>
                            </td>
                            <td>{application.institution}</td>
                            <td>{application.course}</td>
                            <td>
                              {new Date(application.appliedDate).toLocaleDateString()}
                            </td>
                            <td>{getStatusBadge(application.status)}</td>
                            <td>
                              <div className="btn-group">
                                <button 
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => updateApplicationStatus(application.id, 'Under Review')}
                                >
                                  Review
                                </button>
                                <button 
                                  className="btn btn-outline-success btn-sm"
                                  onClick={() => updateApplicationStatus(application.id, 'Approved')}
                                >
                                  Approve
                                </button>
                                <button 
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => updateApplicationStatus(application.id, 'Rejected')}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Tab Content */}
      {activeTab === 'reviews' && (
        <div className="row">
          {filteredReviews.length === 0 ? (
            <div className="col-12">
              <div className="text-center py-5">
                <i className="bi bi-search display-1 text-muted"></i>
                <h4 className="text-muted mt-3">No reviews found</h4>
                <p className="text-muted">Try adjusting your filters or be the first to write a review!</p>
                <Link to="/add-review" className="btn btn-primary">
                  Write First Review
                </Link>
              </div>
            </div>
          ) : (
            filteredReviews.map(review => (
              <div key={review.id} className="col-lg-6 mb-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="card-title text-dark mb-1">{review.title}</h5>
                        <div className="d-flex align-items-center mb-2">
                          {getRatingStars(review.rating)}
                          <span className="text-muted ms-2">({review.rating}/5)</span>
                        </div>
                      </div>
                      {review.verified && (
                        <span className="badge bg-success">
                          <i className="bi bi-patch-check me-1"></i>
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="card-text text-muted mb-3">{review.content}</p>

                    <div className="border-top pt-3">
                      <div className="row align-items-center">
                        <div className="col-8">
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                              style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                            >
                              {review.studentName?.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <strong className="d-block">{review.studentName}</strong>
                              <small className="text-muted">
                                {review.course} • {review.institution}
                              </small>
                            </div>
                          </div>
                        </div>
                        <div className="col-4 text-end">
                          <small className="text-muted d-block">
                            {new Date(review.date).toLocaleDateString()}
                          </small>
                          <button
                            className="btn btn-outline-primary btn-sm mt-1"
                            onClick={() => handleHelpful(review.id)}
                          >
                            <i className="bi bi-hand-thumbs-up me-1"></i>
                            Helpful ({review.helpful || 0})
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
