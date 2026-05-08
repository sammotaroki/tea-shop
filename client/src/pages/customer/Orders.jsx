import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatPrice, getStatusColor } from '../../utils/helpers';
import Loading from '../../components/UI/Loading';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(r => { setOrders(r.data.data.orders); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Loading orders..." />;

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="font-serif text-3xl font-bold text-espresso-500 mb-8">My Orders</h1>
        {orders.length === 0 ? (
          <div className="text-center py-20 card p-8">
            <span className="text-6xl block mb-4">📦</span>
            <h3 className="font-serif text-2xl font-semibold mb-2">No orders yet</h3>
            <Link to="/shop" className="btn-primary mt-4 inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="card p-6 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="font-serif font-bold text-lg text-espresso-500">{order.orderNumber}</p>
                    <p className="text-sm text-cream-500">{new Date(order.createdAt).toLocaleDateString('en-KE', { dateStyle: 'medium' })}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={getStatusColor(order.orderStatus)}>{order.orderStatus}</span>
                    <span className={getStatusColor(order.paymentStatus)}>{order.paymentStatus}</span>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-cream-500">{item.name} ×{item.quantity}</span>
                      <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-cream-200">
                  <span className="text-lg font-bold text-primary-500">{formatPrice(order.totalAmount)}</span>
                  {order.trackingNumber && <span className="text-sm text-cream-500">Tracking: {order.trackingNumber}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Orders;
