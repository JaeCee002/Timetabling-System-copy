// UserAccount.js 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; 

const UserAccount = ({ userRole = "admin" }) => {
  const navigate = useNavigate();
  const { user, logout, switchAccount } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => setShowDropdown((prev) => !prev);
  
  
  const currentUser = user || { name: "Unknown", email: "unknown@example.com", role: "guest" };

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
      
     

           
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div
          onClick={toggleDropdown}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            userSelect: 'none',
            border: 'solid',
            borderColor: '#005000',
            boxShadow: 'purple'
          }}
        >
          {currentUser?.email?.[0]?.toUpperCase() || "U"}
        </div>

        {showDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '50px',
              right: 0,
              backgroundColor: '#fff',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              borderRadius: '8px',
              overflow: 'hidden',
              zIndex: 100,
              minWidth: '180px',
            }}
          >
            <div style={{ padding: '12px 16px', fontSize: '14px', borderBottom: '1px solid #eee' }}>
              <strong>{currentUser.email}</strong>
            </div>
            <div
              onClick={handleSwitchAccount}
              onMouseOver={(e) => e.target.style.backgroundColor = '#6d9ccaff'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '14px' }}
            >
              🔄 Switch Account
            </div>
            <div
              onClick={handleLogout}
              onMouseOver={(e) => e.target.style.backgroundColor = '#6d9ccaff'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '14px' }}
            >
              🚪 Logout
            </div>
            {currentUser.role === 'admin' && (
              <div
                onClick={() => navigate("/dash")}
                onMouseOver={(e) => e.target.style.backgroundColor = '#6d9ccaff'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '14px' }}
              >
                Dashboard
              </div>
            )}
          </div>
        )}
      </div>

      
      {/* {showDropdown && (
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
          <div style={{ padding: '12px 16px', fontSize: '14px', border }}>
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
     //)}
*/}
    </div>
  );
};

export default UserAccount;