/**
 * store.js – Redux Toolkit store
 *
 * Combines all slices and exports typed hooks for use across the app.
 */

import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import recommendationReducer from "./slices/recommendationSlice";
import searchReducer from "./slices/searchSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    recommendations: recommendationReducer,
    search: searchReducer,
    // future slices: products, orders, ui, ...
  },
  devTools: import.meta.env.DEV,
});

export default store;
