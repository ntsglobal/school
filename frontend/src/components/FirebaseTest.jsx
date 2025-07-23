import React, { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const FirebaseTest = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Firebase auth object:', auth);
    console.log('Firebase config:', {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    });

    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        console.log('Auth state changed:', user);
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('Auth state error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading Firebase...</div>;
  if (error) return <div>Firebase Error: {error}</div>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Firebase Test</h3>
      <p>Status: {user ? 'Authenticated' : 'Not authenticated'}</p>
      {user && <p>User: {user.email}</p>}
      <p>Project ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID}</p>
      <p>Auth Domain: {import.meta.env.VITE_FIREBASE_AUTH_DOMAIN}</p>
    </div>
  );
};

export default FirebaseTest;
