import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Table, Modal, Alert, Spinner } from 'react-bootstrap';
import { realApi } from '../../api/config';
import { useAuth } from '../contexts/AuthContext';

const FacultyManagement = ({ onBack }) => {
  const { userProfile } = useAuth();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', code: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);

  // Get instituteId from user profile (check institutionId first as that's what Login.js stores)
  const getInstituteId = () => {
    const instituteId = userProfile?.institutionId || userProfile?.instituteId;
    if (!instituteId) {
      setError('Institute ID not found in user profile. Please log in again.');
      return null;
    }
    return instituteId;
  };

  // Fetch faculties on component mount
  useEffect(() => {
    console.log('Component mounted, fetching faculties...');
    console.log('Institute ID from userProfile:', userProfile?.instituteId || userProfile?.institutionId);
    fetchFaculties();
  }, [userProfile]);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      setError('');
      const instituteId = getInstituteId();
      if (!instituteId) return;

      const response = await realApi.getFaculties(instituteId);
      if (response.success) {
        setFaculties(response.data);
      } else {
        setError('Failed to fetch faculties');
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setError('Failed to load faculties. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const instituteId = getInstituteId();
      if (!instituteId) return;

      // Validate required fields
      if (!formData.name.trim() || !formData.code.trim()) {
        setError('Faculty name and code are required');
        return;
      }

      const facultyData = {
        name: formData.name.trim(),
        code: formData.code.toUpperCase().trim(),
        description: formData.description.trim()
      };

      let response;
      if (editingFaculty) {
        // Update existing faculty
        console.log('Updating faculty with ID:', editingFaculty.id, 'Data:', facultyData);
        console.log('Editing faculty object:', editingFaculty);

        // Check if faculty still exists in current faculties list
        const facultyExists = faculties.some(f => f.id === editingFaculty.id);
        console.log('Faculty exists in current list:', facultyExists);

        if (!facultyExists) {
          setError('Faculty no longer exists. Please refresh the page.');
          return;
        }

        response = await realApi.updateFaculty(editingFaculty.id, facultyData);
        if (response.success) {
          alert('Faculty updated successfully!');
        } else {
          console.error('Update failed:', response);
          setError(response.error || 'Failed to update faculty');
          return;
        }
      } else {
        // Add new faculty
        console.log('Adding faculty to institute:', instituteId, 'Data:', facultyData);
        response = await realApi.addFaculty(instituteId, facultyData);
        if (response.success) {
          alert('Faculty added successfully!');
        } else {
          console.error('Add failed:', response);
          setError(response.error || 'Failed to add faculty');
          return;
        }
      }

      if (response.success) {
        // Reset form and refresh data
        setFormData({ name: '', description: '', code: '' });
        setEditingFaculty(null);
        setShowModal(false);
        fetchFaculties();
      }
    } catch (error) {
      console.error('Error saving faculty:', error);
      setError('Failed to save faculty: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name,
      description: faculty.description || '',
      code: faculty.code || ''
    });
    setShowModal(true);
    setError(''); // Clear any previous errors
  };

  const handleDelete = (faculty) => {
    setFacultyToDelete(faculty);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!facultyToDelete) return;

    try {
      setLoading(true);
      const response = await realApi.deleteFaculty(facultyToDelete.id);
      if (response.success) {
        alert('Faculty deleted successfully!');
        fetchFaculties();
        setShowDeleteModal(false);
        setFacultyToDelete(null);
      } else {
        setError(response.error || 'Failed to delete faculty');
      }
    } catch (error) {
      console.error('Error deleting faculty:', error);
      setError('Failed to delete faculty: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setFacultyToDelete(null);
  };

  const cancelEdit = () => {
    setEditingFaculty(null);
    setFormData({ name: '', description: '', code: '' });
    setShowModal(false);
    setError('');
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Button variant="outline-secondary" onClick={onBack}>
            ← Back to Dashboard
          </Button>
          <h2>Faculty Management</h2>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            onClick={fetchFaculties}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : '🔄 Refresh'}
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            disabled={loading}
          >
            Add Faculty
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Error</Alert.Heading>
          {error}
          <button
            onClick={() => setError('')}
            className="btn-close"
            style={{ float: 'right' }}
          >
          </button>
        </Alert>
      )}

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading faculties...</p>
            </div>
          ) : faculties.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted mb-3">
                <i className="bi bi-building" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5 className="text-dark">No faculties added yet</h5>
              <p className="text-muted">Add your first faculty using the button above</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover className="faculty-table">
                <thead className="table-dark">
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faculties.map(faculty => (
                    <tr key={faculty.id}>
                      <td>
                        <strong className="text-primary">{faculty.code}</strong>
                      </td>
                      <td className="text-dark">{faculty.name}</td>
                      <td className="text-muted">
                        {faculty.description || 'No description'}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(faculty)}
                            disabled={loading}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(faculty)}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={cancelEdit}>
        <Modal.Header closeButton>
          <Modal.Title>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Error in modal */}
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Faculty Code *</Form.Label>
              <Form.Control
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                required
                placeholder="e.g., ENG, SCI, BUS"
                disabled={loading}
                maxLength="10"
              />
              <Form.Text className="text-muted">
                Short code to identify the faculty (will be converted to uppercase)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Faculty Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="Enter faculty name"
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter faculty description"
                disabled={loading}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cancelEdit} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" /> : (editingFaculty ? 'Update Faculty' : 'Add Faculty')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={cancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the faculty <strong>{facultyToDelete?.name}</strong> ({facultyToDelete?.code})?</p>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Delete Faculty'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FacultyManagement;
