import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { forceSeedLargeDatabase } from "../services/seedProducts";
import "./Home.css";

const FEATURED_CATEGORIES = [
  { name: "Electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80" },
  { name: "Fashion", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80" },
  { name: "Home & Living", image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&q=80" },
];

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="home-page">
      {/* ── Hero Section ── */}
      <section className="hero-section">
        <div className="hero-bg">
          <img 
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070" 
            alt="Shopping Background" 
          />
          <div className="hero-overlay" />
        </div>
        
        <div className="hero-content">
          <span className="hero-badge">Next-Gen E-Commerce</span>
          <h1 className="hero-title">
            Discover the <span>Extraordinary</span>
          </h1>
          <p className="hero-sub">
            Shop the latest trends in electronics, fashion, and home essentials. 
            Experience seamless checkout and real-time order tracking.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn-primary-large">Shop Now</Link>
            {!currentUser ? (
              <Link to="/login" className="btn-secondary-large">Login / Sign Up</Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── Featured Categories ── */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <p>Explore our curated collections</p>
        </div>
        <div className="categories-grid">
          {FEATURED_CATEGORIES.map((cat) => (
            <Link to={`/products?category=${encodeURIComponent(cat.name)}`} key={cat.name} className="category-card">
              <img src={cat.image} alt={cat.name} className="cat-img" loading="lazy" />
              <div className="cat-overlay">
                <h3>{cat.name}</h3>
                <span>Explore →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <div className="feature-item">
          <div className="feat-icon">⚡</div>
          <h3>Lightning Fast</h3>
          <p>Built on React 18 & Vite for a smooth shopping experience.</p>
        </div>
        <div className="feature-item">
          <div className="feat-icon">🛒</div>
          <h3>Persistent Cart</h3>
          <p>Your items stay in your cart, ready when you are.</p>
        </div>
        <div className="feature-item">
          <div className="feat-icon">🔐</div>
          <h3>Secure Checkout</h3>
          <p>Backed by Firebase Auth and enterprise-grade security rules.</p>
        </div>
      </section>
    </div>
  );
}
