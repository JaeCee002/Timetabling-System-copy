// AuthContext.js - Create this new file
import React, { createContext, useContext, useState } from 'react';

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

  const login = (email, password) => {
    if (email === "admin@example.com" && password === "admin123") {
      const userData = {
        email: "admin@example.com",
        role: "admin",
        name: "Administrator"
      };
      setUser(userData);
      return { success: true, user: userData, route: "/adminCalendar" };
    } else if (email === "user@example.com" && password === "user123") {
      const userData = {
        email: "user@example.com",
        role: "user",
        name: "User"
      };
      setUser(userData);
      return { success: true, user: userData, route: "/userCalendar" };
    }
    return { success: false };
  };

  const logout = () => {
    setUser(null);
  };

  const switchAccount = () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    switchAccount,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};