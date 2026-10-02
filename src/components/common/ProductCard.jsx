/**
 * ProductCard.jsx
 * Animated product card with add-to-cart feedback.
 */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, selectIsInCart } from "../../store/slices/cartSlice";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const inCart = useSelector(selectIsInCart(product.id));
  const [animating, setAnimating] = useState(false);

  function handleAddToCart(e) {
    e.preventDefault(); // don't navigate
    if (animating) return;
    dispatch(addToCart(product));
    setAnimating(true);
    setTimeout(() => setAnimating(false), 1200);
  }

  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="card-image-wrap">
        {discountPct && <span className="discount-badge">-{discountPct}%</span>}
        {product.stock === 0 && <span className="oos-badge">Out of Stock</span>}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="card-image"
          loading="lazy"
        />
        <div className="card-overlay">
          <span className="overlay-text">View Details</span>
        </div>
      </Link>

      <div className="card-body">
        <span className="card-category">{product.category}</span>
        <Link to={`/products/${product.id}`} className="card-title">{product.name}</Link>

        <div className="card-pricing">
          <span className="card-price">₹{product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="card-original">₹{product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        {product.rating && (
          <div className="card-rating">
            {[1,2,3,4,5].map(s => (
              <svg key={s} viewBox="0 0 20 20" width={12} height={12}
                fill={s <= Math.round(product.rating) ? "#fbbf24" : "rgba(255,255,255,0.15)"}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
            <span className="rating-count">({product.reviewCount ?? 0})</span>
          </div>
        )}

        <button
          className={`add-to-cart-btn ${inCart ? "in-cart" : ""} ${animating ? "pop" : ""}`}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          aria-label={inCart ? "Added to cart" : "Add to cart"}
        >
          {animating ? (
            <span className="btn-feedback">✓ Added!</span>
          ) : inCart ? (
            <><CartIcon /> In Cart</>
          ) : (
            <><CartPlusIcon /> Add to Cart</>
          )}
        </button>
      </div>
    </article>
  );
}

function CartPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3A1 1 0 006 17h12M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z"/>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15}>
      <path d="M9 22c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm11 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zM1 1h2l2.7 10.59L7 16h12l2-9H5L3.27 1H1z"/>
    </svg>
  );
}
