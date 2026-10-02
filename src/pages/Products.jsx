/**
 * Products.jsx — Real-time product grid with category filters.
 */
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/common/ProductCard";
import { useProducts } from "../hooks/useProducts";
import { seedProductsIfEmpty } from "../services/seedProducts";
import "./Products.css";

const CATEGORIES = ["All", "Electronics", "Fashion", "Home & Living", "Sports", "Books"];

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-img shimmer" />
      <div className="skeleton-body">
        <div className="skeleton-line short shimmer" />
        <div className="skeleton-line shimmer" />
        <div className="skeleton-line medium shimmer" />
        <div className="skeleton-btn shimmer" />
      </div>
    </div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");
  
  const [activeCategory, setActiveCategory] = useState(() => {
    return urlCategory && CATEGORIES.includes(urlCategory) ? urlCategory : "All";
  });
  const [search, setSearch] = useState("");

  // Keep state in sync if URL changes (e.g., back button)
  useEffect(() => {
    if (urlCategory && CATEGORIES.includes(urlCategory)) {
      setActiveCategory(urlCategory);
    } else if (!urlCategory) {
      setActiveCategory("All");
    }
  }, [urlCategory]);

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    if (cat === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const filters = activeCategory !== "All" ? { category: activeCategory } : {};
  const { products, loading, error } = useProducts(filters);

  // Seed on first load if Firestore is empty
  useEffect(() => { seedProductsIfEmpty(); }, []);

  const filtered = products.filter((p) =>
    search === "" || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-header">
        <div>
          <h1 className="products-title">All Products</h1>
          <p className="products-sub">
            {loading ? "Loading…" : `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Search */}
        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
            <path fillRule="evenodd" d="M9 3a6 6 0 100 12A6 6 0 009 3zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd"/>
          </svg>
          <input
            type="search"
            className="search-input"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs" role="tablist">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            className={`cat-tab ${activeCategory === cat ? "active" : ""}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="products-error">
          ⚠️ {error}
        </div>
      )}

      {/* Grid */}
      <div className="products-grid">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.length === 0
          ? (
            <div className="empty-state">
              <p className="empty-emoji">🔍</p>
              <p className="empty-title">No products found</p>
              <p className="empty-sub">Try adjusting your search or category filter.</p>
            </div>
          )
          : filtered.map((p) => <ProductCard key={p.id} product={p} />)
        }
      </div>
    </div>
  );
}
