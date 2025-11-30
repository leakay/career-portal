import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Alert, Modal, Form, Row, Col } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { realApi } from '../../api/config';
import { useAuth } from '../contexts/AuthContext';

const AdminCourses = () => {
  const { logout } = useAuth();
  const [searchParams] = useSearchParams();
  const institutionId = searchParams.get('institution');

  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    description: '',
    facultyId: '',
    institutionId: institutionId || '',
    duration: '',
    credits: '',
    level: 'undergraduate',
    status: 'active'
  });
  const [editCourse, setEditCourse] = useState({
    name: '',
    code: '',
    description: '',
    facultyId: '',
    institutionId: institutionId || '',
    duration: '',
    credits: '',
    level: 'undergraduate',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, [institutionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch institutions
      const institutionsQuery = query(collection(db, 'institutions'));
      const institutionsSnapshot = await getDocs(institutionsQuery);
      const institutionsData = institutionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInstitutions(institutionsData);

      // Fetch faculties
      let facultiesQuery;
      if (institutionId) {
        facultiesQuery = query(collection(db, 'faculties'), where('institutionId', '==', institutionId));
      } else {
        facultiesQuery = query(collection(db, 'faculties'));
      }
      const facultiesSnapshot = await getDocs(facultiesQuery);
      const facultiesData = facultiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFaculties(facultiesData);

      // Fetch courses
      let coursesQuery;
      if (institutionId) {
        coursesQuery = query(collection(db, 'courses'), where('institutionId', '==', institutionId));
      } else {
        coursesQuery = query(collection(db, 'courses'));
      }

      const coursesSnapshot = await getDocs(coursesQuery);
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Add faculty and institution names to courses
      const coursesWithDetails = coursesData.map(course => ({
        ...course,
        facultyName: facultiesData.find(fac => fac.id === course.facultyId)?.name || 'Unknown',
        institutionName: institutionsData.find(inst => inst.id === course.institutionId)?.name || 'Unknown'
      }));

      setCourses(coursesWithDetails);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const docRef = await addDoc(collection(db, 'courses'), {
        ...newCourse,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('Course added with ID:', docRef.id);

      setNewCourse({
        name: '',
        code: '',
        description: '',
        facultyId: '',
        institutionId: institutionId || '',
        duration: '',
        credits: '',
        level: 'undergraduate',
        status: 'active'
      });
      setShowAddModal(false);
      fetchData();

      alert('Course added successfully!');
    } catch (err) {
      console.error('Error adding course:', err);
      setError('Failed to add course: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (courseId, updates) => {
    try {
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        ...updates,
        updatedAt: new Date()
      });

      alert('Course updated successfully!');
      fetchData();
    } catch (err) {
      console.error('Error updating course:', err);
      setError('Failed to update course: ' + err.message);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'courses', courseId));
      alert('Course deleted successfully!');
      fetchData();
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course: ' + err.message);
    }
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading courses...</p>
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
          <h1>Course Management {institutionId && `- ${institutions.find(i => i.id === institutionId)?.name || 'Institution'}`}</h1>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" onClick={() => logout()}>
            Logout
          </Button>
          <Button variant="success" onClick={() => setShowAddModal(true)} className="me-2">
            + Add Course
          </Button>
          <Button variant="primary" onClick={fetchData}>
            Refresh
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Header>
          <h5 className="mb-0">All Courses ({courses.length})</h5>
        </Card.Header>
        <Card.Body>
          {courses.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No courses found</p>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                Add First Course
              </Button>
            </div>
          ) : (
            <Table responsive>
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Code</th>
                  <th>Faculty</th>
                  <th>Institution</th>
                  <th>Level</th>
                  <th>Credits</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div>
                        <strong>{course.name}</strong>
                        <div className="text-muted small">{course.description}</div>
                      </div>
                    </td>
                    <td>{course.code}</td>
                    <td>{course.facultyName}</td>
                    <td>{course.institutionName}</td>
                    <td>
                      <Badge bg="info">{course.level || 'undergraduate'}</Badge>
                    </td>
                    <td>{course.credits}</td>
                    <td>
                      <Badge bg={course.status === 'active' ? 'success' : 'secondary'}>
                        {course.status || 'active'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewDetails(course)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => {
                            setEditingCourse(course);
                            setEditCourse({
                              name: course.name,
                              code: course.code,
                              description: course.description,
                              facultyId: course.facultyId,
                              institutionId: course.institutionId,
                              duration: course.duration,
                              credits: course.credits,
                              level: course.level || 'undergraduate',
                              status: course.status || 'active'
                            });
                            setShowEditModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleUpdateCourse(course.id, { status: course.status === 'active' ? 'inactive' : 'active' })}
                        >
                          {course.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          Delete
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

      {/* Course Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Course Details: {selectedCourse?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCourse && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Name:</strong> {selectedCourse.name}
                </Col>
                <Col md={6}>
                  <strong>Code:</strong> {selectedCourse.code}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Faculty:</strong> {selectedCourse.facultyName}
                </Col>
                <Col md={6}>
                  <strong>Institution:</strong> {selectedCourse.institutionName}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Level:</strong> {selectedCourse.level}
                </Col>
                <Col md={6}>
                  <strong>Credits:</strong> {selectedCourse.credits}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Duration:</strong> {selectedCourse.duration}
                </Col>
                <Col md={6}>
                  <strong>Status:</strong> <Badge bg={selectedCourse.status === 'active' ? 'success' : 'secondary'}>{selectedCourse.status}</Badge>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Description:</strong> {selectedCourse.description || 'No description'}
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Course Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Course</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddCourse}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                    required
                    placeholder="Enter course name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Code *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                    required
                    placeholder="Unique code (e.g., CS101)"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newCourse.description}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                placeholder="Course description"
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Institution *</Form.Label>
                  <Form.Select
                    value={newCourse.institutionId}
                    onChange={(e) => setNewCourse({...newCourse, institutionId: e.target.value})}
                    required
                  >
                    <option value="">Select Institution</option>
                    {institutions.map(institution => (
                      <option key={institution.id} value={institution.id}>
                        {institution.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Faculty *</Form.Label>
                  <Form.Select
                    value={newCourse.facultyId}
                    onChange={(e) => setNewCourse({...newCourse, facultyId: e.target.value})}
                    required
                  >
                    <option value="">Select Faculty</option>
                    {faculties.filter(fac => fac.institutionId === newCourse.institutionId).map(faculty => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Level</Form.Label>
                  <Form.Select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                  >
                    <option value="undergraduate">Undergraduate</option>
                    <option value="postgraduate">Postgraduate</option>
                    <option value="diploma">Diploma</option>
                    <option value="certificate">Certificate</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Credits</Form.Label>
                  <Form.Control
                    type="number"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({...newCourse, credits: e.target.value})}
                    placeholder="e.g., 3"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Duration</Form.Label>
              <Form.Control
                type="text"
                value={newCourse.duration}
                onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                placeholder="e.g., 4 years"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Course'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Course Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Course: {editingCourse?.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={(e) => {
          e.preventDefault();
          handleUpdateCourse(editingCourse.id, editCourse);
          setShowEditModal(false);
        }}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={editCourse.name}
                    onChange={(e) => setEditCourse({...editCourse, name: e.target.value})}
                    required
                    placeholder="Enter course name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Code *</Form.Label>
                  <Form.Control
                    type="text"
                    value={editCourse.code}
                    onChange={(e) => setEditCourse({...editCourse, code: e.target.value})}
                    required
                    placeholder="Unique code (e.g., CS101)"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editCourse.description}
                onChange={(e) => setEditCourse({...editCourse, description: e.target.value})}
                placeholder="Course description"
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Institution *</Form.Label>
                  <Form.Select
                    value={editCourse.institutionId}
                    onChange={(e) => setEditCourse({...editCourse, institutionId: e.target.value})}
                    required
                  >
                    <option value="">Select Institution</option>
                    {institutions.map(institution => (
                      <option key={institution.id} value={institution.id}>
                        {institution.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Faculty *</Form.Label>
                  <Form.Select
                    value={editCourse.facultyId}
                    onChange={(e) => setEditCourse({...editCourse, facultyId: e.target.value})}
                    required
                  >
                    <option value="">Select Faculty</option>
                    {faculties.filter(fac => fac.institutionId === editCourse.institutionId).map(faculty => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Level</Form.Label>
                  <Form.Select
                    value={editCourse.level}
                    onChange={(e) => setEditCourse({...editCourse, level: e.target.value})}
                  >
                    <option value="undergraduate">Undergraduate</option>
                    <option value="postgraduate">Postgraduate</option>
                    <option value="diploma">Diploma</option>
                    <option value="certificate">Certificate</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Credits</Form.Label>
                  <Form.Control
                    type="number"
                    value={editCourse.credits}
                    onChange={(e) => setEditCourse({...editCourse, credits: e.target.value})}
                    placeholder="e.g., 3"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration</Form.Label>
                  <Form.Control
                    type="text"
                    value={editCourse.duration}
                    onChange={(e) => setEditCourse({...editCourse, duration: e.target.value})}
                    placeholder="e.g., 4 years"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={editCourse.status}
                    onChange={(e) => setEditCourse({...editCourse, status: e.target.value})}
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
              {loading ? 'Updating...' : 'Update Course'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminCourses;
