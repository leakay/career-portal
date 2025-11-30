import { useState, useEffect } from 'react';
import { auth } from '../firebase';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError(error);
        setLoading(false);
        setUser(null);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user
  };
}