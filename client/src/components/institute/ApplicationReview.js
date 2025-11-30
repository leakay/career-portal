import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Row, Col, Alert } from 'react-bootstrap';
import { applicationsAPI } from '../../services/api';

const ApplicationReview = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const instituteId = 'sample-institute-id'; // Get from auth context

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await applicationsAPI.getByInstitute(instituteId);
      if (result.success) {
        setApplications(result.data);
      }
    } catch (error) {
      setError('Failed to fetch applications: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      await applicationsAPI.updateStatus(applicationId, newStatus);
      // Refresh the list
      fetchApplications();
    } catch (error) {
      setError('Failed to update application: ' + error.message);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'under_review': return 'info';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  // Filter applications by status
  const pendingApps = applications.filter(app => app.status === 'pending');
  const approvedApps = applications.filter(app => app.status === 'approved');
  const rejectedApps = applications.filter(app => app.status === 'rejected');

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Application Review</h2>
          <p className="text-muted">Manage and review all student applications</p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Quick Stats */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{applications.length}</h3>
              <p className="text-muted mb-0">Total Applications</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{pendingApps.length}</h3>
              <p className="text-muted mb-0">Pending Review</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{approvedApps.length}</h3>
              <p className="text-muted mb-0">Approved</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-danger">{rejectedApps.length}</h3>
              <p className="text-muted mb-0">Rejected</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Applications Table */}
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">All Applications</h4>
            <Button variant="primary" onClick={fetchApplications} disabled={loading}>
              Refresh
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <p>Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <Alert variant="info">
              No applications found. Make sure the backend is running and sample data is initialized.
            </Alert>
          ) : (
            <Table responsive striped>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>University</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(application => (
                  <tr key={application.id}>
                    <td>
                      <strong>{application.studentName}</strong>
                      <br />
                      <small className="text-muted">{application.studentEmail}</small>
                    </td>
                    <td>{application.course}</td>
                    <td>{application.institutionName}</td>
                    <td>
                      {application.appliedDate ? 
                        new Date(application.appliedDate.seconds * 1000).toLocaleDateString() : 
                        'N/A'
                      }
                    </td>
                    <td>
                      <Badge bg={getStatusVariant(application.status)}>
                        {application.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="btn-group">
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => handleUpdateStatus(application.id, 'approved')}
                          disabled={application.status === 'approved'}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleUpdateStatus(application.id, 'rejected')}
                          disabled={application.status === 'rejected'}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ApplicationReview;