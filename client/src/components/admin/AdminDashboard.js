// src/components/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { realApi } from '../../api/config';
import { useAuth } from '../contexts/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInstitutions: 0,
    totalCompanies: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    pendingCompanies: 0,
    activeCompanies: 0,
    suspendedCompanies: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPublishAdmissions, setShowPublishAdmissions] = useState(false);
  const [showAddInstitution, setShowAddInstitution] = useState(false);
  const [newInstitution, setNewInstitution] = useState({ name: '', code: '', type: 'university', location: '', contactEmail: '' });
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [applicationsResponse, institutionsResponse, companiesResponse, statsResponse] = await Promise.all([
        realApi.getApplications(),
        realApi.getInstitutions(),
        realApi.getCompanies('pending'),
        realApi.getSystemStats()
      ]);

      const applications = applicationsResponse.data || [];
      const institutions = institutionsResponse.data || [];
      const companies = companiesResponse.data || [];
      const systemStats = statsResponse.data || {};

      // Use system stats if available, otherwise calculate manually
      if (Object.keys(systemStats).length > 0) {
        // Ensure stats are numbers
        const processedStats = {
          totalUsers: Number(systemStats.totalUsers) || 0,
          totalInstitutions: Number(systemStats.totalInstitutions) || 0,
          totalCompanies: Number(systemStats.totalCompanies) || 0,
          totalApplications: Number(systemStats.totalApplications) || 0,
          pendingApplications: Number(systemStats.pendingApplications) || 0,
          approvedApplications: Number(systemStats.approvedApplications) || 0,
          rejectedApplications: Number(systemStats.rejectedApplications) || 0,
          pendingCompanies: Number(systemStats.pendingCompanies) || 0,
          activeCompanies: Number(systemStats.activeCompanies) || 0,
          suspendedCompanies: Number(systemStats.suspendedCompanies) || 0
        };
        setStats(processedStats);
      } else {
        // Fallback calculation
        const uniqueStudents = [...new Set(applications.map(app => app.studentId))];
        const pendingApplications = applications.filter(app => app.status === 'pending').length;
        const approvedApplications = applications.filter(app => app.status === 'approved').length;
        const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

        setStats({
          totalUsers: uniqueStudents.length,
          totalInstitutions: institutionsData.length,
          totalCompanies: companies.length,
          totalApplications: applications.length,
          pendingApplications,
          approvedApplications,
          rejectedApplications,
          pendingCompanies: companies.filter(c => c.status === 'pending').length,
          activeCompanies: companies.filter(c => c.status === 'approved').length,
          suspendedCompanies: companies.filter(c => c.status === 'suspended').length
        });
      }

      // Get recent applications (last 5) and ensure proper data format with string conversion
      const formattedApplications = applications.slice(0, 5).map(app => ({
        id: String(app.id || ''),
        studentName: typeof app.studentName === 'object' ? String(app.studentName?.name || 'Unknown Student') : String(app.studentName || 'Unknown Student'),
        studentEmail: typeof app.studentEmail === 'object' ? String(app.studentEmail?.email || '') : String(app.studentEmail || ''),
        institutionId: typeof app.institutionId === 'object' ? String(app.institutionId?.name || 'Unknown Institution') : String(app.institutionId || 'Unknown Institution'),
        courseName: typeof app.courseName === 'object' ? String(app.courseName?.name || 'N/A') : String(app.courseName || 'N/A'),
        status: String(app.status || 'pending'),
        applicationDate: app.applicationDate || app.createdAt || new Date()
      }));

      // Process companies to ensure all fields are strings
      const processedCompanies = companies.map(company => ({
        id: String(company.id || ''),
        name: typeof company.name === 'object' ? String(company.name?.name || 'Unknown Company') : String(company.name || 'Unknown Company'),
        status: String(company.status || 'pending')
      }));

      setRecentApplications(formattedApplications);
      setPendingCompanies(processedCompanies);

    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data: ' + err.message);

      // Set default stats on error
      setStats({
        totalUsers: 0,
        totalInstitutions: 0,
        totalCompanies: 0,
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        pendingCompanies: 0,
        activeCompanies: 0,
        suspendedCompanies: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Logout failed. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      admitted: 'primary',
      suspended: 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  // Safe date formatting function
  const formatDate = (dateValue) => {
    try {
      if (!dateValue) return 'N/A';

      let date;
      if (dateValue.toDate) {
        // Firebase timestamp
        date = dateValue.toDate();
      } else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        date = new Date();
      }

      return date.toLocaleDateString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  // Safe text display function
  const safeDisplay = (value, fallback = 'N/A') => {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'object') {
      // Handle Firebase timestamps
      if (value && typeof value.toDate === 'function') {
        return value.toDate().toLocaleDateString();
      }
      // Handle arrays
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : fallback;
      }
      // Handle plain objects - try to get a meaningful string
      try {
        const str = JSON.stringify(value);
        return str.length > 100 ? '[Object]' : str;
      } catch (e) {
        return '[Complex Object]';
      }
    }
    return String(value);
  };



  const handlePublishAdmissions = async () => {
    if (!selectedInstitution) {
      setError('Please select an institution');
      return;
    }

    try {
      const result = await realApi.publishAdmissions(selectedInstitution, {
        academicYear: new Date().getFullYear(),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      if (result.success) {
        alert('Admissions published successfully!');
        setShowPublishAdmissions(false);
        setSelectedInstitution('');
        fetchDashboardData();
      }
    } catch (err) {
      setError('Failed to publish admissions: ' + err.message);
    }
  };

  const handleCompanyAction = async (companyId, action) => {
    try {
      const result = await realApi.updateCompanyStatus(companyId, action);
      if (result.success) {
        alert(`Company ${action} successfully!`);
        fetchDashboardData();
      }
    } catch (err) {
      setError(`Failed to ${action} company: ` + err.message);
    }
  };

  const handleAddInstitution = async (e) => {
    e.preventDefault();
    try {
      const result = await realApi.createInstitution(newInstitution);
      if (result.success) {
        alert('Institution added successfully!');
        setShowAddInstitution(false);
        setNewInstitution({ name: '', code: '', type: 'university', location: '', contactEmail: '' });
        fetchDashboardData();
      }
    } catch (err) {
      setError('Failed to add institution: ' + err.message);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading admin dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <div className="admin-main-content">
        <Container className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>Admin Dashboard</h1>
              <p className="text-muted">Complete system administration and management</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-danger" onClick={handleLogout}>
                Logout
              </Button>
              <Button variant="primary" onClick={fetchDashboardData}>
                Refresh Data
              </Button>
            </div>
          </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* System Overview Statistics */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="text-center border-primary">
            <Card.Body>
              <div className="text-primary mb-2">🏫</div>
              <Card.Title>Institutions</Card.Title>
              <h2 className="text-primary">{safeDisplay(stats.totalInstitutions)}</h2>
              <small className="text-muted">Higher Learning</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-success">
            <Card.Body>
              <div className="text-success mb-2">👥</div>
              <Card.Title>Students</Card.Title>
              <h2 className="text-success">{safeDisplay(stats.totalUsers)}</h2>
              <small className="text-muted">Registered</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-warning">
            <Card.Body>
              <div className="text-warning mb-2">📋</div>
              <Card.Title>Applications</Card.Title>
              <h2 className="text-warning">{safeDisplay(stats.totalApplications)}</h2>
              <small className="text-muted">Total</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-danger">
            <Card.Body>
              <div className="text-danger mb-2">⏳</div>
              <Card.Title>Pending</Card.Title>
              <h2 className="text-danger">{safeDisplay(stats.pendingApplications)}</h2>
              <small className="text-muted">For Review</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-info">
            <Card.Body>
              <div className="text-info mb-2">🏢</div>
              <Card.Title>Companies</Card.Title>
              <h2 className="text-info">{safeDisplay(stats.totalCompanies)}</h2>
              <small className="text-muted">Registered</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-secondary">
            <Card.Body>
              <div className="text-secondary mb-2">📊</div>
              <Card.Title>Pending</Card.Title>
              <h2 className="text-secondary">{safeDisplay(stats.pendingCompanies)}</h2>
              <small className="text-muted">Company Approvals</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Core Admin Functions */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">🔧 Core Administration Functions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {/* Institution Management */}
                <Col md={4} className="mb-3">
                  <Card className="h-100">
                    <Card.Body className="text-center">
                      <div className="text-primary mb-3" style={{ fontSize: '2rem' }}>🏫</div>
                      <Card.Title>Institution Management</Card.Title>
                      <Card.Text>
                        Add and manage higher learning institutions, faculties, and courses
                      </Card.Text>
                      <div className="d-grid gap-2">
                        {/* Add Institution button removed */}
                        <Button as={Link} to="/admin/faculties" variant="outline-info">
                          Manage Faculties
                        </Button>
                        <Button as={Link} to="/admin/courses" variant="outline-success">
                          Manage Courses
                        </Button>
                        <Button as={Link} to="/admin/institutions" variant="outline-secondary">
                          View All Institutions
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Admissions Management */}
                <Col md={4} className="mb-3">
                  <Card className="h-100">
                    <Card.Body className="text-center">
                      <div className="text-success mb-3" style={{ fontSize: '2rem' }}>🎓</div>
                      <Card.Title>Admissions Management</Card.Title>
                      <Card.Text>
                        Publish admissions and monitor student applications
                      </Card.Text>
                      <div className="d-grid gap-2">
                        <Button
                          as={Link}
                          to="/admin/admissions"
                          variant="success"
                        >
                          Manage Admissions
                        </Button>
                        <Button
                          variant="outline-success"
                          onClick={() => setShowPublishAdmissions(true)}
                        >
                          Publish Admissions
                        </Button>
                        <Button as={Link} to="/admin/users" variant="outline-info">
                          Monitor Users
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Company Management */}
                <Col md={4} className="mb-3">
                  <Card className="h-100">
                    <Card.Body className="text-center">
                      <div className="text-warning mb-3" style={{ fontSize: '2rem' }}>🏢</div>
                      <Card.Title>Company Management</Card.Title>
                      <Card.Text>
                        Approve, suspend, or delete company accounts
                      </Card.Text>
                      <div className="d-grid gap-2">
                        <Button as={Link} to="/admin/companies" variant="warning">
                          Manage Companies
                        </Button>
                        <Button
                          as={Link}
                          to="/admin/companies?filter=pending"
                          variant="outline-warning"
                        >
                          Pending Approvals ({safeDisplay(stats.pendingCompanies)})
                        </Button>
                        <Button as={Link} to="/admin/reports" variant="outline-dark">
                          View Reports
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions & Recent Activity */}
      <Row>
        {/* Recent Applications */}
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📄 Recent Applications</h5>
              <Button as={Link} to="/admin/admissions" variant="outline-primary" size="sm">
                View All Applications
              </Button>
            </Card.Header>
            <Card.Body>
              {recentApplications.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No applications found in the system.</p>
                  <Button as={Link} to="/admin/admissions" variant="primary">
                    Go to Admissions
                  </Button>
                </div>
              ) : (
                <Table responsive striped hover>
                  <thead className="table-dark">
                    <tr>
                      <th>Student</th>
                      <th>Institution</th>
                      <th>Course</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <strong>{safeDisplay(app.studentName)}</strong>
                          {app.studentEmail && (
                            <div>
                              <small className="text-muted">{safeDisplay(app.studentEmail)}</small>
                            </div>
                          )}
                        </td>
                        <td>
                          <Badge bg="secondary">{safeDisplay(app.institutionId)}</Badge>
                        </td>
                        <td>{safeDisplay(app.courseName)}</td>
                        <td>{getStatusBadge(app.status)}</td>
                        <td>{formatDate(app.applicationDate)}</td>
                        <td>
                          <Button
                            as={Link}
                            to="/admin/admissions"
                            variant="outline-primary"
                            size="sm"
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          {/* Pending Company Approvals */}
          {pendingCompanies.length > 0 && (
            <Card>
              <Card.Header className="bg-warning text-dark">
                <h5 className="mb-0">⚠️ Pending Company Approvals</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCompanies.map((company) => (
                      <tr key={company.id}>
                        <td>
                          <strong>{safeDisplay(company.name)}</strong>
                        </td>
                        <td>{getStatusBadge(company.status)}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleCompanyAction(company.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleCompanyAction(company.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Quick Actions Sidebar */}
        <Col md={4}>
          {/* System Status */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">🖥️ System Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Backend:</strong>
                <Badge bg="success" className="ms-2">Connected</Badge>
              </div>
              <div className="mb-3">
                <strong>Database:</strong>
                <Badge bg="success" className="ms-2">Online</Badge>
              </div>
              <div className="mb-3">
                <strong>Applications:</strong>
                <span className="ms-2">{safeDisplay(stats.totalApplications)} records</span>
              </div>
              <div>
                <strong>Last Updated:</strong>
                <span className="ms-2">{new Date().toLocaleTimeString()}</span>
              </div>
            </Card.Body>
          </Card>

          {/* Quick Links */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">⚡ Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button as={Link} to="/admin/institutions" variant="outline-primary">
                  🏫 Manage Institutions
                </Button>
                <Button as={Link} to="/admin/admissions" variant="outline-success">
                  🎓 Manage Admissions
                </Button>
                <Button as={Link} to="/admin/companies" variant="outline-warning">
                  🏢 Manage Companies
                </Button>
                <Button as={Link} to="/admin/users" variant="outline-info">
                  👥 Manage Users
                </Button>
                <Button as={Link} to="/admin/reports" variant="outline-dark">
                  📊 System Reports
                </Button>
                <Button as={Link} to="/admin/security" variant="outline-secondary">
                  🔒 Security Settings
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>



      {/* Publish Admissions Modal */}
      <Modal show={showPublishAdmissions} onHide={() => { setShowPublishAdmissions(false); setSelectedInstitution(''); }}>
        <Modal.Header closeButton>
          <Modal.Title>Publish Admissions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Select an institution to publish admissions for:</p>
          <Form.Group className="mb-3">
            <Form.Label>Select Institution</Form.Label>
            <Form.Select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
            >
              <option value="">Choose an institution...</option>
              {institutions.map(institution => (
                <option key={institution.id} value={institution.id}>
                  {institution.name} ({institution.code})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Alert variant="info">
            This will make the admission applications publicly available for the selected institution.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowPublishAdmissions(false); setSelectedInstitution(''); }}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handlePublishAdmissions}
            disabled={!selectedInstitution}
          >
            Publish Admissions
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Institution modal removed */}
        </Container>
      </div>
    </div>
  );
};

export default AdminDashboard;
