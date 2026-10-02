/**
 * cartSlice.js – Redux Toolkit
 *
 * Global shopping cart state.
 *
 * Actions:
 *   addToCart(product)     – adds item or increments quantity
 *   removeFromCart(id)     – removes item entirely
 *   updateQuantity({id, quantity}) – set explicit quantity (0 removes item)
 *   clearCart()            – empty the cart (called after successful order)
 *
 * Selectors (exported):
 *   selectCartItems        – full items array
 *   selectCartItemCount    – total item count
 *   selectCartTotal        – total price (cents avoided — stored as float)
 *   selectIsInCart(id)     – boolean check for a product
 */

import { createSlice, createSelector } from "@reduxjs/toolkit";

// ─── Persist helpers (localStorage) ──────────────────────────────────────────

const STORAGE_KEY = "shopverse_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage quota exceeded — ignore */
  }
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: loadCart(),
  },
  reducers: {
    addToCart(state, { payload: product }) {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...product, quantity: 1 });
      }
      saveCart(state.items);
    },

    removeFromCart(state, { payload: id }) {
      state.items = state.items.filter((i) => i.id !== id);
      saveCart(state.items);
    },

    updateQuantity(state, { payload: { id, quantity } }) {
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.id !== id);
      } else {
        const item = state.items.find((i) => i.id === id);
        if (item) item.quantity = quantity;
      }
      saveCart(state.items);
    },

    clearCart(state) {
      state.items = [];
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;

// ─── Selectors ─────────────────────────────────────────────────────────────────

export const selectCartItems = (state) => state.cart.items;

export const selectCartItemCount = createSelector(
  selectCartItems,
  (items) => items.reduce((sum, i) => sum + i.quantity, 0)
);

export const selectCartTotal = createSelector(
  selectCartItems,
  (items) =>
    items.reduce((sum, i) => sum + i.price * i.quantity, 0)
);

export const selectIsInCart = (id) =>
  createSelector(selectCartItems, (items) => items.some((i) => i.id === id));
