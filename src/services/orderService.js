/**
 * orderService.js
 *
 * Handles order creation and retrieval from Firestore.
 * Orders live at: users/{uid}/orders/{orderId}
 *
 * SECURITY NOTE:
 *   - Write access is allowed only when request.auth.uid == the parent uid.
 *   - Orders are created here client-side (development-friendly approach).
 *   - Production recommendation: move order creation to a Cloud Function
 *     that also processes payment confirmation from Stripe/Razorpay webhooks.
 */

import {
  collection,
  collectionGroup,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { clearCart } from "../store/slices/cartSlice";

// ─── Place a new order ────────────────────────────────────────────────────────

/**
 * placeOrder – writes an order document and clears the cart.
 *
 * @param {Array}  cartItems   – current cart items from Redux store
 * @param {number} total       – pre-calculated order total
 * @param {Object} shippingAddress – { name, line1, city, state, zip, country }
 * @param {Function} dispatch  – Redux dispatch (to clear cart after order)
 * @returns {string} orderId
 */
export async function placeOrder(cartItems, total, shippingAddress, dispatch) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User must be authenticated to place an order.");

  const ordersRef = collection(db, "users", uid, "orders");

  const orderDoc = await addDoc(ordersRef, {
    uid,
    items: cartItems.map(({ id, name, price, quantity, imageUrl }) => ({
      productId: id,
      name,
      price,
      quantity,
      imageUrl,
    })),
    total,
    shippingAddress,
    status: "pending",  // pending → processing → shipped → delivered
    createdAt: serverTimestamp(),
  });

  dispatch(clearCart());
  return orderDoc.id;
}

// ─── Fetch order history ──────────────────────────────────────────────────────

export async function fetchOrders() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User must be authenticated.");

  const q = query(
    collection(db, "users", uid, "orders"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Admin Order Operations ──────────────────────────────────────────────────

/**
 * fetchAllOrders – Fetches all orders across all users.
 * Requires a Firestore collectionGroup index on 'orders' / 'createdAt'.
 */
export async function fetchAllOrders() {
  const q = query(
    collectionGroup(db, "orders"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * updateOrderStatus – Updates the status of a specific order.
 */
export async function updateOrderStatus(uid, orderId, newStatus) {
  const orderRef = doc(db, "users", uid, "orders", orderId);
  return await updateDoc(orderRef, { status: newStatus });
}
