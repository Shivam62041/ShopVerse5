/**
 * useProducts.js
 * Real-time Firestore subscription hook for products.
 */
import { useState, useEffect } from "react";
import { subscribeToProducts } from "../services/productService";

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToProducts(
      (data) => { setProducts(data); setLoading(false); },
      (err)  => { setError(err.message); setLoading(false); },
      filters
    );
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category]);

  return { products, loading, error };
}
