import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    size: string;
    quantity: number;
    image: string;
}

interface CartStore {
    isOpen: boolean;
    items: CartItem[];
    toggleCart: () => void;
    addItem: (item: CartItem) => void;
    removeItem: (id: string, size: string) => void;
    updateQuantity: (id: string, size: string, quantity: number) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            isOpen: false,
            items: [],
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            addItem: (item) =>
                set((state) => {
                    const existing = state.items.find(
                        (i) => i.id === item.id && i.size === item.size
                    );
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.id === item.id && i.size === item.size
                                    ? { ...i, quantity: i.quantity + item.quantity }
                                    : i
                            ),
                            isOpen: true,
                        };
                    }
                    return { items: [...state.items, item], isOpen: true };
                }),
            removeItem: (id, size) =>
                set((state) => ({
                    items: state.items.filter((i) => !(i.id === id && i.size === size)),
                })),
            updateQuantity: (id, size, quantity) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id && i.size === size ? { ...i, quantity } : i
                    ),
                })),
            clearCart: () => set({ items: [] }),
        }),
        { name: 'axis-cart' }
    )
);
