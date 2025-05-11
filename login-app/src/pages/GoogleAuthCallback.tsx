/**
 * @fileoverview The Google authentication callback page.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spin, Alert } from 'antd';
import AuthLayout from '../commons/AuthLayout';

const GoogleAuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // when the component is mounted or the location is changed, get the token and error from the URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    // if the error is present, set the error and redirect to the signin page
    if (errorParam) {
      setError('Authentication failed. Please try again.');
      setTimeout(() => navigate('/signin'), 3000);
      return;
    }

    // if the token is not present, set the error and redirect to the signin page
    if (!token) {
      setError('No authentication token received');
      setTimeout(() => navigate('/signin'), 3000);
      return;
    }

    try {
      // store the token
      localStorage.setItem('token', token);

      // redirect to the home page if the token is present
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (err) {
      console.error('Error during authentication:', err);
      setError('Failed to process authentication');
      setTimeout(() => navigate('/signin'), 3000);
    }
  }, [navigate, location]);

  return (
    <AuthLayout>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        {error ? (
          <Alert
            message="Authentication Error"
            description={error}
            type="error"
            showIcon
          />
        ) : (
          <>
            <Spin size="large" />
            <p style={{ marginTop: 20 }}>Authentication successful! Redirecting...</p>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default GoogleAuthCallback;