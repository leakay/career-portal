// src/components/admin/AdminUsers.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Alert, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { realApi } from '../../api/config';
import { useAuth } from '../contexts/AuthContext';

const AdminUsers = () => {
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Fetching user data...');

      const applicationsResponse = await realApi.getApplications();
      console.log('Applications response:', applicationsResponse);

      const applicationsData = applicationsResponse.data || [];
      setApplications(applicationsData);

      // Extract unique students from applications
      const uniqueStudents = [];
      const studentMap = new Map();

      applicationsData.forEach(app => {
        if (app.studentId && !studentMap.has(app.studentId)) {
          studentMap.set(app.studentId, true);
          uniqueStudents.push({
            id: app.studentId,
            name: app.studentName || 'Unknown Student',
            email: app.studentEmail || 'N/A',
            applicationCount: applicationsData.filter(a => a.studentId === app.studentId).length,
            institutions: [...new Set(applicationsData
              .filter(a => a.studentId === app.studentId)
              .map(a => a.institutionId)
            )],
            statuses: [...new Set(applicationsData
              .filter(a => a.studentId === app.studentId)
              .map(a => a.status)
            )]
          });
        }
      });

      console.log('Unique students found:', uniqueStudents);
      setUsers(uniqueStudents);

    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserStatus = (user) => {
    if (user.applicationCount > 2) {
      return { text: 'Multiple Applications', variant: 'warning' };
    }
    if (user.statuses.includes('approved')) {
      return { text: 'Admitted', variant: 'success' };
    }
    if (user.statuses.includes('pending')) {
      return { text: 'Pending Review', variant: 'primary' };
    }
    return { text: 'Applied', variant: 'secondary' };
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading users...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Button as={Link} to="/admin" variant="outline-secondary">
            ← Back to Dashboard
          </Button>
          <h1>User Management</h1>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" onClick={() => logout()}>
            Logout
          </Button>
          <Button variant="primary" onClick={fetchData}>
            Refresh
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Students</Card.Title>
              <h2 className="text-primary">{users.length}</h2>
              <small className="text-muted">Registered</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Applications</Card.Title>
              <h2 className="text-success">{applications.length}</h2>
              <small className="text-muted">Submitted</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Avg Applications</Card.Title>
              <h2 className="text-warning">
                {users.length > 0 ? (applications.length / users.length).toFixed(1) : 0}
              </h2>
              <small className="text-muted">Per Student</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Multiple Apps</Card.Title>
              <h2 className="text-danger">
                {users.filter(user => user.applicationCount > 2).length}
              </h2>
              <small className="text-muted">Violations</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">
            Registered Students ({users.length} students, {applications.length} applications)
          </h5>
        </Card.Header>
        <Card.Body>
          {users.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No students found in the system.</p>
              <Button variant="primary" onClick={fetchData}>
                Check Again
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Applications</th>
                    <th>Institutions</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => {
                    const status = getUserStatus(user);
                    return (
                      <tr key={user.id}>
                        <td>{index + 1}</td>
                        <td>
                          <code title={user.id}>
                            {user.id.length > 12 ? `${user.id.substring(0, 12)}...` : user.id}
                          </code>
                        </td>
                        <td>
                          <strong>{user.name}</strong>
                          {user.email && user.email !== 'N/A' && (
                            <div>
                              <small className="text-muted">{user.email}</small>
                            </div>
                          )}
                        </td>
                        <td>
                          <Badge 
                            bg={user.applicationCount > 2 ? 'danger' : 'primary'}
                            title={`${user.applicationCount} applications`}
                          >
                            {user.applicationCount}
                            {user.applicationCount > 2 && ' ⚠️'}
                          </Badge>
                        </td>
                        <td>
                          <div style={{ maxWidth: '200px' }}>
                            {user.institutions.slice(0, 3).map(inst => (
                              <Badge 
                                key={inst} 
                                bg="secondary" 
                                className="me-1 mb-1"
                                style={{ fontSize: '0.7rem' }}
                              >
                                {inst}
                              </Badge>
                            ))}
                            {user.institutions.length > 3 && (
                              <Badge bg="light" text="dark" style={{ fontSize: '0.7rem' }}>
                                +{user.institutions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td>
                          <Badge bg={status.variant}>
                            {status.text}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              const userApps = applications.filter(app => app.studentId === user.id);
                              alert(`Student: ${user.name}\nApplications: ${userApps.length}\nInstitutions: ${user.institutions.join(', ')}`);
                            }}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Summary Information */}
      {users.length > 0 && (
        <Card className="mt-4">
          <Card.Header>
            <h6 className="mb-0">Summary Information</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h6>Application Distribution:</h6>
                <ul className="list-unstyled">
                  <li>• Students with 1 application: {users.filter(u => u.applicationCount === 1).length}</li>
                  <li>• Students with 2 applications: {users.filter(u => u.applicationCount === 2).length}</li>
                  <li>• Students with 3+ applications: {users.filter(u => u.applicationCount > 2).length}</li>
                </ul>
              </Col>
              <Col md={6}>
                <h6>Status Overview:</h6>
                <ul className="list-unstyled">
                  <li>• Admitted students: {users.filter(u => u.statuses.includes('approved')).length}</li>
                  <li>• Pending review: {users.filter(u => u.statuses.includes('pending')).length}</li>
                  <li>• Multiple institution apps: {users.filter(u => u.institutions.length > 1).length}</li>
                </ul>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default AdminUsers;