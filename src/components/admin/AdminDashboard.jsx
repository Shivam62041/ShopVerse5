import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin (you should implement proper auth check)
  const user = useSelector(state => state.auth.user);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;

    // Fetch sales data for chart
    const fetchSalesData = () => {
      // This is a simplified example - in real app, you'd aggregate from orders
      const mockSalesData = [
        { date: '2024-01-01', sales: 1200 },
        { date: '2024-01-02', sales: 1400 },
        { date: '2024-01-03', sales: 1100 },
        { date: '2024-01-04', sales: 1600 },
        { date: '2024-01-05', sales: 1800 },
      ];
      setSalesData(mockSalesData);
    };

    // Real-time orders listener
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentOrders(orders);
    });

    // Real-time products listener
    const productsQuery = query(collection(db, 'products'));
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setLoading(false);
    });

    fetchSalesData();

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, [isAdmin]);

  const toggleStockStatus = async (productId, currentStock) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        stock: currentStock > 0 ? 0 : 10 // Toggle between 0 and 10 for demo
      });
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const updateProduct = async (productId, updates) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, updates);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  if (!isAdmin) {
    return <div className="admin-access-denied">Access Denied: Admin Only</div>;
  }

  if (loading) {
    return <div className="admin-loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>ShopVerse Admin Dashboard</h1>

      {/* Sales Chart */}
      <div className="sales-chart-section">
        <h2>Real-time Sales Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Product Inventory Manager */}
      <div className="inventory-section">
        <h2>Product Inventory Manager</h2>
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.imageUrl} alt={product.name} />
              <h3>{product.name}</h3>
              <p>Price: ${product.price}</p>
              <p>Stock: {product.stock}</p>
              <div className="product-actions">
                <button
                  onClick={() => toggleStockStatus(product.id, product.stock)}
                  className={product.stock > 0 ? 'out-of-stock-btn' : 'in-stock-btn'}
                >
                  {product.stock > 0 ? 'Mark Out of Stock' : 'Mark In Stock'}
                </button>
                <input
                  type="number"
                  placeholder="New Price"
                  onBlur={(e) => {
                    const newPrice = parseFloat(e.target.value);
                    if (newPrice > 0) {
                      updateProduct(product.id, { price: newPrice });
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="recent-orders-section">
        <h2>Recent Orders</h2>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerEmail || 'N/A'}</td>
                <td>${order.total?.toFixed(2)}</td>
                <td className={`status-${order.status}`}>{order.status}</td>
                <td>{order.createdAt?.toDate().toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;