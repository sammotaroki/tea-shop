import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Loading from '../../components/UI/Loading';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ name: user?.name || '', phone: '', street: '', city: '', state: '', country: 'Kenya', postalCode: '' });

  useEffect(() => {
    if (cartItems.length === 0) navigate('/cart');
    api.get('/shipping').then(r => { setShipping(r.data.data.options); if (r.data.data.options.length > 0) setSelectedShipping(r.data.data.options[0]._id); });
  }, []);

  const shippingPrice = shipping.find(s => s._id === selectedShipping)?.price || 0;
  const total = cartTotal + shippingPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(i => ({ product: i._id, quantity: i.quantity })),
        shippingAddress: address,
        shippingOption: selectedShipping,
        paymentMethod,
      };
      const { data } = await api.post('/orders', orderData);
      const order = data.data.order;

      if (paymentMethod === 'stripe') {
        const { data: pd } = await api.post('/payments/stripe/create-session', { orderId: order._id });
        clearCart();
        window.location.href = pd.data.url;
      } else {
        await api.post('/payments/mpesa/stkpush', { phone: mpesaPhone, orderId: order._id });
        clearCart();
        toast.success('M-Pesa payment request sent! Check your phone.');
        navigate(`/order/${order._id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Checkout failed');
    } finally { setLoading(false); }
  };

  if (cartItems.length === 0) return <Loading />;

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="font-serif text-3xl font-bold text-espresso-500 mb-8">Checkout</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="card p-6">
              <h3 className="font-serif text-xl font-bold text-espresso-500 mb-4">Shipping Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Full Name</label><input value={address.name} onChange={e => setAddress({...address, name: e.target.value})} required className="input-field" /></div>
                <div><label className="label">Phone</label><input value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} required className="input-field" placeholder="+254..." /></div>
                <div className="sm:col-span-2"><label className="label">Street Address</label><input value={address.street} onChange={e => setAddress({...address, street: e.target.value})} required className="input-field" /></div>
                <div><label className="label">City</label><input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} required className="input-field" /></div>
                <div><label className="label">State/County</label><input value={address.state} onChange={e => setAddress({...address, state: e.target.value})} required className="input-field" /></div>
                <div><label className="label">Country</label><input value={address.country} onChange={e => setAddress({...address, country: e.target.value})} required className="input-field" /></div>
                <div><label className="label">Postal Code</label><input value={address.postalCode} onChange={e => setAddress({...address, postalCode: e.target.value})} required className="input-field" /></div>
              </div>
            </div>
            {/* Shipping */}
            <div className="card p-6">
              <h3 className="font-serif text-xl font-bold text-espresso-500 mb-4">Shipping Method</h3>
              <div className="space-y-3">
                {shipping.map(s => (
                  <label key={s._id} className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedShipping === s._id ? 'border-primary-500 bg-primary-500/5' : 'border-cream-300 hover:border-cream-400'}`}>
                    <div className="flex items-center space-x-3">
                      <input type="radio" name="shipping" value={s._id} checked={selectedShipping === s._id} onChange={() => setSelectedShipping(s._id)} className="text-primary-500" />
                      <div><p className="font-semibold text-espresso-500">{s.name}</p><p className="text-sm text-cream-500">{s.estimatedDays}</p></div>
                    </div>
                    <span className="font-bold text-primary-500">{formatPrice(s.price)}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Payment */}
            <div className="card p-6">
              <h3 className="font-serif text-xl font-bold text-espresso-500 mb-4">Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-primary-500 bg-primary-500/5' : 'border-cream-300'}`}>
                  <input type="radio" name="payment" value="stripe" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} />
                  <div><p className="font-semibold">💳 Credit/Debit Card</p><p className="text-xs text-cream-500">Visa, Mastercard via Stripe</p></div>
                </label>
                <label className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'mpesa' ? 'border-primary-500 bg-primary-500/5' : 'border-cream-300'}`}>
                  <input type="radio" name="payment" value="mpesa" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} />
                  <div><p className="font-semibold">📱 M-Pesa</p><p className="text-xs text-cream-500">Pay via Safaricom M-Pesa</p></div>
                </label>
              </div>
              {paymentMethod === 'mpesa' && (
                <div className="mt-4"><label className="label">M-Pesa Phone Number</label><input value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)} placeholder="0712345678" required className="input-field" /></div>
              )}
            </div>
          </div>
          {/* Summary */}
          <div className="card p-6 h-fit sticky top-24">
            <h3 className="font-serif text-xl font-bold text-espresso-500 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {cartItems.map(i => <div key={i._id} className="flex justify-between text-sm"><span className="text-cream-500 truncate mr-2">{i.name} ×{i.quantity}</span><span className="font-semibold">{formatPrice(i.price * i.quantity)}</span></div>)}
            </div>
            <hr className="border-cream-300 my-3" />
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm"><span className="text-cream-500">Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-cream-500">Shipping</span><span>{formatPrice(shippingPrice)}</span></div>
              <hr className="border-cream-300" />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary-500">{formatPrice(total)}</span></div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-4">{loading ? 'Processing...' : `Pay ${formatPrice(total)}`}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Checkout;
