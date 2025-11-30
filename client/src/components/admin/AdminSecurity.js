// src/components/admin/AdminSecurity.js
import React from 'react';
import { Container, Card, Alert, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminSecurity = () => {
  const { userProfile, isPredefinedAdmin, logout } = useAuth();

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Button as={Link} to="/admin" variant="outline-secondary">
            ← Back to Dashboard
          </Button>
          <h1>Security Settings</h1>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" onClick={() => logout()}>
            Logout
          </Button>
        </div>
      </div>

      <Card>
        <Card.Header className="bg-dark text-white">
          <h4 className="mb-0">🔒 Admin Security Information</h4>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <strong>Security Notice:</strong> Administrator access is restricted to predefined system accounts only.
          </Alert>

          <h5>Current Admin Status</h5>
          <Table striped bordered>
            <tbody>
              <tr>
                <td><strong>Logged in as:</strong></td>
                <td>{userProfile?.name || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>{userProfile?.email || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Role:</strong></td>
                <td>
                  <span className={`badge bg-${userProfile?.role === 'admin' ? 'danger' : 'secondary'}`}>
                    {userProfile?.role || 'N/A'}
                  </span>
                </td>
              </tr>
              <tr>
                <td><strong>Admin Type:</strong></td>
                <td>
                  {isPredefinedAdmin ? (
                    <span className="badge bg-success">Predefined System Admin</span>
                  ) : (
                    <span className="badge bg-warning">Regular User</span>
                  )}
                </td>
              </tr>
            </tbody>
          </Table>

          <h5 className="mt-4">Predefined Admin Accounts</h5>
          <Table striped bordered>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>admin@careerplatform.com</td>
                <td>System Administrator</td>
                <td><span className="badge bg-success">Active</span></td>
              </tr>
              <tr>
                <td>superadmin@careerplatform.com</td>
                <td>Super Administrator</td>
                <td><span className="badge bg-success">Active</span></td>
              </tr>
            </tbody>
          </Table>

          <Alert variant="warning" className="mt-3">
            <strong>Important:</strong> 
            <ul className="mb-0 mt-2">
              <li>Admin passwords should be changed regularly</li>
              <li>Never share admin credentials</li>
              <li>Use secure passwords with special characters</li>
              <li>Admin accounts cannot be created through public registration</li>
            </ul>
          </Alert>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminSecurity;