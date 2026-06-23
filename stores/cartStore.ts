import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

interface CartStore {
  items: CartItem[];
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotal: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  total: 0,
  
  addItem: (item) => {
    const { items } = get();
    const existingItem = items.find(i => i.id === item.id);
    
    if (existingItem) {
      set({
        items: items.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      });
    } else {
      set({
        items: [...items, { ...item, quantity: 1 }]
      });
    }
    get().calculateTotal();
  },
  
  removeItem: (id) => {
    set({
      items: get().items.filter(item => item.id !== id)
    });
    get().calculateTotal();
  },
  
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    
    set({
      items: get().items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    });
    get().calculateTotal();
  },
  
  clearCart: () => {
    set({ items: [], total: 0 });
  },
  
  calculateTotal: () => {
    const total = get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    set({ total });
  },
}));