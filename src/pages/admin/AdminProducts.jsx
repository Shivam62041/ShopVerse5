/**
 * AdminProducts.jsx
 *
 * Admin view to list, add, edit, and delete products.
 */
import React, { useState, useEffect } from "react";
import { useProducts } from "../../hooks/useProducts";
import { createProduct, updateProduct, deleteProduct } from "../../services/productService";
import { forceSeedLargeDatabase } from "../../services/seedProducts";
import "./AdminProducts.css";

const INITIAL_FORM = {
  name: "",
  category: "Electronics",
  price: "",
  originalPrice: "",
  stock: "",
  imageUrl: "",
  description: "",
};

const CATEGORIES = ["Electronics", "Fashion", "Home & Living", "Sports", "Books"];

export default function AdminProducts() {
  const { products, loading, error } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  async function handleSeed() {
    if (!window.confirm("WARNING: This will DELETE all existing products and generate 250 new unique products. Are you sure?")) return;
    setSubmitting(true);
    try {
      await forceSeedLargeDatabase();
      alert("✅ 250 unique products successfully seeded! Please refresh the page if they don't appear instantly.");
    } catch (err) {
      alert("Failed to seed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function openNew() {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setActionError(null);
    setIsModalOpen(true);
  }

  function openEdit(prod) {
    setEditingId(prod.id);
    setFormData({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice || "",
      stock: prod.stock,
      imageUrl: prod.imageUrl,
      description: prod.description || "",
    });
    setActionError(null);
    setIsModalOpen(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
      stock: parseInt(formData.stock, 10),
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-products">
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Products</h1>
          <p className="ap-sub">Manage your catalog, pricing, and inventory.</p>
        </div>
        <div>
          <button 
            className="btn-add-product" 
            style={{ background: '#f59e0b', marginRight: '1rem' }} 
            onClick={handleSeed}
            disabled={submitting}
          >
            {submitting ? "Seeding..." : "🌱 Seed 250 Products"}
          </button>
          <button className="btn-add-product" onClick={openNew}>
            + Add Product
          </button>
        </div>
      </div>

      {error && <div className="ap-error">{error}</div>}

      <div className="ap-table-wrap">
        <table className="ap-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="ap-loading">Loading products…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="5" className="ap-empty">No products found.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="ap-td-product">
                      <img src={p.imageUrl} alt={p.name} className="ap-td-img" />
                      <span className="ap-td-name" title={p.name}>{p.name}</span>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td>₹{p.price.toFixed(2)}</td>
                  <td>
                    <span className={`ap-stock ${p.stock === 0 ? "out" : p.stock < 10 ? "low" : ""}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="btn-icon edit" onClick={() => openEdit(p)}>✏️</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(p.id)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="ap-modal-overlay">
          <div className="ap-modal">
            <div className="ap-modal-header">
              <h2>{editingId ? "Edit Product" : "Add Product"}</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="ap-form">
              {actionError && <div className="ap-error">{actionError}</div>}

              <div className="ap-field">
                <label>Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="ap-row">
                <div className="ap-field">
                  <label>Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="ap-field">
                  <label>Stock</label>
                  <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>

              <div className="ap-row">
                <div className="ap-field">
                  <label>Price (₹)</label>
                  <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="ap-field">
                  <label>Original Price (Optional)</label>
                  <input type="number" step="0.01" min="0" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} />
                </div>
              </div>

              <div className="ap-field">
                <label>Image URL</label>
                <input required type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              </div>

              <div className="ap-field">
                <label>Description</label>
                <textarea rows="3" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="ap-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-save" disabled={submitting}>
                  {submitting ? "Saving…" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
