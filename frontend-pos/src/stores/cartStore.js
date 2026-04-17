import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  customer: null,
  discount: 0,

  addItem: (product, quantity = 1) => {
    const { items } = get();
    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      set({ items: items.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i) });
    } else {
      set({ items: [...items, { ...product, quantity }] });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.id !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      set({ items: get().items.filter((i) => i.id !== productId) });
    } else {
      set({ items: get().items.map((i) => i.id === productId ? { ...i, quantity } : i) });
    }
  },

  setCustomer: (customer) => set({ customer }),

  setDiscount: (discount) => set({ discount: parseFloat(discount) || 0 }),

  clearCart: () => set({ items: [], customer: null, discount: 0 }),

  getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  getTotal: () => Math.max(0, get().getSubtotal() - get().discount),
  getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));

export default useCartStore;
