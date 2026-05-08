import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';
import { HiOutlineTrash, HiOutlinePlus, HiOutlineMinus, HiArrowRight } from 'react-icons/hi';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <span className="text-8xl block mb-6">🛒</span>
          <h2 className="font-serif text-3xl font-bold text-espresso-500 mb-3">Your Cart is Empty</h2>
          <p className="text-cream-500 mb-6">Discover our premium tea collection and add items to your cart.</p>
          <Link to="/shop" className="btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="font-serif text-3xl font-bold text-espresso-500 mb-8">Shopping Cart ({cartCount} items)</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="card p-4 flex items-center space-x-4 animate-fade-in">
                <div className="w-20 h-20 rounded-lg bg-cream-100 flex items-center justify-center flex-shrink-0">
                  {item.images?.[0] ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover rounded-lg" /> : <span className="text-3xl">🍵</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item._id}`} className="font-serif font-semibold text-espresso-500 hover:text-primary-500 truncate block">{item.name}</Link>
                  <p className="text-sm text-cream-500">{item.weight}</p>
                  <p className="text-primary-500 font-bold mt-1">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center border border-cream-400 rounded-lg">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-2 hover:bg-cream-100"><HiOutlineMinus className="w-4 h-4" /></button>
                  <span className="px-3 font-semibold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-2 hover:bg-cream-100"><HiOutlinePlus className="w-4 h-4" /></button>
                </div>
                <p className="font-bold text-espresso-500 w-24 text-right">{formatPrice(item.price * item.quantity)}</p>
                <button onClick={() => removeFromCart(item._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><HiOutlineTrash className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
          <div className="card p-6 h-fit sticky top-24">
            <h3 className="font-serif text-xl font-bold text-espresso-500 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span className="text-cream-500">Subtotal ({cartCount} items)</span><span className="font-semibold">{formatPrice(cartTotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-cream-500">Shipping</span><span className="text-cream-500">Calculated at checkout</span></div>
              <hr className="border-cream-300" />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary-500">{formatPrice(cartTotal)}</span></div>
            </div>
            <Link to="/checkout" className="btn-primary w-full flex items-center justify-center space-x-2"><span>Proceed to Checkout</span><HiArrowRight className="w-4 h-4" /></Link>
            <Link to="/shop" className="block text-center mt-3 text-sm text-primary-500 hover:underline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Cart;
