import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/UI/Loading';
import toast from 'react-hot-toast';
import { HiStar, HiOutlinePlus, HiOutlineMinus } from 'react-icons/hi';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = () =>
    api.get(`/products/${id}`)
      .then(r => { setProduct(r.data.data.product); setLoading(false); })
      .catch(() => setLoading(false));

  useEffect(() => { fetchProduct(); }, [id]);

  const hasReviewed = user && product?.reviews?.some(r => r.user === user._id);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      await fetchProduct();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loading />;
  if (!product) return <div className="text-center py-20"><h2 className="font-serif text-2xl">Product not found</h2></div>;

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="card overflow-hidden">
            <div className="h-96 lg:h-[500px] bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center">
              {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" /> : <span className="text-8xl opacity-40">🍵</span>}
            </div>
          </div>
          {/* Info */}
          <div className="animate-fade-in-up">
            <span className="text-sm font-medium text-gold-500 uppercase tracking-wider">{product.category?.name}</span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-espresso-500 mt-2 mb-4">{product.name}</h1>
            {product.rating > 0 && <div className="flex items-center space-x-2 mb-4"><div className="flex text-gold-400">{[...Array(5)].map((_, i) => <HiStar key={i} className={`w-5 h-5 ${i < Math.round(product.rating) ? 'text-gold-400' : 'text-cream-300'}`} />)}</div><span className="text-sm text-cream-500">({product.numReviews} reviews)</span></div>}
            <p className="text-3xl font-bold text-primary-500 mb-6">{formatPrice(product.price)}</p>
            <p className="text-espresso-400 leading-relaxed mb-6">{product.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {product.weight && <div className="bg-cream-100 rounded-lg p-3"><span className="text-xs text-cream-500 block">Weight</span><span className="font-semibold text-espresso-500">{product.weight}</span></div>}
              {product.origin && <div className="bg-cream-100 rounded-lg p-3"><span className="text-xs text-cream-500 block">Origin</span><span className="font-semibold text-espresso-500">{product.origin}</span></div>}
            </div>

            {product.brewingInstructions && (
              <div className="bg-primary-500/5 border border-primary-500/20 rounded-lg p-4 mb-6">
                <h4 className="font-serif font-semibold text-primary-500 mb-2">☕ Brewing Instructions</h4>
                <p className="text-sm text-espresso-400">{product.brewingInstructions}</p>
              </div>
            )}

            <div className="flex items-center space-x-4 mb-6">
              <span className="label">Quantity:</span>
              <div className="flex items-center border border-cream-400 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-cream-100"><HiOutlineMinus className="w-4 h-4" /></button>
                <span className="px-4 font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3 hover:bg-cream-100"><HiOutlinePlus className="w-4 h-4" /></button>
              </div>
              <span className="text-sm text-cream-500">{product.stock} in stock</span>
            </div>

            <button onClick={() => addToCart(product, quantity)} disabled={product.stock === 0} className="btn-primary w-full text-lg py-4">
              {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="font-serif text-2xl font-bold text-espresso-500 mb-6">
            Customer Reviews {product.numReviews > 0 && <span className="text-base font-normal text-cream-500">({product.numReviews})</span>}
          </h2>

          {product.reviews?.length > 0 ? (
            <div className="space-y-4 mb-8">
              {product.reviews.map((review, idx) => (
                <div key={idx} className="card p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-espresso-500">{review.name}</p>
                      <p className="text-xs text-cream-500">{new Date(review.createdAt).toLocaleDateString('en-KE', { dateStyle: 'medium' })}</p>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <HiStar key={i} className={`w-4 h-4 ${i < review.rating ? 'text-gold-400' : 'text-cream-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-espresso-400 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-cream-500 mb-8">No reviews yet. Be the first to share your thoughts!</p>
          )}

          {user ? (
            hasReviewed ? (
              <p className="text-sm text-cream-500 italic">You have already reviewed this product.</p>
            ) : (
              <div className="card p-6 max-w-xl">
                <h3 className="font-serif text-lg font-bold text-espresso-500 mb-4">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="label">Your Rating</label>
                    <div className="flex space-x-1 mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                          <HiStar className={`w-8 h-8 transition-colors ${star <= reviewForm.rating ? 'text-gold-400' : 'text-cream-300 hover:text-gold-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">Comment</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      required
                      rows={3}
                      placeholder="Share your experience with this tea..."
                      className="input-field"
                    />
                  </div>
                  <button type="submit" disabled={submittingReview} className="btn-primary btn-sm">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )
          ) : (
            <div className="card p-6 max-w-xl text-center">
              <p className="text-cream-500 text-sm">
                <Link to="/login" className="text-primary-500 font-medium hover:underline">Sign in</Link> to leave a review.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductDetail;
