import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";

import store from "./store/store";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Navbar from "./components/common/Navbar";

// ── Pages ────────────────────────────────────────────────────────────────────
import Home     from "./pages/Home";
import Products from "./pages/Products";
import Cart     from "./pages/Cart";
import Login    from "./components/auth/Login";

import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";

import AdminRoute from "./components/auth/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";

// Stub pages
import { NotFound } from "./pages/stubs";

function PageLoader() {
  return (
    <div className="centered-spinner" aria-busy="true">
      <span className="spinner" />
    </div>
  );
}

// Layout wrapper that adds the Navbar above all pages
function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Login (no Navbar) ──────────────────────────────────── */}
              <Route path="/login" element={<Login />} />

              {/* ── All other pages (with Navbar) ─────────────────────── */}
              <Route element={<Layout />}>
                {/* Public */}
                <Route path="/"             element={<Home />} />
                <Route path="/products"     element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart"         element={<Cart />} />

                {/* Protected */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/profile"  element={<Profile />} />
                  <Route path="/orders"   element={<Orders />} />
                </Route>

                {/* Admin Only */}
                <Route path="/admin" element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="products" replace />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                  </Route>
                </Route>

                {/* Fallbacks */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*"    element={<Navigate to="/404" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ReduxProvider>
  );
}
