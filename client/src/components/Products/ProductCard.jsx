import { Link } from 'react-router-dom';
import { formatPrice, truncateText, getImageUrl } from '../../utils/helpers';
import { useCart } from '../../context/CartContext';
import { HiOutlineShoppingBag, HiStar } from 'react-icons/hi';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="card group overflow-hidden animate-fade-in-up">
      {/* Image */}
      <div className="relative overflow-hidden h-56 bg-cream-100">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream-100 to-cream-200 group-hover:scale-105 transition-transform duration-500">
          {product.images && product.images[0] ? (
            <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl opacity-50">🍵</span>
          )}
        </div>
        {product.featured && (
          <span className="absolute top-3 left-3 bg-gold-400 text-espresso-500 text-xs font-bold px-3 py-1 rounded-full">
            Featured
          </span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            Low Stock
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-3 right-3 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            Sold Out
          </span>
        )}
        {/* Quick add button on hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
            disabled={product.stock === 0}
            aria-label={product.stock === 0 ? `${product.name} — sold out` : `Add ${product.name} to cart`}
            className="w-full btn-primary btn-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <HiOutlineShoppingBag className="w-4 h-4" aria-hidden="true" />
            <span>{product.stock === 0 ? 'Sold Out' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <Link to={`/product/${product._id}`} className="block p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gold-500 uppercase tracking-wider">
            {product.category?.name || 'Tea'}
          </span>
          {product.rating > 0 && (
            <div className="flex items-center space-x-1 text-gold-400">
              <HiStar className="w-4 h-4" />
              <span className="text-xs font-medium text-espresso-400">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <h3 className="font-serif text-lg font-semibold text-espresso-500 group-hover:text-primary-500 transition-colors mb-1">
          {product.name}
        </h3>
        <p className="text-cream-500 text-sm mb-3">{truncateText(product.description, 80)}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-500">{formatPrice(product.price)}</span>
          {product.weight && (
            <span className="text-xs text-cream-500 bg-cream-200 px-2 py-1 rounded">{product.weight}</span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
