import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    size: string;
    quantity: number;
    image: string;
    color?: string;
}

interface CartStore {
    isOpen: boolean;
    items: CartItem[];
    toggleCart: () => void;
    addItem: (item: CartItem) => void;
    removeItem: (id: string, size: string, color?: string) => void;
    updateQuantity: (id: string, size: string, color: string | undefined, quantity: number) => void;
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
                        (i) => i.id === item.id && i.size === item.size && i.color === item.color
                    );
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.id === item.id && i.size === item.size && i.color === item.color
                                    ? { ...i, quantity: i.quantity + item.quantity }
                                    : i
                            ),
                            isOpen: true,
                        };
                    }
                    return { items: [...state.items, item], isOpen: true };
                }),
            removeItem: (id, size, color) =>
                set((state) => ({
                    items: state.items.filter((i) => !(i.id === id && i.size === size && i.color === color)),
                })),
            updateQuantity: (id, size, color, quantity) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id && i.size === size && i.color === color ? { ...i, quantity } : i
                    ),
                })),
            clearCart: () => set({ items: [] }),
        }),
        { name: 'axis-cart' }
    )
);
