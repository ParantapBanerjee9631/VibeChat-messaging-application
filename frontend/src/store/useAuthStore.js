import { create } from 'zustand';
import api from '../api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  error: null,
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { username, password });
      const { token, ...userData } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, token, isLoading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', isLoading: false });
      return false;
    }
  },

  register: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { username, password });
      const { token, ...userData } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, token, isLoading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration failed', isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  }
}));

export default useAuthStore;
