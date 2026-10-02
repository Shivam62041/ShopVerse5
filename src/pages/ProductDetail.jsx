/**
 * ProductDetail.jsx — Single product view with image gallery, details, and add-to-cart
 */
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, selectIsInCart } from "../store/slices/cartSlice";
import { fetchProductById } from "../services/productService";
import "./ProductDetail.css";

function SkeletonDetail() {
  return (
    <div className="pd-page">
      <div className="pd-layout">
        <div className="pd-image-col shimmer" style={{ borderRadius: '1rem' }} />
        <div className="pd-info-col">
          <div className="skel-line medium shimmer" />
          <div className="skel-line wide shimmer" style={{ height: '2rem', marginTop: '1rem' }} />
          <div className="skel-line short shimmer" style={{ height: '1.5rem', marginTop: '1rem' }} />
          <div className="skel-btn shimmer" style={{ marginTop: '2rem' }} />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animating, setAnimating] = useState(false);

  const inCart = useSelector(selectIsInCart(id));

  useEffect(() => {
    setLoading(true);
    fetchProductById(id)
      .then(setProduct)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleAddToCart() {
    if (animating || !product) return;
    dispatch(addToCart(product));
    setAnimating(true);
    setTimeout(() => setAnimating(false), 1200);
  }

  if (loading) return <SkeletonDetail />;

  if (error || !product) {
    return (
      <div className="pd-error-page">
        <div className="pd-error-icon">🔍</div>
        <h1 className="pd-error-title">Product Not Found</h1>
        <p className="pd-error-msg">{error || "The product you're looking for doesn't exist or has been removed."}</p>
        <Link to="/products" className="pd-btn-back">← Back to Products</Link>
      </div>
    );
  }

  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="pd-page">
      <div className="pd-breadcrumbs">
        <Link to="/">Home</Link>
        <span className="separator">/</span>
        <Link to="/products">Products</Link>
        <span className="separator">/</span>
        <span className="current">{product.name}</span>
      </div>

      <div className="pd-layout">
        {/* Image Gallery */}
        <div className="pd-image-col">
          <div className="pd-main-image-wrap">
            {discountPct && <span className="pd-discount-badge">-{discountPct}%</span>}
            {product.stock === 0 && <span className="pd-oos-badge">Out of Stock</span>}
            <img src={product.imageUrl} alt={product.name} className="pd-main-image" />
          </div>
        </div>

        {/* Product Info */}
        <div className="pd-info-col">
          <p className="pd-category">{product.category}</p>
          <h1 className="pd-title">{product.name}</h1>
          
          {product.rating && (
            <div className="pd-rating">
              <div className="stars">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} viewBox="0 0 20 20" width={16} height={16}
                    fill={s <= Math.round(product.rating) ? "#fbbf24" : "rgba(255,255,255,0.15)"}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="rating-text">{product.rating} ({product.reviewCount} reviews)</span>
            </div>
          )}

          <div className="pd-pricing">
            <span className="pd-price">₹{product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="pd-original">₹{product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <p className="pd-desc">{product.description}</p>

          <div className="pd-stock-info">
            {product.stock > 0 ? (
              <span className="in-stock">
                <span className="dot" /> {product.stock} in stock
              </span>
            ) : (
              <span className="out-of-stock">Currently unavailable</span>
            )}
          </div>

          <button
            className={`pd-add-btn ${inCart ? "in-cart" : ""} ${animating ? "pop" : ""}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {animating ? (
              "✓ Added to Cart"
            ) : inCart ? (
              "Already in Cart — Add Another"
            ) : (
              "Add to Cart"
            )}
          </button>

          <div className="pd-features">
            <div className="feature">
              <span className="f-icon">🚚</span>
              <div>
                <p className="f-title">Free Shipping</p>
                <p className="f-sub">On orders over ₹50</p>
              </div>
            </div>
            <div className="feature">
              <span className="f-icon">🛡️</span>
              <div>
                <p className="f-title">2 Year Warranty</p>
                <p className="f-sub">Full protection included</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
