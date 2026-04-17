import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('ecom_user') || 'null'),
  token: localStorage.getItem('ecom_token') || null,
  isAuthenticated: !!localStorage.getItem('ecom_token'),

  login: (user, token) => {
    localStorage.setItem('ecom_user', JSON.stringify(user));
    localStorage.setItem('ecom_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('ecom_user');
    localStorage.removeItem('ecom_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
