import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, loginUser, registerUser, logoutUser } from '../api/auth.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await getMe();
        if (result.success) {
          setUser(result.data.user);
          setSettings(result.data.settings);
        }
      } catch (error) {
        setUser(null);
        setSettings(null);
        localStorage.removeItem('dailytrack_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const result = await loginUser({ email, password });
    if (result.success) {
      if (result.data?.token) {
        localStorage.setItem('dailytrack_token', result.data.token);
      }
      setUser(result.data.user);
      const meResult = await getMe();
      if (meResult.success) {
        setSettings(meResult.data.settings);
      }
    }
    return result;
  };

  const register = async (email, password, displayName) => {
    const result = await registerUser({ email, password, displayName });
    if (result.success) {
      if (result.data?.token) {
        localStorage.setItem('dailytrack_token', result.data.token);
      }
      setUser(result.data.user);
      const meResult = await getMe();
      if (meResult.success) {
        setSettings(meResult.data.settings);
      }
    }
    return result;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      localStorage.removeItem('dailytrack_token');
      setUser(null);
      setSettings(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, settings, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};