import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Table, Modal, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { realApi } from '../../api/config';
import { useAuth } from '../contexts/AuthContext';

import './CourseManagement.css';

const CourseManagement = ({ onBack }) => {
  const { logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    facultyId: '',
    requirements: '',
    duration: '',
    fees: '',
    seats: ''
  });
  const [editingCourse, setEditingCourse] = useState(null);

  // Get instituteId with better error handling
  const getInstituteId = () => {
    const instituteId = localStorage.getItem('instituteId');
    if (!instituteId) {
      setError('Institute ID not found. Please log in again.');
      return null;
    }
    return instituteId;
  };

  // Fetch courses and faculties on component mount
  useEffect(() => {
    console.log('Component mounted, fetching data...');
    console.log('Institute ID from localStorage:', localStorage.getItem('instituteId'));
    fetchCourses();
    fetchFaculties();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const instituteId = getInstituteId();
      if (!instituteId) return;

      // Get all faculties first, then get courses for each faculty
      const facultiesResponse = await realApi.getFaculties(instituteId);
      if (!facultiesResponse.success) {
        setError('Failed to fetch faculties for courses');
        return;
      }

      const allCourses = [];
      for (const faculty of facultiesResponse.data) {
        try {
          const coursesResponse = await realApi.getCourses(faculty.id);
          if (coursesResponse.success) {
            // Add faculty info to each course
            const coursesWithFaculty = coursesResponse.data.map(course => ({
              ...course,
              facultyId: faculty.id,
              facultyName: faculty.name
            }));
            allCourses.push(...coursesWithFaculty);
          }
        } catch (error) {
          console.error(`Error fetching courses for faculty ${faculty.id}:`, error);
        }
      }

      setCourses(allCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const instituteId = getInstituteId();
      if (!instituteId) return;

      const response = await realApi.getFaculties(instituteId);
      if (response.success) {
        setFaculties(response.data);
      } else {
        setError('Failed to load faculties.');
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setError('Failed to load faculties.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const instituteId = getInstituteId();
      if (!instituteId) return;

      // Validate numeric fields
      const fees = parseFloat(formData.fees);
      const seats = parseInt(formData.seats);

      if (isNaN(fees) || isNaN(seats)) {
        setError('Please enter valid numbers for fees and seats');
        return;
      }

      if (fees < 0 || seats < 1) {
        setError('Fees must be positive and seats must be at least 1');
        return;
      }

      // Prepare course data for API (matching backend expectations)
      const courseData = {
        name: formData.name,
        code: formData.name.toUpperCase().replace(/\s+/g, '_').substring(0, 10), // Generate code from name
        duration: formData.duration,
        requirements: formData.requirements,
        description: formData.description,
        capacity: seats,
        // Store additional data that frontend needs
        fees: fees,
        institutionId: instituteId,
        isActive: true
      };

      let response;
      if (editingCourse) {
        // Update existing course
        response = await realApi.updateCourse(editingCourse.id, courseData);
        if (response.success) {
          alert('Course updated successfully!');
        } else {
          setError(response.error || 'Failed to update course');
          return;
        }
      } else {
        // Add new course
        response = await realApi.addCourse(formData.facultyId, courseData);
        if (response.success) {
          alert('Course added successfully!');
        } else {
          setError(response.error || 'Failed to add course');
          return;
        }
      }

      // Reset form and refresh data
      setFormData({
        name: '',
        description: '',
        facultyId: '',
        requirements: '',
        duration: '',
        fees: '',
        seats: ''
      });
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      setError('Failed to save course: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      description: course.description || '',
      facultyId: course.facultyId || '',
      requirements: course.requirements || '',
      duration: course.duration || '',
      fees: course.fees ? course.fees.toString() : '',
      seats: course.capacity ? course.capacity.toString() : ''
    });
    setError(''); // Clear any previous errors
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const response = await realApi.deleteCourse(courseId);
        if (response.success) {
          alert('Course deleted successfully!');
          fetchCourses();
        } else {
          setError(response.error || 'Failed to delete course');
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        setError('Failed to delete course: ' + error.message);
      }
    }
  };

  const toggleCourseStatus = async (course) => {
    try {
      const updatedData = {
        ...course,
        status: course.status === 'active' ? 'inactive' : 'active'
      };
      const response = await realApi.updateCourse(course.id, updatedData);
      if (response.success) {
        fetchCourses();
      } else {
        setError(response.error || 'Failed to update course status');
      }
    } catch (error) {
      console.error('Error updating course status:', error);
      setError('Failed to update course status: ' + error.message);
    }
  };

  const cancelEdit = () => {
    setEditingCourse(null);
    setFormData({
      name: '',
      description: '',
      facultyId: '',
      requirements: '',
      duration: '',
      fees: '',
      seats: ''
    });
    setError('');
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Button variant="outline-secondary" onClick={onBack}>
            ← Back to Dashboard
          </Button>
          <h2>Course Management</h2>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" onClick={() => logout()}>
            Logout
          </Button>
          <Button variant="primary" onClick={fetchCourses} disabled={loading}>
            {loading ? <Spinner size="sm" /> : '🔄 Refresh'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Error</Alert.Heading>
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{editingCourse ? 'Edit Course' : 'Add New Course'}</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Course Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Faculty *</Form.Label>
                  <Form.Select
                    value={formData.facultyId}
                    onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                    required
                    disabled={loading || faculties.length === 0}
                  >
                    <option value="">Select Faculty</option>
                    {faculties.map(faculty => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </option>
                    ))}
                  </Form.Select>
                  {faculties.length === 0 && !loading && (
                    <Form.Text className="text-muted">No faculties found. Please add faculties first.</Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                disabled={loading}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Requirements *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                    placeholder="e.g., Mathematics, English, Science"
                    required
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Duration *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 4 years"
                    required
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Fees (LSL) *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.fees}
                    onChange={(e) => setFormData({...formData, fees: e.target.value})}
                    required
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Available Seats *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.seats}
                    onChange={(e) => setFormData({...formData, seats: e.target.value})}
                    required
                    min="1"
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : (editingCourse ? 'Update Course' : 'Add Course')}
              </Button>
              {editingCourse && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={cancelEdit}
                  disabled={loading}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Your Courses ({courses.length})</h5>
            <Button
              variant="outline-secondary"
              onClick={fetchCourses}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : '🔄 Refresh'}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted mb-3">
                <i className="bi bi-book" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5 className="text-dark">No courses added yet</h5>
              <p className="text-muted">Add your first course using the form above</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover className="courses-table">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Faculty</th>
                    <th>Duration</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course.id}>
                      <td>
                        <strong className="text-primary">{course.name}</strong>
                        <br />
                        <small className="text-muted">{course.description}</small>
                      </td>
                      <td>{course.facultyName || faculties.find(f => f.id === course.facultyId)?.name || 'Unknown'}</td>
                      <td>{course.duration}</td>
                      <td>{course.capacity}</td>
                      <td>
                        <span className={`badge ${course.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {course.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(course)}
                            disabled={loading}
                          >
                            Edit
                          </Button>
                          <Button
                            variant={course.status === 'active' ? 'outline-warning' : 'outline-success'}
                            size="sm"
                            onClick={() => toggleCourseStatus(course)}
                            disabled={loading}
                          >
                            {course.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(course.id)}
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
    </Container>
  );
};

export default CourseManagement;
