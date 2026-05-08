import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import { formatPrice, getStatusColor } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/UI/Loading';
import {
  HiOutlineCurrencyDollar, HiOutlineShoppingCart, HiOutlineClock,
  HiOutlineTrendingUp, HiOutlineExclamation, HiOutlinePlus, HiOutlineCube,
} from 'react-icons/hi';

const fillDailyData = (serverData) => {
  const map = Object.fromEntries(serverData.map(d => [d._id, d]));
  const result = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    result.push({
      date: d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
      revenue: map[key]?.revenue || 0,
      orders: map[key]?.orders || 0,
    });
  }
  return result;
};

const MetricCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-primary-600">{formatPrice(payload[0]?.value || 0)}</p>
      <p className="text-gray-400">{payload[1]?.value || 0} orders</p>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartMetric, setChartMetric] = useState('revenue');

  useEffect(() => {
    api.get('/orders/stats')
      .then(r => { setStats(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const chartData = fillDailyData(stats?.revenueByDay || []);
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-gray-400 mt-0.5">{new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/products" className="flex items-center gap-1.5 text-sm bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium">
            <HiOutlinePlus className="w-4 h-4" /> Add Product
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-1.5 text-sm bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            <HiOutlineShoppingCart className="w-4 h-4" /> View Orders
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={HiOutlineTrendingUp}     label="Today's Revenue"   value={formatPrice(stats?.todayRevenue || 0)}   sub={`${stats?.todayOrders || 0} orders today`}        color="bg-green-500" />
        <MetricCard icon={HiOutlineCurrencyDollar} label="Month Revenue"     value={formatPrice(stats?.monthRevenue || 0)}   sub="current month"                                    color="bg-blue-500" />
        <MetricCard icon={HiOutlineShoppingCart}   label="Total Orders"      value={stats?.totalOrders || 0}                 sub={`${stats?.pendingOrders || 0} pending`}           color="bg-purple-500" />
        <MetricCard icon={HiOutlineCurrencyDollar} label="Avg. Order Value"  value={formatPrice(stats?.avgOrderValue || 0)}  sub="per paid order"                                   color="bg-amber-500" />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-gray-900">Sales Overview</h2>
            <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {['revenue', 'orders'].map(m => (
              <button key={m} onClick={() => setChartMetric(m)}
                className={`px-3 py-1.5 capitalize font-medium transition-colors ${chartMetric === m ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#1B4332" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1B4332" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
              tickFormatter={v => chartMetric === 'revenue' ? `${(v/1000).toFixed(0)}k` : v} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey={chartMetric} stroke="#1B4332" strokeWidth={2} fill="url(#colorGrad)" dot={false} activeDot={{ r: 4, fill: '#1B4332' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary-600 font-medium hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-50">
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wide">Order</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-right py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wide">Amount</th>
              </tr></thead>
              <tbody>
                {stats?.recentOrders?.map(o => (
                  <tr key={o._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-6 font-semibold text-gray-800">{o.orderNumber}</td>
                    <td className="py-3 px-4 text-gray-600">{o.user?.name || 'Guest'}</td>
                    <td className="py-3 px-4"><span className={getStatusColor(o.orderStatus)}>{o.orderStatus}</span></td>
                    <td className="py-3 px-6 text-right font-semibold text-gray-800">{formatPrice(o.totalAmount)}</td>
                  </tr>
                ))}
                {!stats?.recentOrders?.length && (
                  <tr><td colSpan={4} className="py-10 text-center text-gray-400">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Low Stock */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <HiOutlineExclamation className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Low Stock</h2>
            </div>
            <div className="p-3 space-y-1">
              {stats?.lowStockProducts?.length ? stats.lowStockProducts.map(p => (
                <div key={p._id} className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <HiOutlineCube className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate max-w-[140px]">{p.name}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {p.stock === 0 ? 'Out' : `${p.stock} left`}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-gray-400 text-center py-4">All products well-stocked</p>
              )}
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Orders by Status</h2>
            <div className="space-y-2">
              {stats?.ordersByStatus?.map(s => (
                <div key={s._id} className="flex items-center justify-between">
                  <span className={getStatusColor(s._id)}>{s._id}</span>
                  <span className="text-sm font-semibold text-gray-700">{s.count}</span>
                </div>
              ))}
              {!stats?.ordersByStatus?.length && <p className="text-sm text-gray-400">No data</p>}
            </div>
          </div>

        </div>
      </div>

      {/* Top Products */}
      {stats?.topProducts?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Top Products by Revenue</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {stats.topProducts.map((p, i) => {
                const maxRev = stats.topProducts[0].revenue;
                return (
                  <div key={p._id} className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-300 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 truncate">{p.name}</span>
                        <span className="text-sm font-semibold text-gray-900 ml-4">{formatPrice(p.revenue)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(p.revenue / maxRev) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 w-16 text-right">{p.units} units</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
