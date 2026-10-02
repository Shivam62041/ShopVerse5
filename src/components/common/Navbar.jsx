/**
 * Navbar.jsx
 * Sticky top navigation with cart badge, user avatar dropdown, and mobile responsiveness.
 */
import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import { selectCartItemCount } from "../../store/slices/cartSlice";
import "./Navbar.css";

function CartIcon({ count }) {
  return (
    <Link to="/cart" className="nav-cart" aria-label={`Cart (${count} items)`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3A1 1 0 006 17h12M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z"/>
      </svg>
      {count > 0 && <span className="cart-badge">{count > 99 ? "99+" : count}</span>}
    </Link>
  );
}

function UserMenu({ user, userRole, logout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate("/");
  }

  return (
    <div className="user-menu-wrap" ref={menuRef}>
      <button className="avatar-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="true" aria-expanded={open}>
        {user.photoURL
          ? <img src={user.photoURL} alt={user.displayName || "User"} className="avatar-img" />
          : <span className="avatar-initials">{initials}</span>}
        <svg className={`chevron ${open ? "up" : ""}`} viewBox="0 0 20 20" fill="currentColor" width={14} height={14}>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
        </svg>
      </button>

      {open && (
        <div className="user-dropdown" role="menu">
          <div className="dropdown-header">
            <p className="dropdown-name">{user.displayName || "User"}</p>
            <p className="dropdown-email">{user.email}</p>
          </div>
          <div className="dropdown-divider" />
          {[
            { to: "/profile", label: "My Profile", icon: "👤" },
            { to: "/orders",  label: "Order History", icon: "📦" },
            ...(userRole === "admin" ? [{ to: "/admin/products", label: "Admin Panel", icon: "⚙️" }] : [])
          ].map(({ to, label, icon }) => (
            <Link key={to} to={to} className="dropdown-item" role="menuitem" onClick={() => setOpen(false)}>
              <span>{icon}</span> {label}
            </Link>
          ))}
          <div className="dropdown-divider" />
          <button className="dropdown-item danger" role="menuitem" onClick={handleLogout}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { currentUser, userRole, logout } = useAuth();
  const cartCount = useSelector(selectCartItemCount);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🛍️</span>
          <span className="logo-text">ShopVerse</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="navbar-links" aria-label="Main navigation">
          {[
            { to: "/",        label: "Home",     exact: true },
            { to: "/products",label: "Products" },
          ].map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="navbar-right">
          <CartIcon count={cartCount} />
          {currentUser
            ? <UserMenu user={currentUser} userRole={userRole} logout={logout} />
            : <Link to="/login" className="btn-login">Sign In</Link>
          }

          {/* Mobile hamburger */}
          <button className="hamburger" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          {[
            { to: "/",        label: "Home" },
            { to: "/products",label: "Products" },
            { to: "/cart",    label: `Cart (${cartCount})` },
            ...(currentUser
              ? [
                  { to: "/profile", label: "Profile" },
                  { to: "/orders", label: "Orders" },
                  ...(userRole === "admin" ? [{ to: "/admin/products", label: "Admin Panel" }] : [])
                ]
              : [{ to: "/login", label: "Sign In" }]),
          ].map(({ to, label }) => (
            <Link key={to} to={to} className="mobile-link" onClick={() => setMobileOpen(false)}>{label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
