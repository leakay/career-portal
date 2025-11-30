import React, { useState, useEffect, useRef } from 'react';
import CompanySidebar from './CompanySidebar';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Spinner, Alert, Badge, ProgressBar } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const { logout, user, userProfile } = useAuth();
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  const [stats, setStats] = useState({
    jobs: 0,
    applicants: 0,
    interviews: 0,
    offers: 0,
    institutions: 0,
    companies: 0,
    applications: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isCompanyUser, setIsCompanyUser] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up auto-refresh every 30 seconds
    intervalRef.current = setInterval(() => {
      fetchStats();
    }, 30000);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');

      // Check for immediate stats update from Firebase (after job posting)
      const immediateStatsUpdate = localStorage.getItem('companyStatsUpdate');
      if (immediateStatsUpdate) {
        try {
          const { timestamp, stats } = JSON.parse(immediateStatsUpdate);
          // Only use immediate stats if they're less than 5 minutes old
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            console.log('Using immediate stats from Firebase:', stats);
            setStats(prevStats => ({
              ...prevStats,
              jobs: stats.jobs || 0,
              applicants: stats.applicants || 0,
              interviews: stats.interviews || 0,
              offers: stats.offers || 0
            }));
            // Clear the immediate update after using it
            localStorage.removeItem('companyStatsUpdate');
          } else {
            // Remove stale data
            localStorage.removeItem('companyStatsUpdate');
          }
        } catch (parseError) {
          console.error('Error parsing immediate stats:', parseError);
          localStorage.removeItem('companyStatsUpdate');
        }
      }

      // Fetch multiple endpoints in parallel
      const [
        companyStatsResponse,
        jobsResponse,
        applicationsResponse,
        institutionsResponse,
        companiesResponse,
        healthResponse
      ] = await Promise.allSettled([
        fetch(`http://localhost:5000/api/company/stats?companyId=${user?.companyId || user?.uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5000/jobs'),
        fetch('http://localhost:5000/applications'),
        fetch('http://localhost:5000/institutions'),
        fetch('http://localhost:5000/companies'),
        fetch('http://localhost:5000/health')
      ]);

      // Process company stats
      let companyStats = { jobs: 0, applicants: 0, interviews: 0, offers: 0 };
      if (companyStatsResponse.status === 'fulfilled') {
        if (companyStatsResponse.value.ok) {
          const data = await companyStatsResponse.value.json();
          companyStats = {
            jobs: data.data?.jobs || 0,
            applicants: data.data?.applicants || 0,
            interviews: data.data?.interviews || 0,
            offers: data.data?.offers || 0
          };
        } else {
          console.error('Company stats fetch failed:', companyStatsResponse.value.status);
          // Continue with other stats even if company stats fail
        }
      }

      // Process jobs count
      let totalJobs = 0;
      if (jobsResponse.status === 'fulfilled' && jobsResponse.value.ok) {
        const data = await jobsResponse.value.json();
        totalJobs = data.data ? data.data.length : 0;
      }

      // Process applications count
      let totalApplications = 0;
      if (applicationsResponse.status === 'fulfilled' && applicationsResponse.value.ok) {
        const data = await applicationsResponse.value.json();
        totalApplications = data.data ? data.data.length : 0;
      }

      // Process institutions count
      let totalInstitutions = 0;
      if (institutionsResponse.status === 'fulfilled' && institutionsResponse.value.ok) {
        const data = await institutionsResponse.value.json();
        totalInstitutions = data.data ? data.data.length : 0;
      }

      // Process companies count
      let totalCompanies = 0;
      if (companiesResponse.status === 'fulfilled' && companiesResponse.value.ok) {
        const data = await companiesResponse.value.json();
        totalCompanies = data.data ? data.data.length : 0;
      }

      // Process health check
      let serverStatus = { status: 'Unknown', database: 'Unknown' };
      if (healthResponse.status === 'fulfilled' && healthResponse.value.ok) {
        const data = await healthResponse.value.json();
        serverStatus = {
          status: data.status === 'OK' ? 'Running' : 'Error',
          database: data.firebase === 'Connected' ? 'Firebase Connected' : 'Firebase Disconnected'
        };
      }

      setStats({
        ...companyStats,
        institutions: totalInstitutions,
        companies: totalCompanies,
        applications: totalApplications
      });

      setLastUpdated(new Date());

    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard statistics');
      // Fallback to mock data
      setStats({
        jobs: 0,
        applicants: 0,
        interviews: 0,
        offers: 0,
        institutions: 0,
        companies: 0,
        applications: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading dashboard...</p>
      </div>
    );
  }

  if (error && !isCompanyUser) {
    return (
      <div className="container py-4">
        <CompanySidebar />
        <div className="company-dashboard-content">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <Card className="shadow-sm border-0 text-center" style={{ maxWidth: '500px' }}>
              <Card.Body className="p-5">
                <div className="mb-4">
                  <span className="display-1 text-warning">⚠️</span>
                </div>
                <h3 className="h4 mb-3">Access Restricted</h3>
                <p className="text-muted mb-4">
                  This dashboard is only accessible to company users. Please log in with a company account to view your recruitment statistics.
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/login')}
                  className="me-2"
                >
                  Login as Company
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate('/')}
                >
                  Go to Home
                </Button>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <CompanySidebar />
      <div className="company-dashboard-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-4 fw-bold text-dark mb-2">🏢 Company Dashboard</h1>
            <p className="text-muted lead">Welcome back! Here's an overview of your recruitment activities.</p>
          </div>
          <div>
            <Button
              variant="outline-primary"
              onClick={fetchStats}
              disabled={loading}
              className="d-flex align-items-center"
            >
              {loading ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : (
                <span className="me-2">🔄</span>
              )}
              Refresh Data
            </Button>
          </div>
        </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-4">
          <Card className="stats-card shadow-sm border-0 h-100 bg-gradient-success text-white">
            <Card.Body className="text-center">
              <div className="mb-3">
                <span className="display-4">💼</span>
              </div>
              <h3 className="h1 fw-bold mb-2">{stats.jobs}</h3>
              <p className="mb-3 opacity-75">Active Jobs</p>
              <ProgressBar now={stats.jobs > 0 ? 100 : 0} className="mb-0" variant="light" />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-4">
          <Card className="stats-card shadow-sm border-0 h-100 bg-gradient-success text-white">
            <Card.Body className="text-center">
              <div className="mb-3">
                <span className="display-4">👥</span>
              </div>
              <h3 className="h1 fw-bold mb-2">{stats.applicants}</h3>
              <p className="mb-3 opacity-75">Total Applicants</p>
              <ProgressBar now={stats.applicants > 0 ? Math.min((stats.applicants / 100) * 100, 100) : 0} className="mb-0" variant="light" />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-4">
          <Card className="stats-card shadow-sm border-0 h-100 bg-gradient-info text-white">
            <Card.Body className="text-center">
              <div className="mb-3">
                <span className="display-4">📅</span>
              </div>
              <h3 className="h1 fw-bold mb-2">{stats.interviews}</h3>
              <p className="mb-3 opacity-75">Interviews Scheduled</p>
              <ProgressBar now={stats.interviews > 0 ? Math.min((stats.interviews / 50) * 100, 100) : 0} className="mb-0" variant="light" />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-4">
          <Card className="stats-card shadow-sm border-0 h-100 bg-gradient-warning text-white">
            <Card.Body className="text-center">
              <div className="mb-3">
                <span className="display-4">🎯</span>
              </div>
              <h3 className="h1 fw-bold mb-2">{stats.offers}</h3>
              <p className="mb-3 opacity-75">Offers Made</p>
              <ProgressBar now={stats.offers > 0 ? Math.min((stats.offers / 20) * 100, 100) : 0} className="mb-0" variant="light" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Last Updated Info */}
      {lastUpdated && (
        <div className="text-center mb-3">
          <small className="text-muted">
            Last updated: {lastUpdated.toLocaleTimeString()} | Auto-refresh every 30 seconds
          </small>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-light border-0">
          <h2 className="h4 mb-0 fw-bold">⚡ Quick Actions</h2>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4} className="mb-3">
              <Link to="/company/jobs/post" className="text-decoration-none">
                <Card className="h-100 border-0 shadow-sm hover-shadow transition-all">
                  <Card.Body className="text-center">
                    <div className="mb-3">
                      <span className="display-4 text-primary">📝</span>
                    </div>
                    <h5 className="fw-bold text-primary">Post New Job</h5>
                    <p className="text-muted small mb-3">Create a comprehensive job posting with detailed requirements</p>
                    <Button variant="primary" className="w-100">
                      Get Started
                    </Button>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
            <Col md={4} className="mb-3">
              <Link to="/company/applicants" className="text-decoration-none">
                <Card className="h-100 border-0 shadow-sm hover-shadow transition-all">
                  <Card.Body className="text-center">
                    <div className="mb-3">
                      <span className="display-4 text-success">👥</span>
                    </div>
                    <h5 className="fw-bold text-success">View Applicants</h5>
                    <p className="text-muted small mb-3">Review and manage job applications with AI matching</p>
                    <Button variant="success" className="w-100">
                      View Now
                    </Button>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
            <Col md={4} className="mb-3">
              <Link to="/company/jobs" className="text-decoration-none">
                <Card className="h-100 border-0 shadow-sm hover-shadow transition-all">
                  <Card.Body className="text-center">
                    <div className="mb-3">
                      <span className="display-4 text-info">⚙️</span>
                    </div>
                    <h5 className="fw-bold text-info">Manage Jobs</h5>
                    <p className="text-muted small mb-3">Edit, update, or close your job postings</p>
                    <Button variant="info" className="w-100">
                      Manage
                    </Button>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          </Row>
        </Card.Body>
      </Card>


      </div>
    </>
  );
};

export default CompanyDashboard;
