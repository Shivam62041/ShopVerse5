import React from "react";
import { Link } from "react-router-dom";

const stub = (title, emoji, desc) => () => (
  <div style={{ minHeight:"100vh", display:"grid", placeItems:"center", background:"#0a0a0f", fontFamily:"Inter,sans-serif", padding:"2rem" }}>
    <div style={{ textAlign:"center", maxWidth:480 }}>
      <div style={{ fontSize:"4rem", marginBottom:"1rem" }}>{emoji}</div>
      <h1 style={{ fontSize:"2rem", fontWeight:800, color:"#f0f0f5", marginBottom:"0.75rem" }}>{title}</h1>
      <p style={{ color:"rgba(255,255,255,0.45)", marginBottom:"2rem" }}>{desc}</p>
      <Link to="/" style={{ padding:"0.65rem 1.5rem", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", borderRadius:"0.6rem", fontWeight:700, textDecoration:"none" }}>← Back to Home</Link>
    </div>
  </div>
);

export const Products     = stub("Products",      "🛍️",  "Real-time Firestore product listings go here.");
export const ProductDetail= stub("Product Detail","📦",  "Full product page with image gallery and add-to-cart.");
export const Cart         = stub("Shopping Cart", "🛒",  "Redux-powered cart with quantity controls.");
export const Checkout     = stub("Checkout",      "💳",  "🔒 Protected — multi-step checkout with address and payment.");
export const Profile      = stub("My Profile",    "👤",  "🔒 Protected — user details and account settings.");
export const Orders       = stub("Order History", "📋",  "🔒 Protected — full order history from Firestore.");
export const NotFound     = stub("404 Not Found", "🔍",  "The page you are looking for does not exist.");
