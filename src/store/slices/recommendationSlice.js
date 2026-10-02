/**
 * recommendationSlice.js – Redux Toolkit
 *
 * AI-Based Product Recommendation Engine
 *
 * Features:
 * - Tracks user browsing history and gravity preferences
 * - Implements collaborative filtering for product recommendations
 * - Suggests products based on viewed items and user preferences
 *
 * Actions:
 *   addToHistory(product)      – adds product to browsing history
 *   setGravityPreference(pref) – sets user's gravity preference level
 *   generateRecommendations()  – calculates and updates recommendations
 *   clearHistory()             – clears browsing history
 *
 * Selectors:
 *   selectRecommendations      – current recommended products
 *   selectBrowsingHistory      – user's browsing history
 *   selectGravityPreference    – user's gravity preference
 */

import { createSlice, createSelector } from "@reduxjs/toolkit";

// ─── Persist helpers (localStorage) ──────────────────────────────────────────

const HISTORY_KEY = "shopverse_browsing_history";
const PREFERENCE_KEY = "shopverse_gravity_preference";

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* storage quota exceeded — ignore */
  }
}

function loadPreference() {
  try {
    return localStorage.getItem(PREFERENCE_KEY) || 'neutral';
  } catch {
    return 'neutral';
  }
}

function savePreference(preference) {
  try {
    localStorage.setItem(PREFERENCE_KEY, preference);
  } catch {
    /* storage quota exceeded — ignore */
  }
}

// ─── Recommendation Logic ────────────────────────────────────────────────────

// Simple collaborative filtering based on product categories and gravity levels
const RECOMMENDATION_RULES = {
  'Levitation Belts': ['Magnetic Anchors', 'Gravity Boots', 'Hover Pads'],
  'Gravity Boots': ['Levitation Belts', 'Anti-Gravity Harnesses', 'Float Spheres'],
  'Hover Boards': ['Magnetic Anchors', 'Gravity Boots', 'Levitation Belts'],
  'Magnetic Anchors': ['Levitation Belts', 'Hover Boards', 'Float Spheres'],
  'Anti-Gravity Harnesses': ['Gravity Boots', 'Magnetic Anchors', 'Hover Pads'],
  'Float Spheres': ['Levitation Belts', 'Hover Boards', 'Anti-Gravity Harnesses']
};

const GRAVITY_PREFERENCES = {
  'low': ['Float Spheres', 'Hover Pads', 'Levitation Belts'],
  'medium': ['Hover Boards', 'Gravity Boots', 'Magnetic Anchors'],
  'high': ['Anti-Gravity Harnesses', 'Magnetic Anchors', 'Gravity Boots'],
  'neutral': ['Levitation Belts', 'Hover Boards', 'Gravity Boots']
};

function buildRecommendations(history, preference, allProducts) {
  const recommendations = new Set();
  const viewedCategories = new Set(history.map(item => item.category));

  // Add recommendations based on browsing history
  history.forEach(item => {
    const related = RECOMMENDATION_RULES[item.name] || [];
    related.forEach(product => recommendations.add(product));
  });

  // Add recommendations based on gravity preference
  const prefRecommendations = GRAVITY_PREFERENCES[preference] || [];
  prefRecommendations.forEach(product => recommendations.add(product));

  // Filter to available products and limit to 6 recommendations
  return allProducts
    .filter(product => recommendations.has(product.name))
    .slice(0, 6);
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const recommendationSlice = createSlice({
  name: "recommendations",
  initialState: {
    history: loadHistory(),
    gravityPreference: loadPreference(),
    recommendations: [],
    allProducts: [] // This should be populated from Firestore
  },
  reducers: {
    addToHistory(state, { payload: product }) {
      // Avoid duplicates in recent history
      const existingIndex = state.history.findIndex(item => item.id === product.id);
      if (existingIndex >= 0) {
        state.history.splice(existingIndex, 1);
      }

      // Keep only last 10 items
      state.history.unshift(product);
      if (state.history.length > 10) {
        state.history = state.history.slice(0, 10);
      }

      saveHistory(state.history);
    },

    setGravityPreference(state, { payload: preference }) {
      state.gravityPreference = preference;
      savePreference(preference);
    },

    setAllProducts(state, { payload: products }) {
      state.allProducts = products;
    },

    generateRecommendations(state) {
      state.recommendations = buildRecommendations(
        state.history,
        state.gravityPreference,
        state.allProducts
      );
    },

    clearHistory(state) {
      state.history = [];
      localStorage.removeItem(HISTORY_KEY);
    },
  },
});

export const {
  addToHistory,
  setGravityPreference,
  setAllProducts,
  generateRecommendations,
  clearHistory
} = recommendationSlice.actions;

export default recommendationSlice.reducer;

// ─── Selectors ─────────────────────────────────────────────────────────────────

export const selectBrowsingHistory = (state) => state.recommendations.history;

export const selectGravityPreference = (state) => state.recommendations.gravityPreference;

export const selectRecommendations = (state) => state.recommendations.recommendations;

export const selectRecommendationCount = createSelector(
  selectRecommendations,
  (recommendations) => recommendations.length
);