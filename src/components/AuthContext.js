// AuthContext.js - Create this new file
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginFromAPI } from "../api/timetableAPI.js";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const login = async (email, password) => {
    const result = await loginFromAPI(email, password);
    console.log(result);

    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);

      const route = result.user.role === "admin" 
          ? "/adminCalendar" 
          : "/userCalendar";
        
        return {
          success: true,
          user: result.user,
          route
        };
    }

    return {
      success: false,
      error: result.error || "Invalid credentials"
    };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const switchAccount = () => {
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    loading,
    switchAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};