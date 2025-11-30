import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute component
 * Wraps around routes that require authentication or role-based access.
 *
 * @param {object} user - Firebase Auth user object
 * @param {string[]} allowedRoles - Optional list of allowed user roles
 * @param {boolean} loading - Whether authentication state is still loading
 * @param {JSX.Element} children - The protected component to render
 */
export default function ProtectedRoute({ user, allowedRoles = [], loading, children }) {
  // Wait until user state finishes loading
  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-dark text-light">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are defined and user’s role is not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Otherwise, render the child component
  return <>{children}</>;
}
