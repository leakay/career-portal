const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://us-central1-leakay-11570.cloudfunctions.net/api';

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
  },

  // Company management methods
  getCompanies: async () => {
    const response = await fetch(`${API_BASE_URL}/companies`);
    if (!response.ok) {
      throw new Error(`Failed to fetch companies: ${response.status}`);
    }
    return await response.json();
  },

  updateCompanyStatus: async (companyId, status) => {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error(`Failed to update company status: ${response.status}`);
    }
    return await response.json();
  },

  deleteCompany: async (companyId) => {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete company: ${response.status}`);
    }
    return await response.json();
  },

  // Institution management methods
  getInstitutions: async () => {
    const response = await fetch(`${API_BASE_URL}/institutions`);
    if (!response.ok) {
      throw new Error(`Failed to fetch institutions: ${response.status}`);
    }
    return await response.json();
  },

  publishAdmissions: async (institutionId, admissionData) => {
    const response = await fetch(`${API_BASE_URL}/institutions/${institutionId}/publish-admissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(admissionData)
    });

    if (!response.ok) {
      throw new Error(`Failed to publish admissions: ${response.status}`);
    }
    return await response.json();
  },

  // Faculty management methods
  getFaculties: async (institutionId = null) => {
    let url = `${API_BASE_URL}/institutions/${institutionId}/faculties`;
    if (!institutionId) {
      // If no institutionId, get all faculties (admin view)
      url = `${API_BASE_URL}/faculties`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch faculties: ${response.status}`);
    }
    return await response.json();
  },

  addFaculty: async (institutionId, facultyData) => {
    const response = await fetch(`${API_BASE_URL}/institutions/${institutionId}/faculties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(facultyData)
    });

    if (!response.ok) {
      throw new Error(`Failed to add faculty: ${response.status}`);
    }
    return await response.json();
  },

  updateFaculty: async (facultyId, facultyData) => {
    const response = await fetch(`${API_BASE_URL}/faculties/${facultyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(facultyData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update faculty: ${response.status}`);
    }
    return await response.json();
  },

  deleteFaculty: async (facultyId) => {
    const response = await fetch(`${API_BASE_URL}/faculties/${facultyId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete faculty: ${response.status}`);
    }
    return await response.json();
  },

  // Course management methods
  getCourses: async (facultyId = null) => {
    let url = `${API_BASE_URL}/courses`;
    if (facultyId) {
      url = `${API_BASE_URL}/faculties/${facultyId}/courses`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.status}`);
    }
    return await response.json();
  },

  addCourse: async (facultyId, courseData) => {
    const response = await fetch(`${API_BASE_URL}/faculties/${facultyId}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData)
    });

    if (!response.ok) {
      throw new Error(`Failed to add course: ${response.status}`);
    }
    return await response.json();
  },

  updateCourse: async (courseId, courseData) => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update course: ${response.status}`);
    }
    return await response.json();
  },

  deleteCourse: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete course: ${response.status}`);
    }
    return await response.json();
  },

  // Institute profile management methods
  getInstituteProfile: async (instituteId) => {
    const response = await fetch(`${API_BASE_URL}/institutions/${instituteId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch institute profile: ${response.status}`);
    }
    return await response.json();
  },

  updateInstituteProfile: async (instituteId, profileData) => {
    const response = await fetch(`${API_BASE_URL}/institutions/${instituteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update institute profile: ${response.status}`);
    }
    return await response.json();
  },

  // Job posting methods (for institute to view jobs)
  getJobs: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.companyId) queryParams.append('companyId', filters.companyId);
    if (filters.status) queryParams.append('status', filters.status);

    const url = `${API_BASE_URL}/jobs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.status}`);
    }
    return await response.json();
  },

  // Application management methods (for institute to manage applications)
  getApplicationsByInstitute: async (instituteId) => {
    const response = await fetch(`${API_BASE_URL}/applications/institution/${instituteId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch applications: ${response.status}`);
    }
    return await response.json();
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
      throw new Error(`Failed to update application status: ${response.status}`);
    }
    return await response.json();
  },

  // Get applications by institute
  getApplicationsByInstitute: async (instituteId) => {
    const response = await fetch(`${API_BASE_URL}/applications/institute/${instituteId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch applications: ${response.status}`);
    }
    return await response.json();
  },

  // Publish admissions for approved applications
  publishAdmissions: async (instituteId, applicationIds) => {
    const response = await fetch(`${API_BASE_URL}/institutions/${instituteId}/publish-admissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ applicationIds })
    });

    if (!response.ok) {
      throw new Error(`Failed to publish admissions: ${response.status}`);
    }
    return await response.json();
  }
};
