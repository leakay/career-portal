import React, { useState, useRef } from 'react';

export default function SearchBar({ onSearch, placeholder = "Search jobs, courses..." }) {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
    inputRef.current.focus();
  };

  return (
    <div className="position-relative" style={{ maxWidth: '400px' }}>
      <div className="input-group">
        <span className="input-group-text bg-white border-end-0">
          <i className="bi bi-search text-muted"></i>
        </span>
        <input
          ref={inputRef}
          type="text"
          className="form-control border-start-0"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchTerm && (
          <button
            className="btn btn-outline-secondary border-start-0"
            type="button"
            onClick={clearSearch}
          >
            <i className="bi bi-x"></i>
          </button>
        )}
      </div>
    </div>
  );
}