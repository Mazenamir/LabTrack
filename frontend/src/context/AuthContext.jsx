import { createContext, useState, useContext } from 'react';

// 1. Create the Context
export const AuthContext = createContext();

// 2. Create the Custom Hook (This is what DoctorDashboard calls!)
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // This safety net prevents the cryptic "cannot destructure" error
  if (context === undefined) {
    throw new Error("❌ useAuth is returning undefined! Make sure your App.jsx routes are wrapped in <AuthProvider>");
  }
  
  return context;
};

// 3. Create the Provider
export const AuthProvider = ({ children }) => {
  // I also added a tiny fix here so you don't get logged out when you refresh the page!
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token); 
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};