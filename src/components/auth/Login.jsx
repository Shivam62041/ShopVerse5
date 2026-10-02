/**
 * Login.jsx
 *
 * Tabbed Login / Sign-Up component.
 * – Email + Password (login & register)
 * – Google OAuth (one-click)
 * – Inline error handling with friendly messages
 * – Redirects to /dashboard on success (or the `from` location)
 */

import React, { useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

// ─── Sub-components ───────────────────────────────────────────────────────────

function GoogleButton({ onClick, loading }) {
  return (
    <button
      type="button"
      className="btn btn-google"
      onClick={onClick}
      disabled={loading}
      aria-label="Continue with Google"
    >
      <img
        src="/assets/google-icon.svg"
        alt=""
        aria-hidden="true"
        width={20}
        height={20}
      />
      {loading ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}

function Divider() {
  return (
    <div className="divider" aria-hidden="true">
      <span>or</span>
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="error-banner" role="alert">
      <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-4.75a.75.75 0 001.5 0v-4.5a.75.75 0 00-1.5 0v4.5zm.75-7a.75.75 0 100 1.5.75.75 0 000-1.5z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Login() {
  const { login, loginWithGoogle, signup, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect back to the page the user tried to visit (protected route)
  const from = location.state?.from?.pathname ?? "/";

  // Tab state: "login" | "register"
  const [tab, setTab] = useState("login");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Form refs (uncontrolled for perf)
  const emailRef = useRef();
  const passwordRef = useRef();
  const nameRef = useRef();
  const confirmRef = useRef();

  // ── Tab switch resets errors ───────────────────────────────────────────────

  function switchTab(t) {
    setTab(t);
    setAuthError(null);
  }

  // ── Email / Password submit ────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();
    setAuthError(null);

    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value;

    if (tab === "register") {
      const name = nameRef.current.value.trim();
      const confirm = confirmRef.current.value;

      if (!name) return setAuthError("Please enter your full name.");
      if (password !== confirm)
        return setAuthError("Passwords do not match.");
      if (password.length < 6)
        return setAuthError("Password must be at least 6 characters.");

      try {
        setSubmitting(true);
        await signup(email, password, name);
        navigate(from, { replace: true });
      } catch {
        /* authError is set inside signup() */
      } finally {
        setSubmitting(false);
      }
    } else {
      try {
        setSubmitting(true);
        await login(email, password);
        navigate(from, { replace: true });
      } catch {
        /* authError is set inside login() */
      } finally {
        setSubmitting(false);
      }
    }
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────

  async function handleGoogle() {
    setAuthError(null);
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch {
      /* authError is set inside loginWithGoogle() */
    } finally {
      setGoogleLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <img src="/assets/logo.svg" alt="ShopVerse" height={40} />
        </div>

        <h1 className="auth-title">
          {tab === "login" ? "Welcome back" : "Create your account"}
        </h1>

        {/* Tab switcher */}
        <div className="auth-tabs" role="tablist">
          {["login", "register"].map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`auth-tab ${tab === t ? "active" : ""}`}
              onClick={() => switchTab(t)}
            >
              {t === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Google button always visible */}
        <GoogleButton onClick={handleGoogle} loading={googleLoading} />
        <Divider />

        {/* Error banner */}
        <ErrorBanner message={authError} />

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {tab === "register" && (
            <div className="form-group">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                ref={nameRef}
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              ref={emailRef}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              ref={passwordRef}
              type="password"
              autoComplete={
                tab === "login" ? "current-password" : "new-password"
              }
              placeholder="••••••••"
              required
            />
          </div>

          {tab === "register" && (
            <div className="form-group">
              <label htmlFor="auth-confirm">Confirm Password</label>
              <input
                id="auth-confirm"
                ref={confirmRef}
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {tab === "login" && (
            <div className="forgot-row">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting
              ? "Please wait…"
              : tab === "login"
              ? "Log In"
              : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          {tab === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                className="link-btn"
                onClick={() => switchTab("register")}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="link-btn"
                onClick={() => switchTab("login")}
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
