const API_BASE_URL = 'http://localhost:5000/your-project-id/us-central1/api';

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
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch applications: ${response.status}`);
    }
    const result = await response.json();
    return result;
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
  }
};
