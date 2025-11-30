import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles.length > 0 && userProfile) {
    if (!allowedRoles.includes(userProfile.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}
