import { create } from 'zustand';

const CART_KEY = 'ecom_cart';
const savedCart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

const useCartStore = create((set, get) => ({
  items: savedCart,

  addItem: (product, quantity = 1) => {
    const { items } = get();
    const existing = items.find((i) => i.id === product.id);
    const updated = existing
      ? items.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
      : [...items, { ...product, quantity }];
    localStorage.setItem(CART_KEY, JSON.stringify(updated));
    set({ items: updated });
  },

  removeItem: (productId) => {
    const updated = get().items.filter((i) => i.id !== productId);
    localStorage.setItem(CART_KEY, JSON.stringify(updated));
    set({ items: updated });
  },

  updateQuantity: (productId, quantity) => {
    const updated = quantity <= 0
      ? get().items.filter((i) => i.id !== productId)
      : get().items.map((i) => i.id === productId ? { ...i, quantity } : i);
    localStorage.setItem(CART_KEY, JSON.stringify(updated));
    set({ items: updated });
  },

  clearCart: () => {
    localStorage.removeItem(CART_KEY);
    set({ items: [] });
  },

  getTotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
  getCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
}));

export default useCartStore;
