// src/components/admin/AdminCompanies.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AdminCompanies = () => {
  const { logout } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch companies from Firebase API
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError('');

      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_BASE}/companies`);

      if (response.data.success) {
        setCompanies(response.data.data);
        setSuccess(`Loaded ${response.data.data.length} companies from database`);
      } else {
        setError('Failed to fetch companies');
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies: ' + (err.response?.data?.error || err.message));
      // Fallback to empty array
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleApprove = async (companyId) => {
    try {
      setError('');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.patch(`${API_BASE}/companies/${companyId}/status`, {
        status: 'approved'
      });

      if (response.data.success) {
        setSuccess('Company approved successfully');
        // Update local state
        setCompanies(companies.map(company =>
          company.id === companyId ? { ...company, status: 'approved' } : company
        ));
      } else {
        setError('Failed to approve company');
      }
    } catch (err) {
      console.error('Error approving company:', err);
      setError('Failed to approve company: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSuspend = async (companyId) => {
    const company = companies.find(c => c.id === companyId);
    const newStatus = company.status === 'suspended' ? 'approved' : 'suspended';
    const actionText = newStatus === 'suspended' ? 'suspend' : 'unsuspend';

    try {
      setError('');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.patch(`${API_BASE}/companies/${companyId}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        setSuccess(`Company ${actionText}ed successfully`);
        // Update local state
        setCompanies(companies.map(company =>
          company.id === companyId ? { ...company, status: newStatus } : company
        ));
      } else {
        setError(`Failed to ${actionText} company`);
      }
    } catch (err) {
      console.error(`Error ${actionText}ing company:`, err);
      setError(`Failed to ${actionText} company: ` + (err.response?.data?.error || err.message));
    }
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
          <Button variant="primary" onClick={fetchCompanies} disabled={loading}>
            {loading ? <Spinner size="sm" /> : '🔄 Refresh'}
          </Button>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
          <Alert.Heading>Connection Error</Alert.Heading>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

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
                    <td>
                      {company.createdAt
                        ? (company.createdAt.toDate
                            ? company.createdAt.toDate().toLocaleDateString()
                            : new Date(company.createdAt).toLocaleDateString())
                        : 'N/A'
                      }
                    </td>
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