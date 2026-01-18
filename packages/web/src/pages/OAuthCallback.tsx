import { useEffect, useState } from 'react';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';

export function OAuthCallback() {
  const { handleOAuthCallback } = useGoogleCalendar();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      setStatus('error');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      return;
    }

    if (code) {
      handleOAuthCallback(code).then((success) => {
        if (success) {
          setStatus('success');
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          setStatus('error');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      });
    } else {
      setStatus('error');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  }, [handleOAuthCallback]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f8f9fa',
    }}>
      {status === 'loading' && (
        <>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Connecting to Google Calendar...</div>
          <div style={{ fontSize: '16px', color: '#666' }}>Please wait</div>
        </>
      )}
      {status === 'success' && (
        <>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>✓</div>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Successfully connected!</div>
          <div style={{ fontSize: '16px', color: '#666' }}>Redirecting...</div>
        </>
      )}
      {status === 'error' && (
        <>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>✗</div>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Connection failed</div>
          <div style={{ fontSize: '16px', color: '#666' }}>Redirecting back...</div>
        </>
      )}
    </div>
  );
}
