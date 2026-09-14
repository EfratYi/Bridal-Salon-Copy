import React, { useState, useEffect, useCallback } from 'react';
import '../css/public.css';
import Order from '../Components/Order';
import SearchOptions from '../Components/SearchOptions';
import EditingOrder from '../Components/EditingOrder';
import { getData, postNewObject, updateObject, deleteObject } from '../../Fetch';
import '../css/order.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [ordersFilter, setOrdersFilter] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getData('orders');
      const list = Array.isArray(data) ? data : (data ? [data] : []);
      setOrders(list);
      setOrdersFilter(list);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to load orders');
      setOrders([]);
      setOrdersFilter([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleCreateOrder = async (order, client) => {
    setModalOpen(false);
    setLoading(true);
    try {
      // Create order on server
      const created = await postNewObject('orders', order);
      // If client needs update, do it
      if (client && order.clientId) {
        try { await updateObject('clients', order.clientId, client); } catch (e) { console.error('Failed to update client after order creation', e); }
      }
      // Refresh list from server to keep consistent state
      await loadOrders();
      return created;
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteObject('orders', orderId);
      // update local state
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setOrdersFilter(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      console.error('Failed to delete order', err);
      alert('Failed to delete order');
    }
  };

  return (
    <>
      <h2 className="orders-title">כל ההזמנות</h2>
      <button type="button" onClick={() => setModalOpen(true)} disabled={loading}>
        הזמנה חדשה
      </button>
      {isModalOpen && (
        <EditingOrder 
          handleSubmit={handleCreateOrder}
          handleClose={() => setModalOpen(false)}
        />
      )}

      <SearchOptions setListFilter={setOrdersFilter} list={orders} />

      {loading && <p>Loading orders...</p>}
      {error && <p className="error">{error}</p>}

      <div className="orders-container">
        {ordersFilter.length === 0 && !loading ? (
          <p>לא נמצאו הזמנות</p>
        ) : (
          ordersFilter.map((order) => (
            <Order 
              key={order.id}
              order={order}
              onDelete={handleDeleteOrder}
            />
          ))
        )}
      </div>
    </>
  );
};

export default Orders;
