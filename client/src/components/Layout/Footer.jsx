import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';

const Footer = () => {
  return (
    <footer className="bg-primary-500 text-cream-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <span className="text-3xl">🍵</span>
              <span className="font-serif text-2xl font-bold text-white">Chai Heritage</span>
            </Link>
            <p className="text-cream-300 text-sm leading-relaxed">
              Crafting premium tea experiences since tradition met innovation. From Kenya's lush highlands to your cup.
            </p>
            <div className="flex space-x-4 mt-6">
              {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                <span key={social} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-cream-300 cursor-default">
                  <span className="text-xs uppercase font-bold">{social[0].toUpperCase()}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Shop All Teas', to: '/shop' },
                { label: 'Black Tea', to: '/shop?category=black-tea' },
                { label: 'Green Tea', to: '/shop?category=green-tea' },
                { label: 'Chai Blends', to: '/shop?category=chai-blends' },
                { label: 'Gift Sets', to: '/shop?category=gift-sets' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-cream-300 hover:text-gold-400 transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Customer Care</h4>
            <ul className="space-y-2">
              <li><Link to="/orders" className="text-cream-300 hover:text-gold-400 transition-colors text-sm">Track Your Order</Link></li>
              <li><Link to="/contact" className="text-cream-300 hover:text-gold-400 transition-colors text-sm">FAQ</Link></li>
              <li><Link to="/contact" className="text-cream-300 hover:text-gold-400 transition-colors text-sm">Shipping Policy</Link></li>
              <li><Link to="/contact" className="text-cream-300 hover:text-gold-400 transition-colors text-sm">Returns &amp; Refunds</Link></li>
              <li><Link to="/contact" className="text-cream-300 hover:text-gold-400 transition-colors text-sm">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Get In Touch</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <HiOutlineLocationMarker className="w-5 h-5 text-gold-400 mt-0.5 flex-shrink-0" />
                <p className="text-cream-300 text-sm">Tea Lane, Kericho County<br />Nairobi, Kenya</p>
              </div>
              <div className="flex items-center space-x-3">
                <HiOutlinePhone className="w-5 h-5 text-gold-400 flex-shrink-0" />
                <p className="text-cream-300 text-sm">+254 700 000 000</p>
              </div>
              <div className="flex items-center space-x-3">
                <HiOutlineMail className="w-5 h-5 text-gold-400 flex-shrink-0" />
                <p className="text-cream-300 text-sm">hello@chaiheritage.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Bottom Bar */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-cream-400 text-sm">&copy; {new Date().getFullYear()} Chai Heritage. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <span className="text-cream-400 text-xs">We Accept:</span>
              <div className="flex space-x-2">
                {['Visa', 'M-Pesa', 'Mastercard'].map((method) => (
                  <span key={method} className="bg-white/10 px-3 py-1 rounded text-xs text-cream-200">{method}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
