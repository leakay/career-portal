import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  Spinner,
  Alert
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const ApplicantView = () => {
  const [applicants, setApplicants] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    minScore: 0,
    status: 'all'
  });

  const { user, userProfile } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, [user, userProfile]);

  useEffect(() => {
    if (selectedJob) {
      fetchApplicants();
    }
  }, [selectedJob, filters]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');

      // Prefer company-specific jobs endpoint exposed by the local backend
      const companyId = userProfile?.companyId || user?.uid;
      const url = companyId
        ? `http://localhost:5000/companies/${companyId}/jobs`
        : 'http://localhost:5000/jobs';

      const response = await fetch(url, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => null);
        throw new Error(errText || 'Failed to fetch jobs');
      }

      const data = await response.json();
      // server returns { success: true, data: [...] } or plain array
      setJobs(data.data || data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
    }
  };

  const fetchApplicants = async () => {
    if (!selectedJob) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const companyId = userProfile?.companyId || user?.uid;

      // Backend (server.js) exposes company applications: /companies/:companyId/applications
      const url = companyId
        ? `http://localhost:5000/companies/${companyId}/applications?jobId=${selectedJob}`
        : `http://localhost:5000/job-applications?jobId=${selectedJob}`;

      const response = await fetch(url, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => null);
        throw new Error(errText || 'Failed to fetch applicants');
      }

      const data = await response.json();

      // server returns applications array in data.data
      const applications = data.data || [];

      // Map applications to the component's expected applicant shape (best-effort)
      const transformedApplicants = applications.map(app => ({
        id: app.studentId || app.id,
        name: app.studentName || app.name || 'Unknown',
        email: app.studentEmail || app.email || '',
        jobTitle: app.jobTitle || '',
        matchScore: app.matchScore ? Math.round(app.matchScore * 100) : app.matchScore || 0,
        status: app.status || 'needs-review',
        academicPerformance: app.academicPerformance || `GPA: ${app.gpa || 'N/A'}`,
        experience: app.experience || 'Not specified',
        certificates: app.certificates || [],
        university: app.university || '',
        course: app.course || '',
        year: app.year || '',
        skills: app.skills || [],
        lastUpdated: app.updatedAt || app.appliedAt || '',
        compatibility: app.compatibility || '',
        breakdown: app.breakdown || {}
      }));

      setApplicants(transformedApplicants);
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setError('Failed to load applicants');
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusFromCompatibility = (compatibility) => {
    switch (compatibility) {
      case 'Excellent': return 'highly-qualified';
      case 'Good': return 'qualified';
      default: return 'needs-review';
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'highly-qualified': return 'success';
      case 'qualified': return 'primary';
      case 'needs-review': return 'warning';
      default: return 'secondary';
    }
  };

  const scheduleInterview = async (applicantId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/company/interviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicantId,
          jobId: selectedJob,
          date: new Date().toISOString().split('T')[0],
          time: '10:00',
          notes: 'Initial interview scheduled'
        })
      });
      alert('Interview scheduled successfully!');
    } catch (err) {
      console.error('Error scheduling interview:', err);
      alert('Failed to schedule interview');
    }
  };

  const viewFullProfile = (applicantId) => {
    // Navigate to detailed profile view
    window.open(`/company/applicant/${applicantId}`, '_blank');
  };

  const downloadResume = (applicantId) => {
    // In a real app, this would download the resume
    alert('Resume download feature coming soon!');
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <Button variant="outline-secondary" className="mb-3" onClick={() => window.history.back()}>
          ← Back
        </Button>
        <h2 className="fw-bold text-dark mb-2">👥 Applicant Management</h2>
        <p className="text-muted">View and manage job applicants with AI-powered matching</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Select Job</Form.Label>
                <Form.Select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                >
                  <option value="">Choose a job...</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title} ({job.applicants || 0} applicants)
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Minimum Match Score</Form.Label>
                <Form.Range
                  min="0"
                  max="100"
                  value={filters.minScore}
                  onChange={(e) => setFilters({...filters, minScore: e.target.value})}
                />
                <div className="text-center mt-1">
                  <small className="text-muted">{filters.minScore}%</small>
                </div>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status Filter</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="all">All Applicants</option>
                  <option value="highly-qualified">Highly Qualified</option>
                  <option value="qualified">Qualified</option>
                  <option value="needs-review">Needs Review</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSelectedJob('');
                  setFilters({ minScore: 0, status: 'all' });
                  setApplicants([]);
                }}
                className="w-100"
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Applicants List */}
      {selectedJob && (
        <div>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading applicants...</p>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <h5>Found {applicants.length} applicants</h5>
              </div>

              {applicants.map((applicant) => (
                <Card key={applicant.id} className="mb-3 shadow-sm">
                  <Card.Body>
                    <Row>
                      <Col md={2}>
                        <div className="text-center">
                          <div className="mb-2">
                            <h4 className="text-primary fw-bold">{applicant.matchScore}%</h4>
                            <small className="text-muted">Match Score</small>
                          </div>
                          <Badge bg={getStatusBadgeVariant(applicant.status)} className="px-2 py-1">
                            {applicant.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </Col>

                      <Col md={6}>
                        <h5 className="mb-2">{applicant.name}</h5>
                        <p className="text-muted mb-2">{applicant.email}</p>
                        <div className="mb-2">
                          <strong>University:</strong> {applicant.university} | <strong>Course:</strong> {applicant.course} | <strong>Year:</strong> {applicant.year}
                        </div>
                        <div className="mb-2">
                          <strong>Academic Performance:</strong> {applicant.academicPerformance}
                        </div>
                        <div className="mb-2">
                          <strong>Experience:</strong> {applicant.experience}
                        </div>
                        <div className="mb-3">
                          <strong>Skills:</strong>
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {applicant.skills.map((skill, index) => (
                              <Badge key={index} bg="outline-primary" className="px-2 py-1">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="mb-3">
                          <strong>Certificates:</strong>
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {applicant.certificates.map((cert, index) => (
                              <Badge key={index} bg="light" text="dark" className="px-2 py-1">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Col>

                      <Col md={4}>
                        <div className="d-grid gap-2">
                          <Button
                            variant="success"
                            onClick={() => scheduleInterview(applicant.id)}
                            className="mb-2"
                          >
                            📅 Schedule Interview
                          </Button>
                          <Button
                            variant="outline-primary"
                            onClick={() => viewFullProfile(applicant.id)}
                            className="mb-2"
                          >
                            👤 View Full Profile
                          </Button>
                          <Button
                            variant="outline-dark"
                            onClick={() => downloadResume(applicant.id)}
                          >
                            📄 Download Resume
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}

              {applicants.length === 0 && !loading && (
                <Card className="border-0 shadow-sm">
                  <Card.Body className="text-center py-5">
                    <h5 className="text-muted">No applicants found</h5>
                    <p className="text-muted mb-3">No applicants match your current filter criteria.</p>
                    <Button
                      variant="outline-primary"
                      onClick={() => {
                        setSelectedJob('');
                        setFilters({ minScore: 0, status: 'all' });
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {!selectedJob && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <h5 className="text-muted">Select a job to view applicants</h5>
            <p className="text-muted">Choose a job posting from the dropdown above to see matched applicants.</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ApplicantView;
