import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Nav, Alert, Spinner } from 'react-bootstrap';
import InstituteSidebar from './InstituteSidebar';
import { applicationsAPI, checkHealth, realApi } from '../../services/api';
import FacultyManagement from './FacultyManagement';
import CourseManagement from './CourseManagement';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './InstituteDashboard.css';

const InstituteDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applications, setApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]); // Store all applications
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Try different institute IDs
  const instituteIds = ['limkokwing', 'nul', 'botho'];
  const [currentInstituteId, setCurrentInstituteId] = useState('limkokwing');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    checkBackendHealth();
    fetchAllApplications(); // Fetch all applications on load
  }, []);

  const checkBackendHealth = async () => {
    setLoading(true);
    setError('');
    try {
      const healthData = await checkHealth();
      setHealth(healthData);
      setSuccess('Backend connected successfully!');
    } catch (error) {
      setError('Failed to connect to backend: ' + error.message);
      setHealth({ status: 'ERROR', database: 'Disconnected' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch ALL applications (no filtering)
  const fetchAllApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await realApi.getApplications(); // No institute ID = get all
      if (result.success) {
        setAllApplications(result.data);
        filterApplicationsByInstitute(currentInstituteId, result.data);
        setSuccess(`Loaded ${result.data.length} total applications from database`);
      }
    } catch (error) {
      setError('Failed to fetch applications: ' + error.message);
      setAllApplications([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter applications by institute
  const filterApplicationsByInstitute = (instituteId, apps = allApplications) => {
    const filtered = apps.filter(app =>
      app.institutionId && app.institutionId.toLowerCase() === instituteId.toLowerCase()
    );
    setApplications(filtered);
    setCurrentInstituteId(instituteId);
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      await applicationsAPI.updateStatus(applicationId, newStatus);
      setSuccess(`Application status updated to ${newStatus}`);
      // Refresh applications list
      fetchAllApplications();
    } catch (error) {
      setError('Failed to update application status: ' + error.message);
    }
  };

  const getStatusVariant = (status) => {
    const statusLower = status ? status.toLowerCase() : '';
    switch (statusLower) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'under review': return 'info';
      case 'pending': return 'warning';
      case 'pemding': return 'warning';
      default: return 'secondary';
    }
  };

  const formatStatusText = (status) => {
    return status ? status.toUpperCase() : 'UNKNOWN';
  };

  // Calculate stats from ALL data
  const stats = {
    total: allApplications.length,
    pending: allApplications.filter(app => {
      const status = app.status ? app.status.toLowerCase() : '';
      return status === 'pending' || status === 'pemding' || status === 'under review';
    }).length,
    approved: allApplications.filter(app =>
      app.status && app.status.toLowerCase() === 'approved'
    ).length,
    rejected: allApplications.filter(app =>
      app.status && app.status.toLowerCase() === 'rejected'
    ).length,
  };

  // Get unique institute IDs from all applications
  const availableInstitutes = [...new Set(allApplications.map(app => app.institutionId).filter(Boolean))];

  return (
    <div className="institute-dashboard">
      <InstituteSidebar onTabChange={setActiveTab} />

      <div className="institute-main-content">
        <Container fluid className="py-4">
          {/* Header */}
          <Card className="mb-4 dashboard-header">
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <h1 className="text-white mb-1">Institute Dashboard</h1>
                  <p className="text-light mb-0">Manage university applications - REAL DATA</p>

                  {health && (
                    <Badge
                      bg={health.status === 'OK' ? 'success' : 'danger'}
                      className="mt-2"
                    >
                      {health.status === 'OK' ? '✅ Backend Connected' : '❌ Backend Error'}
                    </Badge>
                  )}
                </Col>
                <Col xs="auto">
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-light"
                      onClick={checkBackendHealth}
                      disabled={loading}
                    >
                      {loading ? <Spinner size="sm" /> : 'Check Health'}
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Connection Error</Alert.Heading>
          {error}
        </Alert>
      )}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Navigation Tabs */}
      <Card className="mb-4">
        <Card.Body className="p-0">
          <Nav variant="tabs" className="px-3">
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'dashboard'}
                onClick={() => setActiveTab('dashboard')}
                className="fw-bold"
              >
                📊 Dashboard
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'faculties'}
                onClick={() => setActiveTab('faculties')}
                className="fw-bold"
              >
                🏫 Manage Faculties
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'courses'}
                onClick={() => setActiveTab('courses')}
                className="fw-bold"
              >
                📚 Manage Courses
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'applications'}
                onClick={() => setActiveTab('applications')}
                className="fw-bold"
              >
                📝 Applications
                {stats.pending > 0 && (
                  <Badge bg="danger" className="ms-2">
                    {stats.pending}
                  </Badge>
                )}
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Body>
      </Card>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          <Row>
            <Col md={3} className="mb-3">
              <Card className="text-center border-0 shadow-sm h-100 stat-card">
                <Card.Body className="d-flex flex-column justify-content-center">
                  <h2 className="text-primary mb-0">{stats.total}</h2>
                  <p className="text-muted mb-0">Total Applications</p>
                  <small className="text-info">Live from Firebase</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center border-0 shadow-sm h-100 stat-card">
                <Card.Body className="d-flex flex-column justify-content-center">
                  <h2 className="text-warning mb-0">{stats.pending}</h2>
                  <p className="text-muted mb-0">Pending Review</p>
                  <small className="text-info">Live from Firebase</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center border-0 shadow-sm h-100 stat-card">
                <Card.Body className="d-flex flex-column justify-content-center">
                  <h2 className="text-success mb-0">{stats.approved}</h2>
                  <p className="text-muted mb-0">Approved</p>
                  <small className="text-info">Live from Firebase</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center border-0 shadow-sm h-100 stat-card">
                <Card.Body className="d-flex flex-column justify-content-center">
                  <h2 className="text-danger mb-0">{stats.rejected}</h2>
                  <p className="text-muted mb-0">Rejected</p>
                  <small className="text-info">Live from Firebase</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Institute Selection */}
          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">Select Institute</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex gap-2 flex-wrap">
                {availableInstitutes.map(instituteId => (
                  <Button
                    key={instituteId}
                    variant={currentInstituteId === instituteId ? 'primary' : 'outline-primary'}
                    onClick={() => filterApplicationsByInstitute(instituteId)}
                  >
                    {instituteId.toUpperCase()}
                  </Button>
                ))}
                <Button
                  variant={!currentInstituteId ? 'primary' : 'outline-secondary'}
                  onClick={() => {
                    setApplications(allApplications);
                    setCurrentInstituteId('');
                  }}
                >
                  Show All
                </Button>
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      {/* Faculties Tab */}
      {activeTab === 'faculties' && (
        <FacultyManagement onBack={() => setActiveTab('dashboard')} />
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <CourseManagement onBack={() => setActiveTab('dashboard')} />
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0 text-dark">Application Management - REAL DATA</h4>
                {currentInstituteId && (
                  <small className="text-muted">Showing applications for: {currentInstituteId}</small>
                )}
              </div>
              <div className="d-flex gap-2">
                {/* Institute Selection */}
                <select
                  className="form-select"
                  value={currentInstituteId}
                  onChange={(e) => filterApplicationsByInstitute(e.target.value)}
                  style={{width: 'auto'}}
                >
                  <option value="">All Institutes</option>
                  {availableInstitutes.map(instituteId => (
                    <option key={instituteId} value={instituteId}>
                      {instituteId.toUpperCase()}
                    </option>
                  ))}
                </select>

                <Button
                  variant="primary"
                  onClick={fetchAllApplications}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : '🔄 Refresh'}
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            {loading && allApplications.length === 0 ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Loading applications from Firebase...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-5">
                <div className="text-muted mb-3">
                  <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                </div>
                <h5 className="text-dark">
                  {currentInstituteId
                    ? `No applications found for institute: ${currentInstituteId}`
                    : 'No applications found in database'
                  }
                </h5>
                <p className="text-muted">
                  {availableInstitutes.length > 0 && (
                    <>Available institutes: {availableInstitutes.join(', ')}</>
                  )}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table striped hover className="application-table">
                  <thead className="table-dark">
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>University</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                      <th>Institute</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(application => (
                      <tr key={application.id}>
                        <td>
                          <strong className="text-dark">{application.studentName}</strong>
                          <br />
                          <small className="text-muted">{application.studentEmail}</small>
                        </td>
                        <td className="text-dark">{application.courseName}</td>
                        <td className="text-dark">{application.institutionName}</td>
                        <td className="text-dark">
                          {application.applicationDate && application.applicationDate._seconds ?
                            new Date(application.applicationDate._seconds * 1000).toLocaleDateString() :
                            'N/A'
                          }
                        </td>
                        <td>
                          <Badge bg={getStatusVariant(application.status)}>
                            {formatStatusText(application.status)}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg="info">{application.institutionId}</Badge>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleUpdateStatus(application.id, 'approved')}
                              disabled={application.status && application.status.toLowerCase() === 'approved'}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleUpdateStatus(application.id, 'rejected')}
                              disabled={application.status && application.status.toLowerCase() === 'rejected'}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
        </Container>
      </div>
    </div>
  );
};

export default InstituteDashboard;