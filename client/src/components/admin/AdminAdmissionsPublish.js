import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Alert, Modal, Form, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { realApi } from '../../services/realApi';
import { useAuth } from '../contexts/AuthContext';

const AdminAdmissionsPublish = () => {
  const { logout } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [admissionData, setAdmissionData] = useState({
    academicYear: new Date().getFullYear(),
    deadline: ''
  });

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Fetching institutions...');
      const response = await realApi.getInstitutions();
      console.log('Institutions API response:', response);

      if (response.success) {
        console.log('Institutions data:', response.data);
        setInstitutions(response.data || []);
      } else {
        console.log('API returned success=false:', response);
        setInstitutions([]);
        setError(response.error || 'Failed to load institutions');
      }
    } catch (err) {
      console.error('Error fetching institutions:', err);
      setError('Failed to load institutions: ' + err.message);
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishAdmissions = async (institution) => {
    setSelectedInstitution(institution);
    setAdmissionData({
      academicYear: new Date().getFullYear(),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    });
    setShowModal(true);
  };

  const submitPublishAdmissions = async () => {
    if (!selectedInstitution || !admissionData.academicYear || !admissionData.deadline) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setPublishing(true);
      setError('');
      setSuccess('');

      const response = await realApi.publishAdmissions(selectedInstitution.id, admissionData);

      if (response.success) {
        setSuccess(`Admissions published successfully for ${selectedInstitution.name}`);
        setShowModal(false);
        // Update the institution in the list
        setInstitutions(prev => prev.map(inst =>
          inst.id === selectedInstitution.id
            ? { ...inst, admissionsPublished: true, admissionsUpdatedAt: new Date() }
            : inst
        ));
      } else {
        throw new Error(response.error || 'Failed to publish admissions');
      }
    } catch (err) {
      console.error('Error publishing admissions:', err);
      setError('Failed to publish admissions: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  const getPublishedStatus = (institution) => {
    if (institution.admissionsPublished) {
      return <Badge bg="success">Published</Badge>;
    }
    return <Badge bg="secondary">Not Published</Badge>;
  };

  const getPublishedDate = (institution) => {
    if (institution.admissionsUpdatedAt) {
      return new Date(institution.admissionsUpdatedAt.seconds ? institution.admissionsUpdatedAt.seconds * 1000 : institution.admissionsUpdatedAt).toLocaleDateString();
    }
    return 'Never';
  };

  const publishedCount = institutions.filter(inst => inst.admissionsPublished).length;
  const totalCount = institutions.length;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Button as={Link} to="/admin" variant="outline-secondary">
            ← Back to Dashboard
          </Button>
          <h1>Admissions Publishing Management</h1>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" onClick={() => logout()}>
            Logout
          </Button>
          <Button variant="primary" onClick={fetchInstitutions}>
            Refresh
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Institutions</Card.Title>
              <h2 className="text-primary">{totalCount}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Published</Card.Title>
              <h2 className="text-success">{publishedCount}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Not Published</Card.Title>
              <h2 className="text-warning">{totalCount - publishedCount}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Publish Rate</Card.Title>
              <h2 className="text-info">
                {totalCount > 0 ? Math.round((publishedCount / totalCount) * 100) : 0}%
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Institutions Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Institution Admissions Status</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading institutions...</p>
            </div>
          ) : institutions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No institutions found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Institution Name</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Last Published</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.map((institution, index) => (
                    <tr key={institution.id}>
                      <td>{index + 1}</td>
                      <td>{institution.name}</td>
                      <td>{institution.code}</td>
                      <td>{institution.type}</td>
                      <td>{getPublishedStatus(institution)}</td>
                      <td>{getPublishedDate(institution)}</td>
                      <td>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handlePublishAdmissions(institution)}
                          disabled={publishing}
                        >
                          📢 Publish Admissions
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Publish Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Publish Admissions for {selectedInstitution?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInstitution && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Academic Year *</Form.Label>
                    <Form.Control
                      type="number"
                      value={admissionData.academicYear}
                      onChange={(e) => setAdmissionData(prev => ({
                        ...prev,
                        academicYear: parseInt(e.target.value)
                      }))}
                      min="2020"
                      max="2030"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Application Deadline *</Form.Label>
                    <Form.Control
                      type="date"
                      value={admissionData.deadline}
                      onChange={(e) => setAdmissionData(prev => ({
                        ...prev,
                        deadline: e.target.value
                      }))}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="alert alert-info">
                <strong>Institution Details:</strong>
                <br />
                Name: {selectedInstitution.name}
                <br />
                Code: {selectedInstitution.code}
                <br />
                Type: {selectedInstitution.type}
                <br />
                Location: {selectedInstitution.location || 'Not specified'}
              </div>

              <p className="text-muted">
                Publishing admissions will make the institution's courses available for student applications
                and set the application deadline for the specified academic year.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={submitPublishAdmissions}
            disabled={publishing || !admissionData.academicYear || !admissionData.deadline}
          >
            {publishing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Publishing...
              </>
            ) : (
              '📢 Publish Admissions'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminAdmissionsPublish;
