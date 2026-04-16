import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('pos_user') || 'null'),
  token: localStorage.getItem('pos_token') || null,
  isAuthenticated: !!localStorage.getItem('pos_token'),

  login: (user, token) => {
    localStorage.setItem('pos_user', JSON.stringify(user));
    localStorage.setItem('pos_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('pos_user');
    localStorage.removeItem('pos_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
