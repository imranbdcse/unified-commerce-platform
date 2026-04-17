import { create } from 'zustand';

const useSellerStore = create((set) => ({
  currentSeller: JSON.parse(sessionStorage.getItem('current_seller') || 'null'),

  setSeller: (seller) => {
    sessionStorage.setItem('current_seller', JSON.stringify(seller));
    set({ currentSeller: seller });
  },

  clearSeller: () => {
    sessionStorage.removeItem('current_seller');
    set({ currentSeller: null });
  },
}));

export default useSellerStore;
