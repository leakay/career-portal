import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { Alert, Card, Form, Button, Row, Col, Spinner, Badge } from 'react-bootstrap';

export default function CourseApplication() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    university: '',
    course: '',
    level: '',
    intake: '',
    documents: [],
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  const [existingApplications, setExistingApplications] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [courses, setCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();

  const levels = ['Certificate', 'Diploma', 'Undergraduate', 'Postgraduate'];
  const intakes = ['January 2024', 'May 2024', 'September 2024'];

  // Sample universities data - you can replace this with Firestore data
  const sampleUniversities = [
    {
      id: 'nul',
      name: 'National University of Lesotho',
      courses: ['Computer Science', 'Engineering', 'Business Administration', 'Medicine', 'Law'],
      location: 'Roma, Lesotho',
      logo: '🏛️'
    },
    {
      id: 'limkokwing',
      name: 'Limkokwing University',
      courses: ['Graphic Design', 'Business Management', 'IT', 'Fashion Design'],
      location: 'Maseru, Lesotho',
      logo: '🎓'
    },
    {
      id: 'botho',
      name: 'Botho University',
      courses: ['Accounting', 'Hospitality Management', 'Networking', 'Software Engineering'],
      location: 'Maseru, Lesotho',
      logo: '📚'
    }
  ];

  useEffect(() => {
    fetchStudentData();
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (formData.university) {
      fetchCoursesForUniversity(formData.university);
    }
  }, [formData.university]);

  const fetchStudentData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Please log in to submit an application');
        setProfileLoading(false);
        return;
      }

      // Fetch student profile from users collection (same as StudentDashboard)
      const studentDoc = await getDocs(query(collection(db, 'users'), where('email', '==', user.email)));
      if (!studentDoc.empty) {
        const studentData = studentDoc.docs[0].data();
        setStudentProfile({
          id: studentDoc.docs[0].id,
          fullName: studentData.name || '',
          phone: studentData.phone || '',
          qualifications: studentData.qualifications || {},
          ...studentData
        });

        // Pre-fill form with profile data
        setFormData(prev => ({
          ...prev,
          firstName: studentData.name?.split(' ')[0] || '',
          lastName: studentData.name?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          phone: studentData.phone || ''
        }));
      } else {
        setError('Please complete your student profile before applying');
        // Redirect to profile page after a delay
        setTimeout(() => navigate('/student-profile'), 3000);
      }

      // Fetch existing applications
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('studentId', '==', user.uid)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const applicationsData = applicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExistingApplications(applicationsData);

    } catch (error) {
      console.error('Error fetching student data:', error);
      setError('Failed to load student data');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const universitiesQuery = query(collection(db, 'institutions'), where('status', '==', 'active'));
      const universitiesSnapshot = await getDocs(universitiesQuery);
      const universitiesData = universitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUniversities(universitiesData);
    } catch (error) {
      console.error('Error fetching universities:', error);
      setUniversities([]);
    }
  };

  const fetchCoursesForUniversity = async (universityId) => {
    try {
      const coursesQuery = query(
        collection(db, 'courses'),
        where('institutionId', '==', universityId),
        where('status', '==', 'active')
      );
      const coursesSnapshot = await getDocs(coursesQuery);
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesData);
      
      // Filter available courses based on student qualifications
      const available = coursesData.filter(course => 
        checkCourseEligibility(course, studentProfile)
      );
      setAvailableCourses(available);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
      setAvailableCourses([]);
    }
  };

  // Check if student qualifies for course
  const checkCourseEligibility = (course, studentProfile) => {
    if (!studentProfile || !course.requirements) return true;

    const requirements = course.requirements;
    const qualifications = studentProfile.qualifications || {};

    // Check minimum grade requirements
    if (requirements.minimumGrade && qualifications.finalGrade) {
      const studentGrade = parseFloat(qualifications.finalGrade);
      const requiredGrade = parseFloat(requirements.minimumGrade);
      if (isNaN(studentGrade) || studentGrade < requiredGrade) {
        return false;
      }
    }

    // Check subject requirements
    if (requirements.requiredSubjects && qualifications.subjects) {
      const studentSubjects = Array.isArray(qualifications.subjects) 
        ? qualifications.subjects 
        : qualifications.subjects.split(',').map(s => s.trim());
      
      const requiredSubjects = Array.isArray(requirements.requiredSubjects)
        ? requirements.requiredSubjects
        : requirements.requiredSubjects.split(',').map(s => s.trim());

      const hasRequiredSubjects = requiredSubjects.every(subject =>
        studentSubjects.some(studentSubject => 
          studentSubject.toLowerCase().includes(subject.toLowerCase())
        )
      );
      if (!hasRequiredSubjects) return false;
    }

    // Check portfolio requirement for creative courses
    if (requirements.portfolioRequired && !qualifications.portfolio) {
      return false;
    }

    return true;
  };

  // Check if student can apply to more courses in an institution
  const canApplyToInstitution = (institutionId) => {
    const institutionApplications = existingApplications.filter(app => 
      app.institutionId === institutionId && 
      ['pending', 'approved'].includes(app.status)
    );
    return institutionApplications.length < 2; // Max 2 applications per institution
  };

  // Check if student is already admitted elsewhere
  const hasActiveAdmission = () => {
    return existingApplications.some(app => app.admissionAccepted === true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset course when university changes
      ...(name === 'university' && { course: '' })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Please log in to submit an application');
        setLoading(false);
        return;
      }

      if (!studentProfile) {
        setError('Please complete your student profile before applying');
        setLoading(false);
        return;
      }

      // Validation checks
      if (hasActiveAdmission()) {
        setError('You have already accepted an admission offer. You cannot apply for more courses.');
        setLoading(false);
        return;
      }

      if (!canApplyToInstitution(formData.university)) {
        setError('You can only apply to a maximum of 2 courses per institution. You have reached this limit.');
        setLoading(false);
        return;
      }

      // Get selected course and university
      const selectedCourse = courses.find(course => course.id === formData.course);
      const selectedUniversity = universities.find(uni => uni.id === formData.university);

      if (!selectedCourse || !selectedUniversity) {
        setError('Please select a valid course and university');
        setLoading(false);
        return;
      }

      // Check course eligibility
      if (!checkCourseEligibility(selectedCourse, studentProfile)) {
        setError('You do not meet the requirements for this course. Please check the course requirements.');
        setLoading(false);
        return;
      }

      // Check if already applied to same course
      const existingApplication = existingApplications.find(app => 
        app.courseId === formData.course && app.institutionId === formData.university
      );
      if (existingApplication) {
        setError('You have already applied to this course');
        setLoading(false);
        return;
      }

      // Prepare application data for Firestore
      const applicationData = {
        // Student information
        studentId: user.uid,
        studentName: `${formData.firstName} ${formData.lastName}`.trim(),
        studentEmail: formData.email,
        studentPhone: formData.phone,
        
        // Application details
        institutionId: formData.university,
        institutionName: selectedUniversity.name,
        courseId: formData.course,
        courseName: selectedCourse.name,
        level: formData.level,
        intake: formData.intake,
        message: formData.message,
        
        // Qualification data
        qualifications: studentProfile.qualifications,
        meetsRequirements: true,
        
        // System fields
        status: 'pending',
        applicationDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        
        // Additional metadata
        studentProfileCompleted: true,
        applicationType: 'direct'
      };

      console.log('Submitting application:', applicationData);

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'applications'), applicationData);
      
      console.log('Application submitted with ID:', docRef.id);
      
      setSuccess('Application submitted successfully! The university will review your application.');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        university: '',
        course: '',
        level: '',
        intake: '',
        documents: [],
        message: ''
      });

      // Refresh applications list
      fetchStudentData();

      // Redirect after success
      setTimeout(() => navigate('/student-dashboard'), 2000);

    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!studentProfile) {
    return (
      <div className="container mt-4">
        <Alert variant="warning">
          <Alert.Heading>Profile Required</Alert.Heading>
          <p>Please complete your student profile before applying for courses.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="primary" onClick={() => navigate('/student-profile')}>
              Go to Profile
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (hasActiveAdmission()) {
    return (
      <div className="container mt-4">
        <Alert variant="success">
          <Alert.Heading>Admission Accepted</Alert.Heading>
          <p>You have already accepted an admission offer. You cannot apply for additional courses.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="primary" onClick={() => navigate('/student-dashboard')}>
              View Your Admission
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  const selectedUniversity = universities.find(uni => uni.id === formData.university);
  const selectedCourse = courses.find(course => course.id === formData.course);
  const canApply = canApplyToInstitution(formData.university);
  const applicationCount = existingApplications.filter(app => 
    app.institutionId === formData.university && 
    ['pending', 'approved'].includes(app.status)
  ).length;

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">
                <i className="bi bi-mortarboard me-2"></i>
                Course Application
              </h3>
              <p className="mb-0 mt-2 small">
                Apply to your desired course at Lesotho's top universities
                {applicationCount > 0 && (
                  <Badge bg="warning" className="ms-2">
                    {applicationCount}/2 applications to this institution
                  </Badge>
                )}
              </p>
            </Card.Header>
            
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="d-flex align-items-center">
                  <i className="bi bi-check-circle me-2"></i>
                  {success}
                </Alert>
              )}

              {/* Application Limits Info */}
              <Alert variant="info" className="mb-4">
                <h6 className="alert-heading">Application Rules</h6>
                <ul className="mb-0 small">
                  <li>Maximum 2 applications per institution</li>
                  <li>You must meet course requirements to apply</li>
                  <li>You can only accept one admission offer</li>
                  <li>Accepting an offer withdraws all other applications</li>
                </ul>
              </Alert>

              <Form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <Row className="mb-4">
                  <Col xs={12}>
                    <h5 className="text-primary mb-3">
                      <i className="bi bi-person me-2"></i>
                      Personal Information
                    </h5>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>First Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Last Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Col>
                </Row>

                {/* Course Selection */}
                <Row className="mb-4">
                  <Col xs={12}>
                    <h5 className="text-primary mb-3">
                      <i className="bi bi-book me-2"></i>
                      Course Selection
                    </h5>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Preferred University *</Form.Label>
                    <Form.Select
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select University</option>
                      {universities.map(uni => (
                        <option key={uni.id} value={uni.id}>{uni.name}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Course *</Form.Label>
                    <Form.Select
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      required
                      disabled={!formData.university || loading}
                    >
                      <option value="">Select Course</option>
                      {availableCourses.map(course => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                      ))}
                    </Form.Select>
                    {formData.university && availableCourses.length === 0 && (
                      <Form.Text className="text-warning">
                        No available courses that match your qualifications.
                      </Form.Text>
                    )}
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Level *</Form.Label>
                    <Form.Select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select Level</option>
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Preferred Intake *</Form.Label>
                    <Form.Select
                      name="intake"
                      value={formData.intake}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select Intake</option>
                      {intakes.map(intake => (
                        <option key={intake} value={intake}>{intake}</option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>

                {/* Course Requirements Display */}
                {selectedCourse && selectedCourse.requirements && (
                  <Alert variant="light" className="mb-4">
                    <h6>Course Requirements:</h6>
                    <ul className="mb-0">
                      {selectedCourse.requirements.minimumGrade && (
                        <li>Minimum Grade: {selectedCourse.requirements.minimumGrade}</li>
                      )}
                      {selectedCourse.requirements.requiredSubjects && (
                        <li>
                          Required Subjects: {
                            Array.isArray(selectedCourse.requirements.requiredSubjects)
                              ? selectedCourse.requirements.requiredSubjects.join(', ')
                              : selectedCourse.requirements.requiredSubjects
                          }
                        </li>
                      )}
                      {selectedCourse.requirements.portfolioRequired && (
                        <li>Portfolio Required</li>
                      )}
                    </ul>
                    <Badge bg="success" className="mt-2">
                      ✓ You meet the requirements
                    </Badge>
                  </Alert>
                )}

                {/* Additional Information */}
                <Row className="mb-4">
                  <Col xs={12}>
                    <h5 className="text-primary mb-3">
                      <i className="bi bi-chat-text me-2"></i>
                      Additional Information
                    </h5>
                  </Col>
                  <Col xs={12} className="mb-3">
                    <Form.Label>Message (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your background, interests, or any special requirements..."
                      disabled={loading}
                    />
                  </Col>
                </Row>

                {/* Submit Button */}
                <Row className="mb-4">
                  <Col xs={12} className="d-flex justify-content-between">
                    <Button 
                      variant="outline-secondary"
                      onClick={() => navigate('/student-dashboard')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={loading || !canApply || !formData.course}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>
                          Submit Application
                        </>
                      )}
                    </Button>
                  </Col>
                </Row>
              </Form>

              {/* Application Status Summary */}
              <Card className="bg-light">
                <Card.Body>
                  <h6>Your Application Status</h6>
                  <Row>
                    <Col md={4}>
                      <strong>Total Applications:</strong> {existingApplications.length}
                    </Col>
                    <Col md={4}>
                      <strong>Pending Review:</strong> {existingApplications.filter(app => app.status === 'pending').length}
                    </Col>
                    <Col md={4}>
                      <strong>Approved:</strong> {existingApplications.filter(app => app.status === 'approved').length}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}