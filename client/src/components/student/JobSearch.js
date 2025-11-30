import React, { useState, useEffect } from 'react';
import JobCard from './JobCard';

export default function JobSearch() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    category: '',
    salary: '',
    experience: ''
  });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  // Sample job data
  const sampleJobs = [
    {
      id: 1,
      title: "Software Developer",
      company: "Tech Solutions Lesotho",
      location: "Maseru, Lesotho",
      type: "Full-time",
      salary: "M15,000 - M20,000",
      experience: "1-3 years",
      category: "Technology",
      description: "We are looking for a skilled software developer to join our dynamic team. Experience with React, Node.js, and MongoDB required.",
      postedDate: "2024-01-15",
      urgent: true,
      companyLogo: "🏢"
    },
    {
      id: 2,
      title: "Marketing Intern",
      company: "Creative Agency",
      location: "Roma, Lesotho",
      type: "Internship",
      salary: "Stipend",
      experience: "No experience",
      category: "Marketing",
      description: "Great opportunity for marketing students to gain real-world experience in digital marketing campaigns.",
      postedDate: "2024-01-12",
      urgent: false,
      companyLogo: "🎨"
    },
    {
      id: 3,
      title: "Data Analyst",
      company: "Finance Corp",
      location: "Remote",
      type: "Full-time",
      salary: "M18,000 - M25,000",
      experience: "2-5 years",
      category: "Data Science",
      description: "Analyze financial data and create reports to support business decisions. Strong Excel and SQL skills required.",
      postedDate: "2024-01-10",
      urgent: false,
      companyLogo: "📊"
    },
    {
      id: 4,
      title: "Customer Service Representative",
      company: "Service Plus",
      location: "Maseru, Lesotho",
      type: "Part-time",
      salary: "M8,000 - M12,000",
      experience: "0-1 years",
      category: "Customer Service",
      description: "Provide excellent customer service and support to our clients. Great communication skills required.",
      postedDate: "2024-01-08",
      urgent: true,
      companyLogo: "💬"
    },
    {
      id: 5,
      title: "Sales Manager",
      company: "Business Growth Ltd",
      location: "Maseru, Lesotho",
      type: "Full-time",
      salary: "M25,000 - M35,000",
      experience: "5+ years",
      category: "Sales",
      description: "Lead our sales team and drive business growth. Proven track record in sales management required.",
      postedDate: "2024-01-05",
      urgent: false,
      companyLogo: "📈"
    },
    {
      id: 6,
      title: "Graphic Designer",
      company: "Design Studio",
      location: "Remote",
      type: "Contract",
      salary: "M12,000 - M18,000",
      experience: "1-3 years",
      category: "Design",
      description: "Create stunning visual designs for digital and print media. Proficiency in Adobe Creative Suite required.",
      postedDate: "2024-01-03",
      urgent: false,
      companyLogo: "🎨"
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setJobs(sampleJobs);
      setFilteredJobs(sampleJobs);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let results = jobs;
    
    // Apply search filter
    if (filters.search) {
      results = results.filter(job =>
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.category.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Apply other filters
    if (filters.location) {
      results = results.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.type) {
      results = results.filter(job => job.type === filters.type);
    }
    
    if (filters.category) {
      results = results.filter(job => job.category === filters.category);
    }
    
    if (filters.experience) {
      results = results.filter(job => job.experience === filters.experience);
    }

    // Apply sorting
    results = sortJobs(results, sortBy);
    
    setFilteredJobs(results);
  }, [filters, sortBy, jobs]);

  const sortJobs = (jobsList, sortType) => {
    const sorted = [...jobsList];
    switch (sortType) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
      case 'salary-high':
        return sorted.sort((a, b) => {
          const getMaxSalary = (salary) => parseInt(salary.match(/\d+/g)?.pop() || 0);
          return getMaxSalary(b.salary) - getMaxSalary(a.salary);
        });
      case 'salary-low':
        return sorted.sort((a, b) => {
          const getMinSalary = (salary) => parseInt(salary.match(/\d+/g)?.shift() || 0);
          return getMinSalary(a.salary) - getMinSalary(b.salary);
        });
      default:
        return sorted;
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      type: '',
      category: '',
      salary: '',
      experience: ''
    });
  };

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
  const categories = ['Technology', 'Marketing', 'Sales', 'Design', 'Customer Service', 'Finance', 'Healthcare'];
  const experienceLevels = ['No experience', '0-1 years', '1-3 years', '3-5 years', '5+ years'];

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading jobs...</span>
          </div>
          <p className="mt-3 text-muted">Searching for available jobs...</p>
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
              <h3 className="text-primary mb-1">Find Your Dream Job</h3>
              <p className="text-muted mb-0">
                Discover {jobs.length} opportunities in Lesotho
              </p>
            </div>
            <div className="text-muted">
              {filteredJobs.length} jobs found
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row g-3 align-items-center">
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Job title, company, or keywords..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Location..."
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    <option value="">All Job Types</option>
                    {jobTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <button 
                    className="btn btn-primary w-100"
                    data-bs-toggle="collapse" 
                    data-bs-target="#advancedFilters"
                  >
                    <i className="bi bi-funnel me-2"></i>
                    Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="collapse mb-4" id="advancedFilters">
        <div className="card">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-bold">Category</label>
                <select
                  className="form-select"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Experience Level</label>
                <select
                  className="form-select"
                  value={filters.experience}
                  onChange={(e) => handleFilterChange('experience', e.target.value)}
                >
                  <option value="">Any Experience</option>
                  {experienceLevels.map(exp => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Sort By</label>
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="salary-high">Salary: High to Low</option>
                  <option value="salary-low">Salary: Low to High</option>
                </select>
              </div>
            </div>
            
            {/* Active Filters */}
            {(filters.type || filters.category || filters.experience) && (
              <div className="mt-3 pt-3 border-top">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <small className="text-muted">Active filters:</small>
                  {filters.type && (
                    <span className="badge bg-primary">
                      Type: {filters.type}
                      <button 
                        className="btn-close btn-close-white ms-1" 
                        style={{fontSize: '0.6rem'}}
                        onClick={() => handleFilterChange('type', '')}
                      ></button>
                    </span>
                  )}
                  {filters.category && (
                    <span className="badge bg-success">
                      Category: {filters.category}
                      <button 
                        className="btn-close btn-close-white ms-1" 
                        style={{fontSize: '0.6rem'}}
                        onClick={() => handleFilterChange('category', '')}
                      ></button>
                    </span>
                  )}
                  {filters.experience && (
                    <span className="badge bg-info">
                      Experience: {filters.experience}
                      <button 
                        className="btn-close btn-close-white ms-1" 
                        style={{fontSize: '0.6rem'}}
                        onClick={() => handleFilterChange('experience', '')}
                      ></button>
                    </span>
                  )}
                  <button 
                    className="btn btn-outline-secondary btn-sm ms-2"
                    onClick={clearFilters}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-wrap gap-2">
            <span className="text-muted small">Popular:</span>
            {['Remote', 'Internship', 'Maseru', 'Technology', 'Entry Level'].map(tag => (
              <button
                key={tag}
                className="btn btn-outline-primary btn-sm"
                onClick={() => handleFilterChange('search', tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="row">
        {filteredJobs.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <i className="bi bi-search display-1 text-muted"></i>
              <h4 className="text-muted mt-3">No jobs found</h4>
              <p className="text-muted">Try adjusting your search criteria or filters</p>
              <button className="btn btn-primary" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div key={job.id} className="col-lg-6 col-xl-4 mb-4">
              <JobCard 
                job={job}
                onApply={() => console.log('Apply to:', job)}
                onSave={() => console.log('Save:', job)}
                onDetails={() => console.log('View details:', job)}
              />
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredJobs.length > 0 && (
        <div className="row mt-4">
          <div className="col-12 text-center">
            <button className="btn btn-outline-primary">
              Load More Jobs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}