// src/components/admin/AdminAdmissions.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Alert, Modal, Form, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { realApi } from '../../api/config';
import { useAuth } from '../contexts/AuthContext';

const AdminAdmissions = () => {
  const { logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('Fetching admissions data...');
      const [applicationsResponse, institutionsResponse] = await Promise.all([
        realApi.getApplications(),
        realApi.getInstitutions()
      ]);

      console.log('Applications data:', applicationsResponse);
      console.log('Institutions data:', institutionsResponse);

      setApplications(applicationsResponse.data || []);
      setInstitutions(institutionsResponse.data || []);

      setSuccess(`Loaded ${applicationsResponse.data?.length || 0} applications`);

    } catch (err) {
      console.error('Error in fetchData:', err);
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      console.log(`Attempting to update application ${applicationId} to ${newStatus}`);
      
      const result = await realApi.updateApplicationStatus(applicationId, newStatus);
      console.log('Update result:', result);
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      
      setShowModal(false);
      setSuccess(`Application status successfully updated to ${newStatus}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Error in handleStatusUpdate:', err);
      setError('Failed to update application: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const getFilteredApplications = () => {
    if (filter === 'all') return applications;
    return applications.filter(app => app.status === filter);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      admitted: 'primary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getAdmissionStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const approved = applications.filter(app => app.status === 'approved').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    const admitted = applications.filter(app => app.status === 'admitted').length;
    
    return { total, pending, approved, rejected, admitted };
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading admissions data...</p>
        </div>
      </Container>
    );
  }

  const filteredApplications = getFilteredApplications();
  const stats = getAdmissionStats();

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Button as={Link} to="/admin" variant="outline-secondary">
            ← Back to Dashboard
          </Button>
          <h1>Admissions Management</h1>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" onClick={() => logout()}>
            Logout
          </Button>
          <Button
            variant="outline-info"
            className="me-2"
            as="a"
            href="/admin/debug"
          >
            Debug API
          </Button>
          <Button variant="primary" onClick={fetchData}>
            Refresh
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Statistics */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total</Card.Title>
              <h2 className="text-primary">{stats.total}</h2>
              <small className="text-muted">Applications</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Pending</Card.Title>
              <h2 className="text-warning">{stats.pending}</h2>
              <small className="text-muted">Review</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Approved</Card.Title>
              <h2 className="text-success">{stats.approved}</h2>
              <small className="text-muted">Admissions</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Rejected</Card.Title>
              <h2 className="text-danger">{stats.rejected}</h2>
              <small className="text-muted">Applications</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Admitted</Card.Title>
              <h2 className="text-info">{stats.admitted}</h2>
              <small className="text-muted">Students</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Actions</Card.Title>
              <h2 className="text-secondary">{stats.pending}</h2>
              <small className="text-muted">Pending</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Rest of the component remains the same... */}
      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Filter Applications</h5>
            <div>
              <Button
                variant={filter === 'all' ? 'primary' : 'outline-primary'}
                size="sm"
                className="me-2"
                onClick={() => setFilter('all')}
              >
                All ({stats.total})
              </Button>
              <Button
                variant={filter === 'pending' ? 'warning' : 'outline-warning'}
                size="sm"
                className="me-2"
                onClick={() => setFilter('pending')}
              >
                Pending ({stats.pending})
              </Button>
              <Button
                variant={filter === 'approved' ? 'success' : 'outline-success'}
                size="sm"
                className="me-2"
                onClick={() => setFilter('approved')}
              >
                Approved ({stats.approved})
              </Button>
              <Button
                variant={filter === 'rejected' ? 'danger' : 'outline-danger'}
                size="sm"
                onClick={() => setFilter('rejected')}
              >
                Rejected ({stats.rejected})
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Applications Table - Same as before */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            Applications ({filteredApplications.length} found)
          </h5>
        </Card.Header>
        <Card.Body>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No applications found for the selected filter.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead className="table-dark">
                  <tr>
                    <th>Student</th>
                    <th>Institution</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <strong>{application.studentName || 'Unknown Student'}</strong>
                        {application.studentEmail && (
                          <div>
                            <small className="text-muted">{application.studentEmail}</small>
                          </div>
                        )}
                      </td>
                      <td>
                        <Badge bg="secondary">{application.institutionId}</Badge>
                      </td>
                      <td>{application.courseName || 'N/A'}</td>
                      <td>{getStatusBadge(application.status)}</td>
                      <td>
                        {new Date(
                          application.applicationDate?.toDate?.() || 
                          application.createdAt || 
                          new Date()
                        ).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewDetails(application)}
                          >
                            View
                          </Button>
                          {application.status === 'pending' && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleStatusUpdate(application.id, 'approved')}
                                disabled={actionLoading}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleStatusUpdate(application.id, 'rejected')}
                                disabled={actionLoading}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {application.status === 'approved' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleStatusUpdate(application.id, 'admitted')}
                              disabled={actionLoading}
                            >
                              Mark Admitted
                            </Button>
                          )}
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

      {/* Modal - Same as before */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Application Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApplication && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Student Name:</strong>
                  <p>{selectedApplication.studentName || 'Unknown'}</p>
                </Col>
                <Col md={6}>
                  <strong>Student Email:</strong>
                  <p>{selectedApplication.studentEmail || 'N/A'}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Institution:</strong>
                  <p>{selectedApplication.institutionId}</p>
                </Col>
                <Col md={6}>
                  <strong>Course:</strong>
                  <p>{selectedApplication.courseName || 'N/A'}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Current Status:</strong>
                  <p>{getStatusBadge(selectedApplication.status)}</p>
                </Col>
                <Col md={6}>
                  <strong>Applied Date:</strong>
                  <p>
                    {new Date(
                      selectedApplication.applicationDate?.toDate?.() || 
                      selectedApplication.createdAt || 
                      new Date()
                    ).toLocaleDateString()}
                  </p>
                </Col>
              </Row>
              
              <div className="border-top pt-3">
                <h6>Update Status:</h6>
                <div className="d-flex gap-2">
                  {selectedApplication.status === 'pending' && (
                    <>
                      <Button
                        variant="success"
                        onClick={() => handleStatusUpdate(selectedApplication.id, 'approved')}
                        disabled={actionLoading}
                      >
                        Approve Admission
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                        disabled={actionLoading}
                      >
                        Reject Application
                      </Button>
                    </>
                  )}
                  {selectedApplication.status === 'approved' && (
                    <Button
                      variant="primary"
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'admitted')}
                      disabled={actionLoading}
                    >
                      Mark as Admitted
                    </Button>
                  )}
                  {(selectedApplication.status === 'rejected' || selectedApplication.status === 'admitted') && (
                    <Button
                      variant="warning"
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'pending')}
                      disabled={actionLoading}
                    >
                      Reset to Pending
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminAdmissions;