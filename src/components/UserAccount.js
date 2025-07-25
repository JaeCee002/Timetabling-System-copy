// UserAccount.js 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; 

const UserAccount = ({ userRole = "admin" }) => {
  const navigate = useNavigate();
  const { user, logout, switchAccount } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const currentUser = userRole === "admin"
    ? { name: "Administrator", email: "admin@example.com", role: "admin" }
    : { name: "User", email: "user@example.com", role: "user" };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.user-account-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
    navigate('/');
  };

  const handleSwitchAccount = async () => {
    setShowDropdown(false);
    await switchAccount();
    navigate('/');
  };

  return (
    <div className="user-account-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 16px',
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minWidth: '200px',
        }}
      >
        <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
          {user?.name || "User"}
        </div>
        <span style={{
          fontSize: '10px',
          color: 'white',
          backgroundColor: user?.role === 'admin' ? '#dc3545' : '#28a745',
          padding: '2px 6px',
          borderRadius: '12px',
          fontWeight: 'bold',
        }}>
          {user?.role?.toUpperCase() || userRole?.toUpperCase()}
        </span>
      </div>
        <span style={{ fontSize: '12px', color: '#666' }}>▼</span>
      </div>
      
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          marginTop: '4px',
        }}>
          <div style={{ padding: '12px 16px', fontSize: '14px' }}>
            <strong>{currentUser.email}</strong>
          </div>
          <div style={{ height: '1px', backgroundColor: '#eee' }}></div>
          <div
            onClick={handleSwitchAccount}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            🔄 Switch Account
          </div>
          <div
            onClick={handleLogout}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            🚪 Logout
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccount;