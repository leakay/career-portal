// src/components/admin/AdminCompanies.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminCompanies = () => {
  const { logout } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCompanies([
        {
          id: '1',
          name: 'Tech Solutions Inc.',
          email: 'contact@techsolutions.com',
          status: 'approved',
          jobsPosted: 5,
          createdAt: new Date('2024-01-15')
        },
        {
          id: '2',
          name: 'Innovate Corp',
          email: 'hr@innovatecorp.com',
          status: 'pending',
          jobsPosted: 0,
          createdAt: new Date('2024-02-01')
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleApprove = (companyId) => {
    setCompanies(companies.map(company =>
      company.id === companyId ? { ...company, status: 'approved' } : company
    ));
  };

  const handleSuspend = (companyId) => {
    setCompanies(companies.map(company =>
      company.id === companyId ? { ...company, status: 'suspended' } : company
    ));
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading companies...</p>
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
          <h1>Company Management</h1>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" onClick={() => logout()}>
            Logout
          </Button>
          <Button variant="primary">Refresh</Button>
        </div>
      </div>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Registered Companies</h5>
        </Card.Header>
        <Card.Body>
          {companies.length === 0 ? (
            <p className="text-muted text-center">No companies found</p>
          ) : (
            <Table responsive>
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Jobs Posted</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td>{company.name}</td>
                    <td>{company.email}</td>
                    <td>
                      <Badge bg={
                        company.status === 'approved' ? 'success' :
                        company.status === 'pending' ? 'warning' : 'danger'
                      }>
                        {company.status}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg="info">{company.jobsPosted}</Badge>
                    </td>
                    <td>{company.createdAt.toLocaleDateString()}</td>
                    <td>
                      {company.status === 'pending' && (
                        <Button
                          variant="success"
                          size="sm"
                          className="me-1"
                          onClick={() => handleApprove(company.id)}
                        >
                          Approve
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleSuspend(company.id)}
                      >
                        Suspend
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

export default AdminCompanies;