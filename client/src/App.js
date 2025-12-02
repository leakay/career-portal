// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from 'react-bootstrap';
import Home from './pages/Home';
import StudentDashboard from './components/student/StudentDashboard';
import StudentApplications from './components/student/ApplicationStatus';
import StudentProfile from './components/student/StudentProfile';
import Documents from './components/student/Documents';
import JobPostings from './components/student/JobPostings';
import CompanyDashboard from './components/company/CompanyDashboard';
import InstituteDashboard from './components/institute/InstituteDashboard';
import InstituteProfile from './components/institute/InstituteProfile';
import CourseManagement from './components/institute/CourseManagement';
import ApplicationReview from './components/institute/ApplicationReview';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import './styles/styles.css';
import Signup from './pages/Signup';
import JobManagement from './components/company/JobManagement';
import JobPosting from './components/company/JobPosting';
import ApplicantView from './components/company/ApplicantView';
import CompanyProfile from './components/company/CompanyProfile';
import Universities from './components/student/Universities';



// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import AdminInstitutions from './components/admin/AdminInstitutions';
import AdminFaculties from './components/admin/AdminFaculties';
import AdminCourses from './components/admin/AdminCourses';
import AdminUsers from './components/admin/AdminUsers';
import AdminCompanies from './components/admin/AdminCompanies';
import AdminReports from './components/admin/AdminReports';
import AdminAdmissions from './components/admin/AdminAdmissions';
import AdminAdmissionsPublish from './components/admin/AdminAdmissionsPublish';
import AdminSecurity from './components/admin/AdminSecurity';
import AdminLogin from './components/auth/AdminLogin';

// Auth Context
import ProtectedRoute from './components/shared/ProtectedRoute';
import Unauthorized from './components/shared/Unauthorized';
import { AuthProvider } from './components/contexts/AuthContext';


function App() {
  return (
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App theme-root app-container" style={{margin:'1rem'}}>
            <Navbar />
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Student Routes */}
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/student/applications" element={<StudentApplications />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/documents" element={<Documents />} />
            <Route path="/student/jobs" element={<JobPostings />} />
            <Route path="/universities" element={<Universities />} />

            {/* Institute Routes */}
            <Route path="/institute-dashboard" element={<InstituteDashboard />} />
            <Route path="/institute/profile" element={<InstituteProfile />} />
            <Route path="/course-management" element={<CourseManagement />} />
            <Route path="/application-review" element={<ApplicationReview />} />

            {/* Company Routes */}
            <Route path="/company-dashboard" element={<CompanyDashboard />} />
            <Route path="/company/applicants" element={<ApplicantView />} />
            <Route path="/company/applicant/:applicantId" element={<StudentProfile />} />
            <Route path="/company/profile" element={<CompanyProfile />} />
            <Route path="/company/jobs" element={<JobManagement />} />
            <Route path="/company/jobs/post" element={<JobPosting />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/institutions" element={<ProtectedRoute allowedRoles={['admin']}><AdminInstitutions /></ProtectedRoute>} />
            <Route path="/admin/faculties" element={<ProtectedRoute allowedRoles={['admin']}><AdminFaculties /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><AdminCourses /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/companies" element={<ProtectedRoute allowedRoles={['admin']}><AdminCompanies /></ProtectedRoute>} />
            <Route path="/admin/admissions" element={<ProtectedRoute allowedRoles={['admin']}><AdminAdmissions /></ProtectedRoute>} />
            <Route path="/admin/admissions-publish" element={<ProtectedRoute allowedRoles={['admin']}><AdminAdmissionsPublish /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/security" element={<ProtectedRoute allowedRoles={['admin']}><AdminSecurity /></ProtectedRoute>} />

            {/* Catch-all route */}
            <Route path="*" element={<div className="container mt-5 text-center"><h1>404 - Page Not Found</h1></div>} />
          </Routes>
          </div>
        </Router>
      </AuthProvider>
  );
}

export default App;
