import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'verify'
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [pendingEmail, setPendingEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await login(form.email, form.password);
        toast.success(`Welcome back, ${user.name}!`);
        navigate(user.role === 'admin' ? '/admin' : '/');
      } else {
        const result = await register(form);
        setPendingEmail(result.email);
        setMode('verify');
        toast.success('Check your email for a 6-digit verification code.');
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await verifyEmail(pendingEmail, code);
      toast.success(`Welcome to Chai Heritage, ${user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification(pendingEmail);
      toast.success('New code sent — check your email.');
    } catch (err) {
      toast.error(err.message || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🍵</span>
          {mode === 'verify' ? (
            <>
              <h2 className="font-serif text-3xl font-bold text-espresso-500">Check your email</h2>
              <p className="text-cream-500 mt-2">We sent a 6-digit code to <span className="font-medium text-espresso-500">{pendingEmail}</span></p>
            </>
          ) : (
            <>
              <h2 className="font-serif text-3xl font-bold text-espresso-500">{mode === 'login' ? 'Welcome Back' : 'Join Us'}</h2>
              <p className="text-cream-500 mt-2">{mode === 'login' ? 'Sign in to your account' : 'Create your Chai Heritage account'}</p>
            </>
          )}
        </div>

        <div className="card p-8">
          {mode === 'verify' ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="label">Verification Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  placeholder="123456"
                  className="input-field text-center text-2xl tracking-widest font-bold"
                  autoFocus
                />
              </div>
              <button type="submit" disabled={loading || code.length !== 6} className="btn-primary w-full py-3">
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
              <p className="text-center text-sm text-cream-500">
                Didn't receive it?{' '}
                <button type="button" onClick={handleResend} className="text-primary-500 font-semibold hover:underline">
                  Resend code
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="label">Full Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="input-field" placeholder="John Doe" />
                </div>
              )}
              <div>
                <label className="label">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="input-field" placeholder="you@example.com" />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={8} className="input-field" placeholder="••••••••" />
              </div>
              {mode === 'register' && (
                <>
                  <div>
                    <label className="label">Phone <span className="text-cream-400 font-normal">(optional)</span></label>
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" placeholder="+254..." />
                  </div>
                  <p className="text-xs text-cream-500">Password must contain uppercase, lowercase, number, and special character.</p>
                </>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          )}

          {mode !== 'verify' && (
            <p className="text-center mt-6 text-sm text-cream-500">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-primary-500 font-semibold hover:underline"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
