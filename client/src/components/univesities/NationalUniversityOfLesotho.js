import React from 'react';
import './NationalUniversityOfLesotho.css';

const NationalUniversityOfLesotho = () => {
  return (
    <div className="nul-container">
      {/* Header Section */}
      <header className="nul-header">
        <div className="nul-logo-section">
          <div className="nul-logo">
            <div className="logo-circle">
              <span className="logo-text">NUL</span>
            </div>
          </div>
          <div className="nul-anniversary">
            <div className="anniversary-years">80 YEARS</div>
            <div className="anniversary-text">ANNIVERSARY</div>
            <div className="anniversary-dates">1945-2025</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="nul-main">
        <div className="nul-content">
          <h1 className="nul-title">NATIONAL UNIVERSITY OF LESOTHO</h1>
          
          {/* Study Button */}
          <div className="study-section">
            <button className="study-button">
              I Want To Study
              <span className="button-arrow">→</span>
            </button>
          </div>

          {/* University Information */}
          <div className="university-info">
            <div className="info-section">
              <h3>About NUL</h3>
              <p>
                The National University of Lesotho (NUL) is the premier institution of higher learning in Lesotho, 
                established in 1945. For 80 years, we have been committed to academic excellence, research, and 
                community development.
              </p>
            </div>

            <div className="info-section">
              <h3>Programs Offered</h3>
              <div className="programs-grid">
                <div className="program-card">
                  <h4>Undergraduate Programs</h4>
                  <ul>
                    <li>Bachelor of Arts</li>
                    <li>Bachelor of Science</li>
                    <li>Bachelor of Commerce</li>
                    <li>Bachelor of Education</li>
                    <li>Bachelor of Engineering</li>
                  </ul>
                </div>
                <div className="program-card">
                  <h4>Postgraduate Programs</h4>
                  <ul>
                    <li>Master's Degrees</li>
                    <li>PhD Programs</li>
                    <li>Postgraduate Diplomas</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h3>Faculties</h3>
              <div className="faculties-list">
                <span className="faculty-tag">Humanities</span>
                <span className="faculty-tag">Science & Technology</span>
                <span className="faculty-tag">Education</span>
                <span className="faculty-tag">Social Sciences</span>
                <span className="faculty-tag">Health Sciences</span>
                <span className="faculty-tag">Agriculture</span>
                <span className="faculty-tag">Law</span>
              </div>
            </div>

            <div className="info-section">
              <h3>Contact Information</h3>
              <div className="contact-info">
                <p><strong>Location:</strong> Roma, Lesotho</p>
                <p><strong>Phone:</strong> +266 5221 4000</p>
                <p><strong>Email:</strong> info@nul.ls</p>
                <p><strong>Website:</strong> www.nul.ls</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NationalUniversityOfLesotho;