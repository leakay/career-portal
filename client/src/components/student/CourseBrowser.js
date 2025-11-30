import React, { useState, useEffect } from 'react';
import CourseCard from './CourseCard';

export default function CourseBrowser() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filters, setFilters] = useState({
    university: '',
    level: '',
    duration: '',
    search: ''
  });
  const [loading, setLoading] = useState(true);

  // Sample course data
  const sampleCourses = [
    {
      id: 1,
      title: "Bachelor of Computer Science",
      summary: "Comprehensive program in software development, algorithms, and computer systems. Includes practical projects and industry placements.",
      university: "National University of Lesotho",
      duration: "4 Years",
      level: "Undergraduate",
      fees: "M25,000/year",
      intake: "January, September",
      requirements: "Mathematics & Science background",
      rating: 4.5
    },
    {
      id: 2,
      title: "Creative Multimedia Design",
      summary: "Focus on digital media, graphic design, animation, and interactive content creation for modern digital platforms.",
      university: "Limkokwing University",
      duration: "3 Years",
      level: "Undergraduate",
      fees: "M30,000/year",
      intake: "January, May, September",
      requirements: "Portfolio review",
      rating: 4.2
    },
    {
      id: 3,
      title: "Business Information Systems",
      summary: "Bridge business management with information technology applications. Learn to develop business solutions using technology.",
      university: "Botho University",
      duration: "3 Years",
      level: "Undergraduate",
      fees: "M28,000/year",
      intake: "January, September",
      requirements: "Commerce background preferred",
      rating: 4.3
    },
    {
      id: 4,
      title: "Master of Business Administration",
      summary: "Advanced business management program focusing on leadership, strategy, and organizational management.",
      university: "National University of Lesotho",
      duration: "2 Years",
      level: "Postgraduate",
      fees: "M35,000/year",
      intake: "January",
      requirements: "Bachelor's degree + 2 years experience",
      rating: 4.7
    },
    {
      id: 5,
      title: "Diploma in Hospitality Management",
      summary: "Practical training in hotel management, tourism, and customer service for the growing hospitality industry.",
      university: "Botho University",
      duration: "2 Years",
      level: "Diploma",
      fees: "M22,000/year",
      intake: "January, May",
      requirements: "High School Certificate",
      rating: 4.1
    },
    {
      id: 6,
      title: "Fashion Design & Marketing",
      summary: "Creative program covering fashion design, textile technology, and fashion business management.",
      university: "Limkokwing University",
      duration: "3 Years",
      level: "Undergraduate",
      fees: "M32,000/year",
      intake: "January, September",
      requirements: "Creative portfolio",
      rating: 4.4
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCourses(sampleCourses);
      setFilteredCourses(sampleCourses);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let results = courses;
    
    // Apply filters
    if (filters.university) {
      results = results.filter(course => 
        course.university.toLowerCase().includes(filters.university.toLowerCase())
      );
    }
    
    if (filters.level) {
      results = results.filter(course => course.level === filters.level);
    }
    
    if (filters.duration) {
      results = results.filter(course => course.duration === filters.duration);
    }
    
    if (filters.search) {
      results = results.filter(course =>
        course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.summary.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.university.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    setFilteredCourses(results);
  }, [filters, courses]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      university: '',
      level: '',
      duration: '',
      search: ''
    });
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading courses...</span>
          </div>
          <p className="mt-3 text-muted">Loading available courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="text-primary mb-1">Course Browser</h3>
              <p className="text-muted mb-0">
                Explore {courses.length} courses from Lesotho's top universities
              </p>
            </div>
            <div className="text-muted">
              Showing {filteredCourses.length} of {courses.length} courses
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search courses by name, university, or keywords..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary flex-fill" data-bs-toggle="collapse" data-bs-target="#filterCollapse">
              <i className="bi bi-funnel me-2"></i>
              Filters
            </button>
            <button className="btn btn-outline-secondary" onClick={clearFilters}>
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="collapse mb-4" id="filterCollapse">
        <div className="card">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-bold">University</label>
                <select
                  className="form-select"
                  value={filters.university}
                  onChange={(e) => handleFilterChange('university', e.target.value)}
                >
                  <option value="">All Universities</option>
                  <option value="National University of Lesotho">NUL</option>
                  <option value="Limkokwing University">Limkokwing</option>
                  <option value="Botho University">Botho</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Level</label>
                <select
                  className="form-select"
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                  <option value="">All Levels</option>
                  <option value="Certificate">Certificate</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Duration</label>
                <select
                  className="form-select"
                  value={filters.duration}
                  onChange={(e) => handleFilterChange('duration', e.target.value)}
                >
                  <option value="">Any Duration</option>
                  <option value="1 Year">1 Year</option>
                  <option value="2 Years">2 Years</option>
                  <option value="3 Years">3 Years</option>
                  <option value="4 Years">4 Years</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(filters.university || filters.level || filters.duration) && (
        <div className="row mb-3">
          <div className="col-12">
            <div className="d-flex align-items-center gap-2">
              <small className="text-muted">Active filters:</small>
              {filters.university && (
                <span className="badge bg-primary">
                  University: {filters.university}
                  <button 
                    className="btn-close btn-close-white ms-1" 
                    style={{fontSize: '0.6rem'}}
                    onClick={() => handleFilterChange('university', '')}
                  ></button>
                </span>
              )}
              {filters.level && (
                <span className="badge bg-success">
                  Level: {filters.level}
                  <button 
                    className="btn-close btn-close-white ms-1" 
                    style={{fontSize: '0.6rem'}}
                    onClick={() => handleFilterChange('level', '')}
                  ></button>
                </span>
              )}
              {filters.duration && (
                <span className="badge bg-info">
                  Duration: {filters.duration}
                  <button 
                    className="btn-close btn-close-white ms-1" 
                    style={{fontSize: '0.6rem'}}
                    onClick={() => handleFilterChange('duration', '')}
                  ></button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="row">
        {filteredCourses.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <i className="bi bi-search display-1 text-muted"></i>
              <h4 className="text-muted mt-3">No courses found</h4>
              <p className="text-muted">Try adjusting your search criteria or filters</p>
              <button className="btn btn-primary" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          filteredCourses.map(course => (
            <div key={course.id} className="col-lg-6 col-xl-4 mb-4">
              <CourseCard 
                course={course}
                onDetails={() => console.log('View details:', course)}
                onEnroll={() => console.log('Enroll in:', course)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}