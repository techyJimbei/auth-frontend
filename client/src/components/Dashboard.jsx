import { useState, useEffect } from 'react';

export default function Dashboard({ user: initialUser, onLogout }) {
  const [user, setUser] = useState(initialUser);
  const [isChecking, setIsChecking] = useState(false);

  // Function to fetch fresh user status from backend
  const fetchUserStatus = async () => {
    try {
      setIsChecking(true);
      const response = await fetch('http://localhost:3001/api/auth/me', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Not authenticated');
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user status:', error);
      // If unauthorized, redirect to login
      if (error.message === 'Not authenticated') {
        onLogout();
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Poll for status updates every 5 seconds
  // This ensures the dashboard updates when email is verified
  useEffect(() => {
    // Fetch immediately on mount
    fetchUserStatus();

    // Set up polling interval
    const interval = setInterval(() => {
      fetchUserStatus();
    }, 5000); // Check every 5 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Dashboard</h1>
        
        {/* Show checking indicator */}
        {isChecking && !user.isVerified && (
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span className="spinner">⟳</span>
            Checking verification status...
          </div>
        )}

        <div className="user-info">
          <p><strong>Email:</strong> {user.email}</p>
          <div className={`status ${user.isVerified ? 'verified' : 'unverified'}`}>
            {user.isVerified ? (
              <>
                <span className="icon">✓</span>
                <p>Your email is validated. You can access the portal.</p>
              </>
            ) : (
              <>
                <span className="icon">⚠</span>
                <p>You need to validate your email to access the portal.</p>
                <small>Please check your email for the verification link.</small>
                <br />
                <small style={{ fontSize: '11px', color: '#666', marginTop: '5px', display: 'block' }}>
                  This page will automatically update once you verify your email.
                </small>
              </>
            )}
          </div>
        </div>

        {/* Manual refresh button (optional) */}
        {!user.isVerified && (
          <button 
            onClick={fetchUserStatus} 
            className="refresh-btn"
            style={{
              background: '#6366f1',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '10px'
            }}
          >
            ↻ Refresh Status
          </button>
        )}

        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {/* Add CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner {
          display: inline-block;
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}