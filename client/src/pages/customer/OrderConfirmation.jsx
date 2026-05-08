import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatPrice, getStatusColor, getImageUrl } from '../../utils/helpers';
import Loading from '../../components/UI/Loading';
import { HiCheckCircle, HiClock, HiOutlineShoppingBag } from 'react-icons/hi';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const paymentSuccess = searchParams.get('payment') === 'success';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => { setOrder(r.data.data.order); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  if (loading) return <Loading />;

  if (notFound) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold text-espresso-500 mb-4">Order not found</h2>
          <Link to="/orders" className="btn-primary">View My Orders</Link>
        </div>
      </div>
    );
  }

  const isPaid = order.paymentStatus === 'paid';
  const isMpesaPending = order.paymentMethod === 'mpesa' && !isPaid;
  const addr = order.shippingAddress;

  return (
    <div className="min-h-screen bg-cream-50 py-10">
      <div className="max-w-2xl mx-auto px-4 space-y-6">

        {/* Banner */}
        {paymentSuccess || isPaid ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-start gap-4">
            <HiCheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h1 className="font-serif text-2xl font-bold text-green-800">Order Confirmed!</h1>
              <p className="text-green-700 text-sm mt-1">
                Payment received. Your order is being prepared.
              </p>
            </div>
          </div>
        ) : isMpesaPending ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 flex items-start gap-4">
            <HiClock className="w-8 h-8 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h1 className="font-serif text-2xl font-bold text-yellow-800">Awaiting Payment</h1>
              <p className="text-yellow-700 text-sm mt-1">
                Complete the M-Pesa prompt on your phone. Your order is reserved while we wait.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-cream-100 border border-cream-300 rounded-2xl p-6">
            <h1 className="font-serif text-2xl font-bold text-espresso-500">Order Details</h1>
          </div>
        )}

        {/* Order Meta */}
        <div className="bg-white rounded-2xl shadow-tea border border-primary-100 p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-cream-500">Order Number</span>
            <span className="font-semibold text-espresso-500">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cream-500">Date</span>
            <span>{new Date(order.createdAt).toLocaleDateString('en-KE', { dateStyle: 'medium' })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cream-500">Order Status</span>
            <span className={getStatusColor(order.orderStatus)}>{order.orderStatus}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cream-500">Payment</span>
            <span className={getStatusColor(order.paymentStatus)}>{order.paymentStatus}</span>
          </div>
          {order.trackingNumber && (
            <div className="flex justify-between text-sm">
              <span className="text-cream-500">Tracking</span>
              <span className="font-semibold">{order.trackingNumber}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-tea border border-primary-100 p-6">
          <h2 className="font-serif text-lg font-bold text-espresso-500 mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                  {item.image
                    ? <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                    : <span className="w-full h-full flex items-center justify-center text-2xl">🍵</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-espresso-500 truncate">{item.name}</p>
                  <p className="text-sm text-cream-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold text-primary-500 flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <hr className="border-cream-200 my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-cream-500">Subtotal</span>
              <span>{formatPrice(order.itemsTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cream-500">Shipping ({order.shippingOption?.name})</span>
              <span>{formatPrice(order.shippingPrice)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-1">
              <span>Total</span>
              <span className="text-primary-500">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-2xl shadow-tea border border-primary-100 p-6">
          <h2 className="font-serif text-lg font-bold text-espresso-500 mb-3">Shipping Address</h2>
          <p className="text-sm text-espresso-400 leading-relaxed">
            {addr.name}<br />
            {addr.street}<br />
            {addr.city}{addr.state ? `, ${addr.state}` : ''}<br />
            {addr.country}{addr.postalCode ? ` ${addr.postalCode}` : ''}<br />
            {addr.phone}
          </p>
          {order.shippingOption?.estimatedDays && (
            <p className="text-xs text-cream-500 mt-3">
              Estimated delivery: {order.shippingOption.estimatedDays}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/orders" className="btn-primary flex items-center justify-center gap-2 flex-1">
            <HiOutlineShoppingBag className="w-5 h-5" />
            View All Orders
          </Link>
          <Link to="/shop" className="btn-secondary flex items-center justify-center flex-1">
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
