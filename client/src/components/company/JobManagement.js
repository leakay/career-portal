import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Alert, Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const { user, userProfile } = useAuth();

  const fetchJobs = async () => {
    try {
      // Prefer fetching jobs for the current company
      const companyId = userProfile?.companyId || user?.uid;
      const url = companyId
        ? `http://localhost:5000/companies/${companyId}/jobs`
        : 'http://localhost:5000/jobs';

      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errText = await response.text().catch(() => null);
        throw new Error(errText || 'Failed to fetch jobs');
      }

      const data = await response.json();
        setJobs(data.data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setShowEditModal(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`http://localhost:5000/jobs/${jobId}`, {
          method: 'DELETE',
          headers
        });

        if (!response.ok) {
          throw new Error('Failed to delete job');
        }

        setJobs(jobs.filter(job => job.id !== jobId));
        setStatus('✅ Job deleted successfully');
        setTimeout(() => setStatus(''), 3000);
      } catch (err) {
        console.error('Error deleting job:', err);
        setError('Failed to delete job');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`http://localhost:5000/jobs/${selectedJob.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(selectedJob)
      });

      if (!response.ok) {
        throw new Error('Failed to update job');
      }

      setJobs(jobs.map(job =>
        job.id === selectedJob.id ? selectedJob : job
      ));
      setShowEditModal(false);
      setStatus('✅ Job updated successfully');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error('Error updating job:', err);
      setError('Failed to update job');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge bg="success">🟢 Active</Badge>;
      case 'closed': return <Badge bg="secondary">🔴 Closed</Badge>;
      case 'draft': return <Badge bg="warning">📝 Draft</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (val) => {
    if (!val) return 'N/A';
    // Firestore Timestamp with toDate()
    if (typeof val?.toDate === 'function') {
      try {
        return val.toDate().toLocaleDateString();
      } catch (e) {}
    }
    // Plain object from some APIs: {_seconds, _nanoseconds}
    if (val && typeof val === 'object' && '_seconds' in val) {
      try {
        return new Date(val._seconds * 1000).toLocaleDateString();
      } catch (e) {}
    }
    // ISO string or other string
    if (typeof val === 'string') return val.split('T')[0];
    // Fallback to toString
    return String(val);
  };

  if (loading) {
    return (
      <div className="container py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Button variant="outline-secondary" className="mb-3" onClick={() => window.history.back()}>
        ← Back
      </Button>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">⚙️ Job Management</h2>
          <p className="text-muted mb-0">Manage your job postings and track applications</p>
        </div>
        <Link to="/company/jobs/post">
          <Button variant="primary" size="lg">
            📝 Post New Job
          </Button>
        </Link>
      </div>

      {status && <Alert variant="success">{status}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0 fw-bold">Your Job Postings</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {jobs.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-muted">No jobs posted yet</h5>
              <p className="text-muted mb-3">Create your first job posting to start attracting talent</p>
              <Link to="/company/jobs/post">
                <Button variant="primary">Post Your First Job</Button>
              </Link>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 fw-bold">Job Title</th>
                  <th className="border-0 fw-bold">Category</th>
                  <th className="border-0 fw-bold">Location</th>
                  <th className="border-0 fw-bold">Status</th>
                  <th className="border-0 fw-bold">Applicants</th>
                  <th className="border-0 fw-bold">Posted Date</th>
                  <th className="border-0 fw-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id}>
                    <td className="fw-semibold">{job.title}</td>
                    <td>
                      <Badge bg="outline-primary" className="text-capitalize">
                        {job.category || 'Not specified'}
                      </Badge>
                    </td>
                    <td>{job.location || 'Not specified'}</td>
                    <td>{getStatusBadge(job.status || 'active')}</td>
                    <td>
                      <span className="fw-bold text-primary">{job.applicants || 0}</span>
                    </td>
                    <td>{formatDate(job.postedDate || job.createdAt)}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <Link to={`/company/applicants?job=${job.id}`}>
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="me-1"
                          >
                            👥 View ({job.applicants || 0})
                          </Button>
                        </Link>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleEdit(job)}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(job.id)}
                        >
                          🗑️ Delete
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

      {/* Edit Job Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>✏️ Edit Job Posting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Job Title *</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedJob.title}
                      onChange={(e) => setSelectedJob({...selectedJob, title: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      value={selectedJob.category}
                      onChange={(e) => setSelectedJob({...selectedJob, category: e.target.value})}
                    >
                      <option value="technology">Technology</option>
                      <option value="business">Business</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="creative">Creative</option>
                      <option value="sales">Sales</option>
                      <option value="marketing">Marketing</option>
                      <option value="engineering">Engineering</option>
                      <option value="design">Design</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedJob.location}
                      onChange={(e) => setSelectedJob({...selectedJob, location: e.target.value})}
                      placeholder="City, Country or 'Remote'"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={selectedJob.status}
                      onChange={(e) => setSelectedJob({...selectedJob, status: e.target.value})}
                    >
                      <option value="active">🟢 Active</option>
                      <option value="closed">🔴 Closed</option>
                      <option value="draft">📝 Draft</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={selectedJob.description}
                  onChange={(e) => setSelectedJob({...selectedJob, description: e.target.value})}
                  placeholder="Update job description..."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Requirements</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={selectedJob.requirements}
                  onChange={(e) => setSelectedJob({...selectedJob, requirements: e.target.value})}
                  placeholder="Update job requirements..."
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            💾 Update Job
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default JobManagement;
