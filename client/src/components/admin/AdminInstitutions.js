// src/components/admin/AdminInstitutions.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Alert, Modal, Form, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { realApi } from '../../api/config';
import { useAuth } from '../contexts/AuthContext';

const AdminInstitutions = () => {
  const { logout } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [newInstitution, setNewInstitution] = useState({
    name: '',
    code: '',
    type: 'university',
    location: '',
    contactEmail: '',
    status: 'active'
  });
  const [editInstitution, setEditInstitution] = useState({
    name: '',
    code: '',
    type: 'university',
    location: '',
    contactEmail: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Try to fetch from Firestore first
      const institutionsQuery = query(collection(db, 'institutions'));
      const institutionsSnapshot = await getDocs(institutionsQuery);
      const institutionsData = institutionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (institutionsData.length > 0) {
        setInstitutions(institutionsData);
        console.log('Loaded institutions from Firestore:', institutionsData.length);
      } else {
        // Fallback to API if no Firestore data
        console.log('No institutions in Firestore, trying API fallback');
        try {
          const institutionsResponse = await realApi.getInstitutions();
          setInstitutions(institutionsResponse.data || []);
        } catch (apiErr) {
          console.warn('API fallback failed:', apiErr.message);
          setInstitutions([]);
        }
      }

      // Fetch applications (keep using API for now)
      try {
        const applicationsResponse = await realApi.getApplications();
        setApplications(applicationsResponse.data || []);
      } catch (appErr) {
        console.warn('Failed to load applications:', appErr.message);
        setApplications([]);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstitution = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'institutions'), {
        ...newInstitution,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('Institution added with ID:', docRef.id);

      // Reset form and close modal
      setNewInstitution({
        name: '',
        code: '',
        type: 'university',
        location: '',
        contactEmail: '',
        status: 'active'
      });
      setShowAddModal(false);

      // Refresh data
      fetchData();

      alert('Institution added successfully!');
    } catch (err) {
      console.error('Error adding institution:', err);
      setError('Failed to add institution: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInstitution = async (institutionId, updates) => {
    try {
      const institutionRef = doc(db, 'institutions', institutionId);
      await updateDoc(institutionRef, {
        ...updates,
        updatedAt: new Date()
      });

      alert('Institution updated successfully!');
      fetchData();
    } catch (err) {
      console.error('Error updating institution:', err);
      setError('Failed to update institution: ' + err.message);
    }
  };

  const handleDeleteInstitution = async (institutionId) => {
    if (!window.confirm('Are you sure you want to delete this institution? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'institutions', institutionId));
      alert('Institution deleted successfully!');
      fetchData();
    } catch (err) {
      console.error('Error deleting institution:', err);
      setError('Failed to delete institution: ' + err.message);
    }
  };

  const handleManageFaculties = (institution) => {
    // Navigate to faculty management for this institution
    window.location.href = `/admin/faculties?institution=${institution.id}`;
  };

  const handleManageCourses = (institution) => {
    // Navigate to course management for this institution
    window.location.href = `/admin/courses?institution=${institution.id}`;
  };

  const getInstitutionStats = (institutionId) => {
    const institutionApps = applications.filter(app => app.institutionId === institutionId);
    return {
      total: institutionApps.length,
      pending: institutionApps.filter(app => app.status === 'pending').length,
      approved: institutionApps.filter(app => app.status === 'approved').length,
      rejected: institutionApps.filter(app => app.status === 'rejected').length
    };
  };

  const handleViewDetails = (institution) => {
    setSelectedInstitution(institution);
    setShowModal(true);
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading institutions...</p>
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
          <h1>Institution Management</h1>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" onClick={() => logout()}>
            Logout
          </Button>
          <Button variant="success" onClick={() => setShowAddModal(true)} className="me-2">
            + Add Institution
          </Button>
          <Button variant="primary" onClick={fetchData}>
            Refresh
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Header>
          <h5 className="mb-0">All Institutions ({institutions.length})</h5>
        </Card.Header>
        <Card.Body>
          {institutions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No institutions found</p>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                Add First Institution
              </Button>
            </div>
          ) : (
            <Table responsive>
              <thead>
                <tr>
                  <th>Institution Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Total Applications</th>
                  <th>Pending</th>
                  <th>Approved</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((institution) => {
                  const stats = getInstitutionStats(institution.id || institution.name);
                  return (
                    <tr key={institution.id}>
                      <td>
                        <div>
                          <strong>{institution.name}</strong>
                          <div className="text-muted small">{institution.code}</div>
                        </div>
                      </td>
                      <td>
                        <Badge bg="info">{institution.type || 'university'}</Badge>
                      </td>
                      <td>{institution.location || 'N/A'}</td>
                      <td>
                        <Badge bg={institution.status === 'active' ? 'success' : 'secondary'}>
                          {institution.status || 'active'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="primary">{stats.total}</Badge>
                      </td>
                      <td>
                        <Badge bg="warning">{stats.pending}</Badge>
                      </td>
                      <td>
                        <Badge bg="success">{stats.approved}</Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewDetails(institution)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleManageFaculties(institution)}
                          >
                            Faculties
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleManageCourses(institution)}
                          >
                            Courses
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                              setEditingInstitution(institution);
                              setEditInstitution({
                                name: institution.name,
                                code: institution.code,
                                type: institution.type,
                                location: institution.location,
                                contactEmail: institution.contactEmail,
                                status: institution.status
                              });
                              setShowEditModal(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleUpdateInstitution(institution.id, { status: institution.status === 'active' ? 'inactive' : 'active' })}
                          >
                            {institution.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteInstitution(institution.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Institution Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Institution Details: {selectedInstitution?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInstitution && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Name:</strong> {selectedInstitution.name}
                </Col>
                <Col md={6}>
                  <strong>Code:</strong> {selectedInstitution.code}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Type:</strong> {selectedInstitution.type}
                </Col>
                <Col md={6}>
                  <strong>Location:</strong> {selectedInstitution.location}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Email:</strong> {selectedInstitution.contactEmail}
                </Col>
                <Col md={6}>
                  <strong>Status:</strong> <Badge bg={selectedInstitution.status === 'active' ? 'success' : 'secondary'}>{selectedInstitution.status}</Badge>
                </Col>
              </Row>

              <h6 className="mt-4">Applications for {selectedInstitution.name}</h6>
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {applications
                    .filter(app => app.institutionId === selectedInstitution.id || app.institutionId === selectedInstitution.name)
                    .map((app) => (
                      <tr key={app.id}>
                        <td>{app.studentName || 'Unknown'}</td>
                        <td>{app.courseName || 'N/A'}</td>
                        <td>
                          <Badge bg={
                            app.status === 'approved' ? 'success' :
                            app.status === 'rejected' ? 'danger' : 'warning'
                          }>
                            {app.status}
                          </Badge>
                        </td>
                        <td>
                          {new Date(app.applicationDate?.toDate?.() || app.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Institution Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Institution</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddInstitution}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Institution Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newInstitution.name}
                    onChange={(e) => setNewInstitution({...newInstitution, name: e.target.value})}
                    required
                    placeholder="Enter institution name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Institution Code *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newInstitution.code}
                    onChange={(e) => setNewInstitution({...newInstitution, code: e.target.value})}
                    required
                    placeholder="Unique code (e.g., LIMKOKWING)"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Institution Type</Form.Label>
                  <Form.Select
                    value={newInstitution.type}
                    onChange={(e) => setNewInstitution({...newInstitution, type: e.target.value})}
                  >
                    <option value="university">University</option>
                    <option value="college">College</option>
                    <option value="institute">Institute</option>
                    <option value="polytechnic">Polytechnic</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    value={newInstitution.location}
                    onChange={(e) => setNewInstitution({...newInstitution, location: e.target.value})}
                    placeholder="City, Country"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Contact Email</Form.Label>
              <Form.Control
                type="email"
                value={newInstitution.contactEmail}
                onChange={(e) => setNewInstitution({...newInstitution, contactEmail: e.target.value})}
                placeholder="admin@institution.edu"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Institution'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>



      {/* Edit Institution Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Institution: {editingInstitution?.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={(e) => {
          e.preventDefault();
          handleUpdateInstitution(editingInstitution.id, editInstitution);
          setShowEditModal(false);
        }}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Institution Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={editInstitution.name}
                    onChange={(e) => setEditInstitution({...editInstitution, name: e.target.value})}
                    required
                    placeholder="Enter institution name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Institution Code *</Form.Label>
                  <Form.Control
                    type="text"
                    value={editInstitution.code}
                    onChange={(e) => setEditInstitution({...editInstitution, code: e.target.value})}
                    required
                    placeholder="Unique code (e.g., LIMKOKWING)"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Institution Type</Form.Label>
                  <Form.Select
                    value={editInstitution.type}
                    onChange={(e) => setEditInstitution({...editInstitution, type: e.target.value})}
                  >
                    <option value="university">University</option>
                    <option value="college">College</option>
                    <option value="institute">Institute</option>
                    <option value="polytechnic">Polytechnic</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    value={editInstitution.location}
                    onChange={(e) => setEditInstitution({...editInstitution, location: e.target.value})}
                    placeholder="City, Country"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={editInstitution.contactEmail}
                    onChange={(e) => setEditInstitution({...editInstitution, contactEmail: e.target.value})}
                    placeholder="admin@institution.edu"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={editInstitution.status}
                    onChange={(e) => setEditInstitution({...editInstitution, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Institution'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminInstitutions;
