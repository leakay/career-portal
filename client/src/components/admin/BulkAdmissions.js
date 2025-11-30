// src/components/admin/BulkAdmissions.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Alert, Form, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { realApi } from '../../api/config';
import { useAuth } from '../contexts/AuthContext';

const BulkAdmissions = () => {
  const { logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [selectedApps, setSelectedApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await realApi.getApplications();
      setApplications(response.data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedApps(applications.map(app => app.id));
    } else {
      setSelectedApps([]);
    }
  };

  const handleSelectApp = (appId) => {
    setSelectedApps(prev =>
      prev.includes(appId)
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const handleBulkAction = async (action) => {
    if (selectedApps.length === 0) {
      alert('Please select at least one application');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${action} ${selectedApps.length} application(s)?`)) {
      return;
    }

    try {
      setActionLoading(true);

      // Perform bulk action
      const promises = selectedApps.map(appId =>
        realApi.updateApplicationStatus(appId, action)
      );

      await Promise.all(promises);

      // Refresh data
      await fetchApplications();
      setSelectedApps([]);

      alert(`Successfully ${action} ${selectedApps.length} application(s)`);

    } catch (err) {
      alert('Error performing bulk action: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const pendingApplications = applications.filter(app => app.status === 'pending');

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Button as={Link} to="/admin/dashboard" variant="outline-secondary">
            ← Back to Dashboard
          </Button>
          <h1>Bulk Admissions Management</h1>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" onClick={() => logout()}>
            Logout
          </Button>
        </div>
      </div>
      
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Bulk Actions</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex gap-2 mb-3">
            <Button
              variant="success"
              onClick={() => handleBulkAction('approved')}
              disabled={actionLoading || selectedApps.length === 0}
            >
              Approve Selected ({selectedApps.length})
            </Button>
            <Button
              variant="danger"
              onClick={() => handleBulkAction('rejected')}
              disabled={actionLoading || selectedApps.length === 0}
            >
              Reject Selected ({selectedApps.length})
            </Button>
            <Button
              variant="warning"
              onClick={() => setSelectedApps([])}
              disabled={selectedApps.length === 0}
            >
              Clear Selection
            </Button>
          </div>
          <p className="text-muted">
            Select applications below to perform bulk actions. Currently showing pending applications.
          </p>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Pending Applications ({pendingApplications.length})</h5>
            <Form.Check
              type="checkbox"
              label="Select All"
              checked={selectedApps.length === pendingApplications.length && pendingApplications.length > 0}
              onChange={handleSelectAll}
            />
          </div>
        </Card.Header>
        <Card.Body>
          {pendingApplications.length === 0 ? (
            <p className="text-muted text-center">No pending applications found.</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Select</th>
                  <th>Student</th>
                  <th>Institution</th>
                  <th>Course</th>
                  <th>Applied Date</th>
                </tr>
              </thead>
              <tbody>
                {pendingApplications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedApps.includes(app.id)}
                        onChange={() => handleSelectApp(app.id)}
                      />
                    </td>
                    <td>{app.studentName || 'Unknown'}</td>
                    <td>{app.institutionId}</td>
                    <td>{app.courseName || 'N/A'}</td>
                    <td>
                      {new Date(
                        app.applicationDate?.toDate?.() || app.createdAt
                      ).toLocaleDateString()}
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

export default BulkAdmissions;