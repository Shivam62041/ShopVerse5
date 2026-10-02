import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { debounce } from 'lodash';
import {
  setSearchQuery,
  setFilters,
  clearFilters,
  selectSearchQuery,
  selectFilters,
  selectSearchSuggestions,
  selectFilteredProducts,
  selectFilterCount
} from '../../store/slices/searchSlice';

const SmartSearch = ({ onResultsChange }) => {
  const dispatch = useDispatch();
  const query = useSelector(selectSearchQuery);
  const filters = useSelector(selectFilters);
  const suggestions = useSelector(selectSearchSuggestions);
  const filteredProducts = useSelector(selectFilteredProducts);
  const filterCount = useSelector(selectFilterCount);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search to avoid excessive updates
  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      dispatch(setSearchQuery(searchQuery));
    }, 300),
    [dispatch]
  );

  const handleQueryChange = (e) => {
    const value = e.target.value;
    debouncedSearch(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion) => {
    dispatch(setSearchQuery(suggestion));
    setShowSuggestions(false);
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(setFilters({ [filterType]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  // Notify parent component of results changes
  useEffect(() => {
    onResultsChange && onResultsChange(filteredProducts);
  }, [filteredProducts, onResultsChange]);

  return (
    <div className="smart-search">
      {/* Search Input */}
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search anti-gravity products..."
          defaultValue={query}
          onChange={handleQueryChange}
          onFocus={() => setShowSuggestions(query.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="search-input"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`filter-toggle ${filterCount > 0 ? 'active' : ''}`}
        >
          Filters {filterCount > 0 && `(${filterCount})`}
        </button>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filter Products</h3>
            <button onClick={handleClearFilters} className="clear-filters-btn">
              Clear All
            </button>
          </div>

          {/* Gravity Level Filter */}
          <div className="filter-group">
            <label>Newton-reduction Level</label>
            <div className="checkbox-group">
              {['Low', 'Medium', 'High'].map(level => (
                <label key={level} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.gravityLevel.includes(level)}
                    onChange={(e) => {
                      const newLevels = e.target.checked
                        ? [...filters.gravityLevel, level]
                        : filters.gravityLevel.filter(l => l !== level);
                      handleFilterChange('gravityLevel', newLevels);
                    }}
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <label>Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}</label>
            <div className="price-range">
              <input
                type="range"
                min="0"
                max="2000"
                value={filters.priceRange[0]}
                onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                className="price-slider"
              />
              <input
                type="range"
                min="0"
                max="2000"
                value={filters.priceRange[1]}
                onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                className="price-slider"
              />
            </div>
          </div>

          {/* Battery Life Filter */}
          <div className="filter-group">
            <label>Battery Life</label>
            <div className="checkbox-group">
              {['2-4 hours', '4-8 hours', '8+ hours'].map(life => (
                <label key={life} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.batteryLife.includes(life)}
                    onChange={(e) => {
                      const newLife = e.target.checked
                        ? [...filters.batteryLife, life]
                        : filters.batteryLife.filter(l => l !== life);
                      handleFilterChange('batteryLife', newLife);
                    }}
                  />
                  {life}
                </label>
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          <div className="filter-group">
            <label>Categories</label>
            <div className="checkbox-group">
              {['Levitation Belts', 'Gravity Boots', 'Hover Boards', 'Magnetic Anchors', 'Anti-Gravity Harnesses', 'Float Spheres'].map(category => (
                <label key={category} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...filters.categories, category]
                        : filters.categories.filter(c => c !== category);
                      handleFilterChange('categories', newCategories);
                    }}
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="search-results-summary">
        Found {filteredProducts.length} products
        {query && ` for "${query}"`}
        {filterCount > 0 && ` with ${filterCount} filter${filterCount > 1 ? 's' : ''} applied`}
      </div>
    </div>
  );
};

export default SmartSearch;