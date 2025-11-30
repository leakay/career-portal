import React, { useState } from 'react';

export default function FilterComponent({ 
  onFilterChange, 
  universities = [],
  courses = [] 
}) {
  const [filters, setFilters] = useState({
    university: '',
    courseType: '',
    level: '',
    duration: '',
    sortBy: 'name'
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange && onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      university: '',
      courseType: '',
      level: '',
      duration: '',
      sortBy: 'name'
    };
    setFilters(clearedFilters);
    onFilterChange && onFilterChange(clearedFilters);
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-light">
        <h6 className="mb-0">
          <i className="bi bi-funnel me-2"></i>
          Filter Courses
        </h6>
      </div>
      <div className="card-body">
        {/* University Filter */}
        <div className="mb-3">
          <label className="form-label small fw-bold">University</label>
          <select 
            className="form-select form-select-sm"
            value={filters.university}
            onChange={(e) => handleFilterChange('university', e.target.value)}
          >
            <option value="">All Universities</option>
            <option value="National University of Lesotho">NUL</option>
            <option value="Limkokwing University">Limkokwing</option>
            <option value="Botho University">Botho</option>
          </select>
        </div>

        {/* Course Level Filter */}
        <div className="mb-3">
          <label className="form-label small fw-bold">Level</label>
          <select 
            className="form-select form-select-sm"
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

        {/* Duration Filter */}
        <div className="mb-3">
          <label className="form-label small fw-bold">Duration</label>
          <select 
            className="form-select form-select-sm"
            value={filters.duration}
            onChange={(e) => handleFilterChange('duration', e.target.value)}
          >
            <option value="">Any Duration</option>
            <option value="1 Year">1 Year</option>
            <option value="2 Years">2 Years</option>
            <option value="3 Years">3 Years</option>
            <option value="4 Years">4 Years</option>
            <option value="5+ Years">5+ Years</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="mb-3">
          <label className="form-label small fw-bold">Sort By</label>
          <select 
            className="form-select form-select-sm"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="name">Name (A-Z)</option>
            <option value="nameDesc">Name (Z-A)</option>
            <option value="duration">Duration</option>
            <option value="university">University</option>
          </select>
        </div>

        {/* Clear Filters */}
        <button 
          className="btn btn-outline-secondary btn-sm w-100"
          onClick={clearFilters}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Clear Filters
        </button>
      </div>
    </div>
  );
}