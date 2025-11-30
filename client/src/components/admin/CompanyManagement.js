import React, { useEffect, useState } from "react";
import { Card, Button, Table, Container, Alert } from "react-bootstrap";
import { Link } from 'react-router-dom';
import { realApi } from '../../services/realApi';
import { useAuth } from '../contexts/AuthContext';

export default function CompanyManagement() {
  const { logout } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' or 'danger'

  // Fetch companies from backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await realApi.getCompanies();
        if (response.success && response.data) {
          setCompanies(response.data);
        } else {
          setCompanies([]);
        }
      } catch (err) {
        console.error("Failed to fetch companies:", err);
        setCompanies([]);
        setStatusMessage('Failed to load companies');
        setStatusType('danger');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Approve company
  const handleApprove = async (companyId) => {
    try {
      const response = await realApi.updateCompanyStatus(companyId, 'approved');
      if (response.success) {
        setCompanies(companies.map(c =>
          c.id === companyId ? { ...c, status: 'approved' } : c
        ));
        setStatusMessage('Company approved successfully');
        setStatusType('success');
      } else {
        throw new Error(response.error || 'Failed to approve company');
      }
    } catch (err) {
      console.error('Error approving company:', err);
      setStatusMessage('Failed to approve company');
      setStatusType('danger');
    }
  };

  // Reject company
  const handleReject = async (companyId) => {
    if (window.confirm('Are you sure you want to reject this company?')) {
      try {
        const response = await realApi.updateCompanyStatus(companyId, 'rejected');
        if (response.success) {
          setCompanies(companies.map(c =>
            c.id === companyId ? { ...c, status: 'rejected' } : c
          ));
          setStatusMessage('Company rejected successfully');
          setStatusType('success');
        } else {
          throw new Error(response.error || 'Failed to reject company');
        }
      } catch (err) {
        console.error('Error rejecting company:', err);
        setStatusMessage('Failed to reject company');
        setStatusType('danger');
      }
    }
  };

  // Suspend company
  const handleSuspend = async (companyId) => {
    if (window.confirm('Are you sure you want to suspend this company?')) {
      try {
        const response = await realApi.updateCompanyStatus(companyId, 'suspended');
        if (response.success) {
          setCompanies(companies.map(c =>
            c.id === companyId ? { ...c, status: 'suspended' } : c
          ));
          setStatusMessage('Company suspended successfully');
          setStatusType('success');
        } else {
          throw new Error(response.error || 'Failed to suspend company');
        }
      } catch (err) {
        console.error('Error suspending company:', err);
        setStatusMessage('Failed to suspend company');
        setStatusType('danger');
      }
    }
  };

  // Delete company
  const handleDelete = async (companyId) => {
    if (window.confirm('Are you sure you want to permanently delete this company? This action cannot be undone.')) {
      try {
        const response = await realApi.deleteCompany(companyId);
        if (response.success) {
          setCompanies(companies.filter(c => c.id !== companyId));
          setStatusMessage('Company deleted successfully');
          setStatusType('success');
        } else {
          throw new Error(response.error || 'Failed to delete company');
        }
      } catch (err) {
        console.error('Error deleting company:', err);
        setStatusMessage('Failed to delete company');
        setStatusType('danger');
      }
    }
  };

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
        </div>
      </div>

      <div className="bg-dark text-light p-4 rounded">
        <h2 className="mb-4 text-center">Company Management</h2>

        {statusMessage && (
          <Alert variant={statusType} dismissible onClose={() => setStatusMessage('')}>
            {statusMessage}
          </Alert>
        )}

      {/* Companies Table */}
      <Card className="card-custom p-3">
        <Table striped bordered hover variant="dark" responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Company Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Jobs Posted</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Loading companies...
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No companies found.
                </td>
              </tr>
            ) : (
              companies.map((c, index) => (
                <tr key={c.id || index}>
                  <td>{index + 1}</td>
                  <td>{c.companyName || c.name || 'N/A'}</td>
                  <td>{c.contactEmail || c.email || 'N/A'}</td>
                  <td>
                    <span className={`badge ${c.status === 'approved' ? 'bg-success' : c.status === 'pending' ? 'bg-warning' : c.status === 'suspended' ? 'bg-danger' : 'bg-secondary'}`}>
                      {c.status || 'pending'}
                    </span>
                  </td>
                  <td>{c.jobsPosted || 0}</td>
                  <td>{c.createdAt ? new Date(c.createdAt.seconds ? c.createdAt.seconds * 1000 : c.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    {c.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          className="me-2"
                          onClick={() => handleApprove(c.id)}
                        >
                          ✅ Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleReject(c.id)}
                        >
                          ❌ Reject
                        </Button>
                      </>
                    )}
                    {c.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => handleSuspend(c.id)}
                      >
                        🚫 Suspend
                      </Button>
                    )}
                    {c.status === 'suspended' && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleApprove(c.id)}
                      >
                        ✅ Reactivate
                      </Button>
                    )}
                    {c.status === 'rejected' && (
                      <span className="text-muted">Rejected</span>
                    )}
                    <Button
                      size="sm"
                      variant="outline-danger"
                      className="ms-2"
                      onClick={() => handleDelete(c.id)}
                      title="Delete Company"
                    >
                      🗑️ Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>


    </div>
    </Container>
  );
}
