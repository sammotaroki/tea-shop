import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatPrice, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Loading from '../../components/UI/Loading';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchOrders = () => {
    const q = filter ? `?status=${filter}` : '';
    api.get(`/orders${q}`).then(r => { setOrders(r.data.data.orders); setLoading(false); });
  };
  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (id, status) => {
    try { await api.put(`/orders/${id}/status`, { orderStatus: status }); toast.success('Status updated'); fetchOrders(); }
    catch (err) { toast.error(err.message); }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-espresso-500">Orders ({orders.length})</h1>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field w-auto text-sm">
          <option value="">All Status</option>
          <option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-cream-200 bg-cream-50"><th className="text-left py-3 px-4">Order</th><th className="text-left py-3 px-4">Customer</th><th className="text-left py-3 px-4">Date</th><th className="text-left py-3 px-4">Payment</th><th className="text-left py-3 px-4">Status</th><th className="text-right py-3 px-4">Total</th><th className="text-right py-3 px-4">Action</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id} className="border-b border-cream-100 hover:bg-cream-50">
                <td className="py-3 px-4 font-semibold">{o.orderNumber}</td>
                <td className="py-3 px-4">{o.user?.name}</td>
                <td className="py-3 px-4 text-cream-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4"><span className={getStatusColor(o.paymentStatus)}>{o.paymentStatus}</span></td>
                <td className="py-3 px-4"><span className={getStatusColor(o.orderStatus)}>{o.orderStatus}</span></td>
                <td className="py-3 px-4 text-right font-semibold">{formatPrice(o.totalAmount)}</td>
                <td className="py-3 px-4 text-right">
                  <select value={o.orderStatus} onChange={e => updateStatus(o._id, e.target.value)} className="text-xs border border-cream-300 rounded px-2 py-1">
                    <option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center py-8 text-cream-500">No orders found</p>}
      </div>
    </div>
  );
};
export default AdminOrders;
