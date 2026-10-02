/**
 * searchSlice.js – Redux Toolkit
 *
 * Smart Search & Filter System
 *
 * Features:
 * - As-you-type search with suggestions
 * - Multi-category filters (Gravity Level, Price, Battery Life)
 * - Persistent filter state across page refreshes
 * - High-performance search with debouncing
 *
 * Actions:
 *   setSearchQuery(query)      – updates search query
 *   setFilters(filters)        – updates filter criteria
 *   clearFilters()             – resets all filters
 *   setSuggestions(suggestions) – updates search suggestions
 *
 * Selectors:
 *   selectSearchQuery          – current search query
 *   selectFilters              – current filter state
 *   selectFilteredProducts     – products matching current search/filters
 *   selectSearchSuggestions    – current search suggestions
 */

import { createSlice, createSelector } from "@reduxjs/toolkit";

// ─── Persist helpers (localStorage) ──────────────────────────────────────────

const FILTERS_KEY = "shopverse_filters";

function loadFilters() {
  try {
    const raw = localStorage.getItem(FILTERS_KEY);
    return raw ? JSON.parse(raw) : {
      gravityLevel: [],
      priceRange: [0, 1000],
      batteryLife: [],
      categories: []
    };
  } catch {
    return {
      gravityLevel: [],
      priceRange: [0, 1000],
      batteryLife: [],
      categories: []
    };
  }
}

function saveFilters(filters) {
  try {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  } catch {
    /* storage quota exceeded — ignore */
  }
}

// ─── Search and Filter Logic ─────────────────────────────────────────────────

function matchesSearch(product, query) {
  if (!query) return true;

  const searchTerm = query.toLowerCase();
  return (
    product.name.toLowerCase().includes(searchTerm) ||
    product.description?.toLowerCase().includes(searchTerm) ||
    product.category?.toLowerCase().includes(searchTerm)
  );
}

function matchesFilters(product, filters) {
  // Gravity Level filter
  if (filters.gravityLevel.length > 0) {
    if (!filters.gravityLevel.includes(product.gravityLevel)) return false;
  }

  // Price Range filter
  if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
    return false;
  }

  // Battery Life filter
  if (filters.batteryLife.length > 0) {
    if (!filters.batteryLife.includes(product.batteryLife)) return false;
  }

  // Categories filter
  if (filters.categories.length > 0) {
    if (!filters.categories.includes(product.category)) return false;
  }

  return true;
}

function generateSuggestions(products, query) {
  if (!query || query.length < 2) return [];

  const suggestions = new Set();
  const searchTerm = query.toLowerCase();

  products.forEach(product => {
    // Add matching product names
    if (product.name.toLowerCase().includes(searchTerm)) {
      suggestions.add(product.name);
    }

    // Add matching categories
    if (product.category?.toLowerCase().includes(searchTerm)) {
      suggestions.add(product.category);
    }

    // Add matching keywords from description
    if (product.description) {
      const words = product.description.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.includes(searchTerm) && word.length > 3) {
          suggestions.add(word);
        }
      });
    }
  });

  return Array.from(suggestions).slice(0, 8); // Limit to 8 suggestions
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const searchSlice = createSlice({
  name: "search",
  initialState: {
    query: "",
    filters: loadFilters(),
    suggestions: [],
    allProducts: [], // This should be populated from Firestore
    isSearching: false
  },
  reducers: {
    setSearchQuery(state, { payload: query }) {
      state.query = query;
      state.suggestions = generateSuggestions(state.allProducts, query);
    },

    setFilters(state, { payload: filters }) {
      state.filters = { ...state.filters, ...filters };
      saveFilters(state.filters);
    },

    clearFilters(state) {
      state.filters = {
        gravityLevel: [],
        priceRange: [0, 1000],
        batteryLife: [],
        categories: []
      };
      localStorage.removeItem(FILTERS_KEY);
    },

    setAllProducts(state, { payload: products }) {
      state.allProducts = products;
      // Regenerate suggestions if there's a current query
      if (state.query) {
        state.suggestions = generateSuggestions(products, state.query);
      }
    },

    setSuggestions(state, { payload: suggestions }) {
      state.suggestions = suggestions;
    },

    setSearching(state, { payload: isSearching }) {
      state.isSearching = isSearching;
    },
  },
});

export const {
  setSearchQuery,
  setFilters,
  clearFilters,
  setAllProducts,
  setSuggestions,
  setSearching
} = searchSlice.actions;

export default searchSlice.reducer;

// ─── Selectors ─────────────────────────────────────────────────────────────────

export const selectSearchQuery = (state) => state.search.query;

export const selectFilters = (state) => state.search.filters;

export const selectSearchSuggestions = (state) => state.search.suggestions;

export const selectIsSearching = (state) => state.search.isSearching;

export const selectFilteredProducts = createSelector(
  (state) => state.search.allProducts,
  selectSearchQuery,
  selectFilters,
  (products, query, filters) => {
    return products.filter(product =>
      matchesSearch(product, query) && matchesFilters(product, filters)
    );
  }
);

export const selectFilterCount = createSelector(
  selectFilters,
  (filters) => {
    let count = 0;
    if (filters.gravityLevel.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
    if (filters.batteryLife.length > 0) count++;
    if (filters.categories.length > 0) count++;
    return count;
  }
);