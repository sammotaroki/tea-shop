import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const getCartFromStorage = () => {
  try {
    const cart = localStorage.getItem('chai-heritage-cart');
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(getCartFromStorage);

  useEffect(() => {
    localStorage.setItem('chai-heritage-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      const currentQty = existing ? existing.quantity : 0;

      if (product.stock === 0) {
        toast.error(`${product.name} is out of stock`);
        return prev;
      }

      if (product.stock !== undefined && currentQty >= product.stock) {
        toast.error(`Only ${product.stock} in stock for ${product.name}`);
        return prev;
      }

      const safeQty = product.stock !== undefined
        ? Math.min(quantity, product.stock - currentQty)
        : quantity;

      if (existing) {
        toast.success(`Updated quantity for ${product.name}`);
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + safeQty }
            : item
        );
      }
      toast.success(`${product.name} added to cart`);
      return [...prev, { ...product, quantity: safeQty }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCartItems((prev) =>
      prev.map((item) => {
        if (item._id !== productId) return item;
        const capped = item.stock !== undefined ? Math.min(quantity, item.stock) : quantity;
        return { ...item, quantity: capped };
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('chai-heritage-cart');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
