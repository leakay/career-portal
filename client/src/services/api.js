// For local development (your Express server)
const API_BASE_URL = 'http://localhost:5000';

// For deployed Firebase Functions (if you deploy later)
// const API_BASE_URL = 'https://us-central1-leakay-11570.cloudfunctions.net/api';

// Or use environment variable (recommended)
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const realApi = {
  checkHealth: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  getApplications: async (instituteId = null) => {
    let url = `${API_BASE_URL}/applications`;
    if (instituteId) {
      url = `${API_BASE_URL}/applications/institute/${instituteId}`;
    }
    
    console.log('Fetching from URL:', url); // Debug log
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch applications: ${response.status}`);
    }
    return await response.json();
  },

  getByInstitute: async (instituteId) => {
    return realApi.getApplications(instituteId);
  },

  updateApplicationStatus: async (applicationId, status) => {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update application: ${response.status}`);
    }
    return await response.json();
  },

  updateStatus: async (applicationId, status) => {
    return realApi.updateApplicationStatus(applicationId, status);
  },

  // NEW: Get all unique institutions
  getInstitutions: async () => {
    const response = await fetch(`${API_BASE_URL}/institutions`);
    if (!response.ok) {
      throw new Error(`Failed to fetch institutions: ${response.status}`);
    }
    return await response.json();
  },

  // NEW: Get application by ID
  getApplicationById: async (applicationId) => {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch application: ${response.status}`);
    }
    return await response.json();
  },

  // NEW: Alternative endpoint with correct field name
  getApplicationsByInstitution: async (institutionId) => {
    const response = await fetch(`${API_BASE_URL}/applications/institution/${institutionId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch applications by institution: ${response.status}`);
    }
    return await response.json();
  }
};

export const applicationsAPI = {
  getByInstitute: realApi.getByInstitute,
  updateStatus: realApi.updateStatus,
  getApplications: realApi.getApplications,
  getInstitutions: realApi.getInstitutions,
  getApplicationById: realApi.getApplicationById,
  getApplicationsByInstitution: realApi.getApplicationsByInstitution
};

export const checkHealth = realApi.checkHealth;

// NEW: Export everything for convenience
export default realApi;