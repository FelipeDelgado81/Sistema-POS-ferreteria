import { useState, useEffect } from 'react';
import { loginRequest } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      const response = await loginRequest(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login', { replace: true });
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
