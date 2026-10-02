/**
 * productService.js
 *
 * All Firestore operations for the products collection.
 * Write operations are secured by firestore.rules and only accessible to admins.
 */

import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const PRODUCTS_COLLECTION = "products";

// ─── Fetch all products (one-time) ───────────────────────────────────────────

export async function fetchProducts({ category, maxPrice, sortBy = "createdAt", pageSize = 20 } = {}) {
  let q = collection(db, PRODUCTS_COLLECTION);
  const constraints = [limit(pageSize)];

  if (category) constraints.push(where("category", "==", category));
  if (maxPrice) constraints.push(where("price", "<=", maxPrice));

  // Only apply orderBy if we aren't filtering by category/price to avoid composite index requirements
  if (!category && !maxPrice) {
    constraints.push(orderBy(sortBy, "desc"));
  }

  const snap = await getDocs(query(q, ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Fetch single product ────────────────────────────────────────────────────

export async function fetchProductById(id) {
  const snap = await getDoc(doc(db, PRODUCTS_COLLECTION, id));
  if (!snap.exists()) throw new Error(`Product ${id} not found`);
  return { id: snap.id, ...snap.data() };
}

// ─── Real-time subscription ──────────────────────────────────────────────────

/**
 * subscribeToProducts – calls onChange whenever the products collection changes.
 * Returns an unsubscribe function (call in useEffect cleanup).
 */
export function subscribeToProducts(onChange, onError, { category } = {}) {
  let q = collection(db, PRODUCTS_COLLECTION);
  const constraints = [];
  
  if (category) {
    constraints.push(where("category", "==", category));
  } else {
    // Only sort when not filtering to avoid requiring a Firestore composite index
    constraints.push(orderBy("createdAt", "desc"));
  }

  return onSnapshot(
    query(q, ...constraints),
    (snap) => {
      const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onChange(products);
    },
    onError
  );
}

// ─── Admin Write Operations ──────────────────────────────────────────────────

export async function createProduct(data) {
  return await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateProduct(id, data) {
  return await updateDoc(doc(db, PRODUCTS_COLLECTION, id), data);
}

export async function deleteProduct(id) {
  return await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
}
