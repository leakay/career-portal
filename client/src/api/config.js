// src/api/config.js
import { auth } from '../firebase';

// Use localhost for development, Firebase Functions for production
const isDevelopment = process.env.NODE_ENV === 'development';
const API_BASE_URL = isDevelopment
  ? 'http://localhost:5000'
  : (process.env.REACT_APP_API_BASE_URL || 'https://us-central1-leakay-11570.cloudfunctions.net/api');

// Helper function to get Firebase ID token
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  throw new Error('User not authenticated');
};

export const realApi = {
  // Health check
  checkHealth: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  // Applications (existing)
  getApplications: async (instituteId = null) => {
    let url = `${API_BASE_URL}/applications`;
    if (instituteId) url = `${API_BASE_URL}/applications/institute/${instituteId}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch applications: ${response.status}`);
    return await response.json();
  },

  // Get student applications
  getStudentApplications: async (studentId) => {
    const response = await fetch(`${API_BASE_URL}/applications/student/${studentId}`);
    if (!response.ok) throw new Error(`Failed to fetch student applications: ${response.status}`);
    return await response.json();
  },

  // Submit application
  submitApplication: async (applicationData) => {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData)
    });
    if (!response.ok) throw new Error(`Failed to submit application: ${response.status}`);
    return await response.json();
  },

  updateApplicationStatus: async (applicationId, status) => {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error(`Failed to update application: ${response.status}`);
    return await response.json();
  },

  // Get available courses
  getAvailableCourses: async () => {
    const response = await fetch(`${API_BASE_URL}/courses`);
    if (!response.ok) throw new Error(`Failed to fetch courses: ${response.status}`);
    return await response.json();
  },

  // Institutions Management
  getInstitutions: async () => {
    const response = await fetch(`${API_BASE_URL}/institutions`);
    if (!response.ok) throw new Error(`Failed to fetch institutions: ${response.status}`);
    return await response.json();
  },

  addInstitution: async (institutionData) => {
    const response = await fetch(`${API_BASE_URL}/institutions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(institutionData)
    });
    if (!response.ok) throw new Error(`Failed to add institution: ${response.status}`);
    return await response.json();
  },

  updateInstitution: async (institutionId, updateData) => {
    const response = await fetch(`${API_BASE_URL}/institutions/${institutionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error(`Failed to update institution: ${response.status}`);
    return await response.json();
  },

  deleteInstitution: async (institutionId) => {
    const response = await fetch(`${API_BASE_URL}/institutions/${institutionId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`Failed to delete institution: ${response.status}`);
    return await response.json();
  },

  // ==================== FACULTIES MANAGEMENT ====================

  // Get faculties by institution
  getFaculties: async (institutionId) => {
    const response = await fetch(`${API_BASE_URL}/institutions/${institutionId}/faculties`);
    if (!response.ok) throw new Error(`Failed to fetch faculties: ${response.status}`);
    return await response.json();
  },

  // Add faculty to institution
  addFaculty: async (institutionId, facultyData) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/institutions/${institutionId}/faculties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(facultyData)
    });
    if (!response.ok) throw new Error(`Failed to add faculty: ${response.status}`);
    return await response.json();
  },

  // Update faculty
  updateFaculty: async (facultyId, updateData) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/faculties/${facultyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error(`Failed to update faculty: ${response.status}`);
    return await response.json();
  },

  // Delete faculty
  deleteFaculty: async (facultyId) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/faculties/${facultyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error(`Failed to delete faculty: ${response.status}`);
    return await response.json();
  },

  // ==================== COURSES MANAGEMENT ====================

  // Get courses by faculty
  getCourses: async (facultyId) => {
    const response = await fetch(`${API_BASE_URL}/faculties/${facultyId}/courses`);
    if (!response.ok) throw new Error(`Failed to fetch courses: ${response.status}`);
    return await response.json();
  },

  // Add course to faculty
  addCourse: async (facultyId, courseData) => {
    const response = await fetch(`${API_BASE_URL}/faculties/${facultyId}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData)
    });
    if (!response.ok) throw new Error(`Failed to add course: ${response.status}`);
    return await response.json();
  },

  // Update course
  updateCourse: async (courseId, updateData) => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error(`Failed to update course: ${response.status}`);
    return await response.json();
  },

  // Delete course
  deleteCourse: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`Failed to delete course: ${response.status}`);
    return await response.json();
  },

  // Companies Management
  getCompanies: async (status = null) => {
    let url = `${API_BASE_URL}/companies`;
    if (status) url += `?status=${status}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch companies: ${response.status}`);
    return await response.json();
  },

  updateCompanyStatus: async (companyId, status) => {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error(`Failed to update company: ${response.status}`);
    return await response.json();
  },

  deleteCompany: async (companyId) => {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`Failed to delete company: ${response.status}`);
    return await response.json();
  },

  // System Stats
  getSystemStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`);
    if (!response.ok) throw new Error(`Failed to fetch system stats: ${response.status}`);
    return await response.json();
  },

  // Admissions Management
  publishAdmissions: async (institutionId, admissionData) => {
    const response = await fetch(`${API_BASE_URL}/institutions/${institutionId}/publish-admissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admissionData)
    });
    if (!response.ok) throw new Error(`Failed to publish admissions: ${response.status}`);
    return await response.json();
  },

  // ==================== JOB POSTING MANAGEMENT ====================

  // Get all jobs
  getJobs: async (companyId = null, status = null) => {
    let url = `${API_BASE_URL}/jobs`;
    const params = new URLSearchParams();

    if (companyId) params.append('companyId', companyId);
    if (status) params.append('status', status);

    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.status}`);
    return await response.json();
  },

  // Get job by ID
  getJob: async (jobId) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
    if (!response.ok) throw new Error(`Failed to fetch job: ${response.status}`);
    return await response.json();
  },

  // Create new job posting
  postJob: async (jobData) => {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    if (!response.ok) throw new Error(`Failed to post job: ${response.status}`);
    return await response.json();
  },

  // Update job posting
  updateJob: async (jobId, updateData) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error(`Failed to update job: ${response.status}`);
    return await response.json();
  },

  // Update job status
  updateJobStatus: async (jobId, status) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error(`Failed to update job status: ${response.status}`);
    return await response.json();
  },

  // Delete job posting
  deleteJob: async (jobId) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`Failed to delete job: ${response.status}`);
    return await response.json();
  },

  // Get jobs by company
  getCompanyJobs: async (companyId, status = null) => {
    let url = `${API_BASE_URL}/companies/${companyId}/jobs`;
    if (status) url += `?status=${status}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch company jobs: ${response.status}`);
    return await response.json();
  },

  // ==================== JOB APPLICATIONS ====================

  // Apply for a job
  applyForJob: async (jobId, applicationData) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData)
    });
    if (!response.ok) throw new Error(`Failed to apply for job: ${response.status}`);
    return await response.json();
  },

  // Get job applications for a company
  getJobApplications: async (companyId, status = null, jobId = null) => {
    let url = `${API_BASE_URL}/companies/${companyId}/applications`;
    const params = new URLSearchParams();

    if (status) params.append('status', status);
    if (jobId) params.append('jobId', jobId);

    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch job applications: ${response.status}`);
    return await response.json();
  },

  // Update job application status
  updateJobApplicationStatus: async (applicationId, status) => {
    const response = await fetch(`${API_BASE_URL}/job-applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error(`Failed to update job application: ${response.status}`);
    return await response.json();
  },

  // ==================== COMPANY PROFILE MANAGEMENT ====================

  // Get company profile
  getCompanyProfile: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/company/profile?userId=${userId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error(`Failed to fetch company profile: ${response.status}`);
    return await response.json();
  },

  // Update company profile
  updateCompanyProfile: async (userId, profileData) => {
    const response = await fetch(`${API_BASE_URL}/api/company/profile?userId=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });
    if (!response.ok) throw new Error(`Failed to update company profile: ${response.status}`);
    return await response.json();
  },

  // ==================== INSTITUTE PROFILE MANAGEMENT ====================

  // Get institute profile (using existing institution endpoint)
  getInstituteProfile: async (instituteId) => {
    console.log('Fetching institute profile for:', instituteId);
    const response = await fetch(`${API_BASE_URL}/institutions`);
    if (!response.ok) throw new Error(`Failed to fetch institutions: ${response.status}`);
    const result = await response.json();
    console.log('Institutions response:', result);

    if (result.success) {
      // Find the specific institution by ID or code
      const institution = result.data.find(inst =>
        inst.id === instituteId ||
        inst.code?.toLowerCase() === instituteId.toLowerCase() ||
        inst.name?.toLowerCase().includes(instituteId.toLowerCase())
      );
      if (institution) {
        console.log('Found institution:', institution);
        return { success: true, data: institution };
      } else {
        console.log('Institution not found, returning first available institution');
        // If no specific institution found, return the first one as fallback
        if (result.data.length > 0) {
          return { success: true, data: result.data[0] };
        }
        throw new Error(`Institution not found for ID: ${instituteId}`);
      }
    } else {
      throw new Error(result.error || 'Failed to fetch institution data');
    }
  },

  // Update institute profile (using existing institution update endpoint)
  updateInstituteProfile: async (instituteId, profileData) => {
    console.log('Updating institute profile for:', instituteId, 'with data:', profileData);

    // First get all institutions to find the document ID
    const getResponse = await fetch(`${API_BASE_URL}/institutions`);
    if (!getResponse.ok) throw new Error(`Failed to fetch institutions: ${getResponse.status}`);
    const getResult = await getResponse.json();
    console.log('Institutions for update:', getResult);

    if (getResult.success) {
      const institution = getResult.data.find(inst =>
        inst.id === instituteId ||
        inst.code?.toLowerCase() === instituteId.toLowerCase() ||
        inst.name?.toLowerCase().includes(instituteId.toLowerCase())
      );

      if (institution) {
        console.log('Updating institution with ID:', institution.id);
        // Update using the document ID
        const response = await fetch(`${API_BASE_URL}/institutions/${institution.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData)
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Update failed:', response.status, errorText);
          throw new Error(`Failed to update institute profile: ${response.status} - ${errorText}`);
        }
        const result = await response.json();
        console.log('Update result:', result);
        return result;
      } else {
        // If no specific institution found, try to update the first one as fallback
        if (getResult.data.length > 0) {
          console.log('No specific institution found, updating first available:', getResult.data[0].id);
          const response = await fetch(`${API_BASE_URL}/institutions/${getResult.data[0].id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update institute profile: ${response.status} - ${errorText}`);
          }
          return await response.json();
        }
        throw new Error(`Institution not found for ID: ${instituteId}`);
      }
    } else {
      throw new Error(getResult.error || 'Failed to fetch institution data');
    }
  }
};

export default realApi;
