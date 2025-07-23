// AuthContext.js - Create this new file
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginFromAPI, logout as logoutFromAPI } from "../api/timetableAPI.js";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // const [user, setUser] = useState(null);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const checkSession = async () => {
  //     try {
  //       setLoading(false);
  //     } catch (error) {
  //       setLoading(false);
  //     }
  //   };

  //   checkSession();
  // }, []);

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("user");
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = async (email, password) => {
    const result = await loginFromAPI(email, password);
    console.log(result);

    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      
      localStorage.setItem("user", JSON.stringify(result.user));
      return {
        success: true,
        user: result.user,
        route: result.user.role === "admin" ? "/adminCalendar" : "/userCalendar"
      };
    }

      // const route = result.user.role === "admin" 
      //     ? "/adminCalendar" 
      //     : "/userCalendar";
        
      //   return {
      //     success: true,
      //     user: result.user,
      //     route
      //   };
      // }

    return {
      success: false,
      error: result.error || "Invalid credentials"
    };
  };

  const logout = async () => {
    await logoutFromAPI(); // Call your logout API
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  const switchAccount = async () => {
    await logout();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
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