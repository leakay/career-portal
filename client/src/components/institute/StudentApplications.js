// src/components/institute/StudentApplications.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Table, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { realApi } from '../../api/config';

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user from localStorage (assuming user is logged in)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.uid) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      const response = await realApi.getStudentApplications(user.uid);
      setApplications(response.data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      under_review: 'info'
    };
    return <Badge bg={statusMap[status] || 'secondary'}>{status || 'Unknown'}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Loading applications...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Applications</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchApplications}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button
            variant="outline-secondary"
            className="me-3"
            onClick={() => navigate('/student-dashboard')}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Back to Dashboard
          </Button>
          <h2 className="mb-0">My Applications</h2>
        </div>
        <Button variant="primary" onClick={fetchApplications}>
          Refresh
        </Button>
      </div>

      <Card>
        <Card.Body>
          {applications.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-file-earmark-x display-4 text-muted"></i>
              <h5 className="mt-3 text-muted">No Applications Found</h5>
              <p className="text-muted">You haven't submitted any applications yet.</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Institution</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <strong>{application.courseName || application.course || 'N/A'}</strong>
                      {application.facultyName && (
                        <div className="text-muted small">{application.facultyName}</div>
                      )}
                    </td>
                    <td>{application.institutionName || application.institutionId || 'N/A'}</td>
                    <td>{formatDate(application.appliedAt)}</td>
                    <td>{getStatusBadge(application.status)}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement view application details
                          alert('View details functionality to be implemented');
                        }}
                      >
                        View Details
                      </Button>
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

export default StudentApplications;
