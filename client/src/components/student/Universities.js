import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import './Universities.css';

export default function Universities() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [firestoreError, setFirestoreError] = useState('');
  const navigate = useNavigate();

  // Sample universities data - you can replace this with Firestore data
  const sampleUniversities = [
    {
      id: 'nul',
      name: 'National University of Lesotho',
      location: 'Roma, Lesotho',
      logo: '🏛️',
      description: 'The premier institution of higher learning in Lesotho, established in 1945. Committed to academic excellence, research, and community development.',
      courses: ['Computer Science', 'Engineering', 'Business Administration', 'Medicine', 'Law', 'Education', 'Social Sciences'],
      website: 'www.nul.ls',
      phone: '+266 5221 4000',
      email: 'info@nul.ls',
      established: '1945',
      type: 'Public University'
    },
    {
      id: 'limkokwing',
      name: 'Limkokwing University',
      location: 'Maseru, Lesotho',
      logo: '🎓',
      description: 'A leading private university offering innovative education in creative arts, business, and technology. Known for industry partnerships and practical learning.',
      courses: ['Graphic Design', 'Business Management', 'IT', 'Fashion Design', 'Multimedia', 'Hospitality Management'],
      website: 'www.limkokwing.net',
      phone: '+266 2231 7000',
      email: 'info@limkokwing.net',
      established: '2008',
      type: 'Private University'
    },
    {
      id: 'botho',
      name: 'Botho University',
      location: 'Maseru, Lesotho',
      logo: '📚',
      description: 'A modern university focused on technology-driven education and entrepreneurship. Offers programs in computing, business, and health sciences.',
      courses: ['Accounting', 'Hospitality Management', 'Networking', 'Software Engineering', 'Business Administration', 'Health Sciences'],
      website: 'www.botho.ac.bw',
      phone: '+266 5333 3333',
      email: 'info@botho.ac.bw',
      established: '1997',
      type: 'Private University'
    }
  ];

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      console.log('Fetching universities...');

      // Fetch institutions from Firestore
      const universitiesQuery = query(collection(db, 'institutions'), where('status', '==', 'active'));
      const universitiesSnapshot = await getDocs(universitiesQuery);
      const universitiesData = universitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch all active courses
      const coursesQuery = query(collection(db, 'courses'), where('status', '==', 'active'));
      const coursesSnapshot = await getDocs(coursesQuery);
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (universitiesData.length > 0) {
        // Group courses by institutionId
        const coursesByInstitution = coursesData.reduce((acc, course) => {
          if (!acc[course.institutionId]) {
            acc[course.institutionId] = [];
          }
          acc[course.institutionId].push(course.name);
          return acc;
        }, {});

        // Transform Firestore data to match component structure
        const transformedUniversities = universitiesData.map(uni => ({
          id: uni.id,
          name: uni.name || 'Unknown University',
          location: uni.location || 'Lesotho',
          logo: uni.logo || '🏛️',
          description: uni.description || 'A leading institution offering quality education.',
          courses: coursesByInstitution[uni.id] || ['Computer Science', 'Business Administration'],
          website: uni.website || 'www.example.edu.ls',
          phone: uni.phone || '+266 0000 0000',
          email: uni.email || 'info@example.edu.ls',
          established: uni.established || 'N/A',
          type: uni.type || 'University'
        }));
        setUniversities(transformedUniversities);
        console.log('Loaded universities from Firestore:', transformedUniversities.length);
      } else {
        // Fallback to sample data if no Firestore data
        console.log('No universities in Firestore, using sample data');
        setUniversities(sampleUniversities);
      }
    } catch (error) {
      console.error('Error fetching universities from Firestore:', error);
      setFirestoreError('Failed to load universities from database. Using sample data.');
      // Fallback to sample data
      setUniversities(sampleUniversities);
    } finally {
      setLoading(false);
    }
  };

  const handleUniversityClick = (university) => {
    setSelectedUniversity(university);
  };

  const handleApplyClick = (university) => {
    // Navigate to course application with selected university
    navigate('/student-dashboard', {
      state: { selectedUniversity: university.id }
    });
  };

  const closeModal = () => {
    setSelectedUniversity(null);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading universities...</span>
          </div>
          <p className="mt-3 text-muted">Loading universities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button as={Link} to="/student-dashboard" variant="outline-secondary" className="me-3">
                ← Back to Dashboard
              </Button>
              <h3 className="text-primary mb-1 d-inline">Universities in Lesotho</h3>
              <p className="text-muted mb-0">
                Explore top universities and discover your perfect academic destination.
              </p>
            </div>
            <div className="text-end">
              <div className="badge bg-info">{universities.length} Universities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Firestore Error Alert */}
      {firestoreError && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {firestoreError}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFirestoreError('')}
          ></button>
        </div>
      )}

      {/* Universities Grid */}
      <div className="row">
        {universities.map(university => (
          <div key={university.id} className="col-lg-4 col-md-6 mb-4">
            <div className="card h-100 shadow-sm university-card">
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center mb-3">
                  <span className="university-logo me-3" style={{ fontSize: '2rem' }}>
                    {university.logo}
                  </span>
                  <div>
                    <h5 className="card-title mb-1">{university.name}</h5>
                    <small className="text-muted">{university.location}</small>
                  </div>
                </div>

                <p className="card-text text-muted small mb-3 flex-grow-1">
                  {university.description}
                </p>

                <div className="mb-3">
                  <small className="text-muted d-block mb-2">Popular Courses:</small>
                  <div className="courses-preview">
                    {university.courses.slice(0, 3).map(course => (
                      <span key={course} className="badge bg-light text-dark me-1 mb-1">
                        {course}
                      </span>
                    ))}
                    {university.courses.length > 3 && (
                      <span className="badge bg-secondary">
                        +{university.courses.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="university-meta mb-3">
                  <div className="row text-center">
                    <div className="col-6">
                      <small className="text-muted d-block">Established</small>
                      <strong>{university.established}</strong>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Type</small>
                      <strong className="text-primary">{university.type}</strong>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-auto">
                  <button
                    className="btn btn-outline-primary btn-sm flex-fill"
                    onClick={() => handleUniversityClick(university)}
                  >
                    <i className="bi bi-info-circle me-1"></i>
                    Details
                  </button>
                  <button
                    className="btn btn-primary btn-sm flex-fill"
                    onClick={() => handleApplyClick(university)}
                  >
                    <i className="bi bi-send me-1"></i>
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* University Details Modal */}
      {selectedUniversity && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <span className="me-2" style={{ fontSize: '1.5rem' }}>
                    {selectedUniversity.logo}
                  </span>
                  {selectedUniversity.name}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-8">
                    <h6>About {selectedUniversity.name}</h6>
                    <p>{selectedUniversity.description}</p>

                    <div className="mb-3">
                      <h6>Available Courses</h6>
                      <div className="courses-list">
                        {selectedUniversity.courses.map(course => (
                          <span key={course} className="badge bg-primary me-1 mb-1">
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="university-details">
                      <div className="row">
                        <div className="col-sm-6">
                          <strong>Location:</strong> {selectedUniversity.location}
                        </div>
                        <div className="col-sm-6">
                          <strong>Established:</strong> {selectedUniversity.established}
                        </div>
                        <div className="col-sm-6">
                          <strong>Type:</strong> {selectedUniversity.type}
                        </div>
                        <div className="col-sm-6">
                          <strong>Website:</strong> {selectedUniversity.website}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="contact-card bg-light p-3 rounded">
                      <h6>Contact Information</h6>
                      <div className="contact-info">
                        <p className="mb-2">
                          <i className="bi bi-telephone me-2"></i>
                          {selectedUniversity.phone}
                        </p>
                        <p className="mb-2">
                          <i className="bi bi-envelope me-2"></i>
                          {selectedUniversity.email}
                        </p>
                        <p className="mb-0">
                          <i className="bi bi-globe me-2"></i>
                          {selectedUniversity.website}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    handleApplyClick(selectedUniversity);
                    closeModal();
                  }}
                >
                  Apply to This University
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {selectedUniversity && (
        <div
          className="modal-backdrop show"
          onClick={closeModal}
        ></div>
      )}
    </div>
  );
}
