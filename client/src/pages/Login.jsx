import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { Mail, Lock, AlertCircle, Sparkles, Sprout, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please provide a valid email address';
    }
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back to KisanGPT!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Invalid credentials. Try rajesh@example.com', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123'); // any password matches in mock
  };

  return (
    <div className="min-h-[80vh] flex flex-col md:flex-row rounded-3xl border border-border overflow-hidden bg-card text-foreground shadow-xl max-w-5xl mx-auto my-6">
      {/* Left Banner */}
      <div className="flex-1 bg-gradient-to-tr from-primary to-emerald-700 p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
        
        <div className="space-y-3 relative z-10">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Earthy Intelligence for Farmers</h2>
          <p className="text-white/80 text-sm max-w-sm leading-relaxed">
            Access customized risk predictions, and coordinate multiple agricultural agents to shield your harvest.
          </p>
        </div>

        <div className="space-y-6 pt-12 md:pt-0 relative z-10">
          <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
            <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-3">Quick Demo Access</p>
            <div className="space-y-2.5">
              <button
                onClick={() => handleFillDemo('rajesh@example.com')}
                className="w-full text-xs font-bold bg-white text-primary px-4 py-2.5 rounded-xl hover:bg-neutral-50 transition-all flex justify-between items-center"
              >
                <span>Login as Rajesh (Wheat Farmer)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleFillDemo('anil@example.com')}
                className="w-full text-xs font-bold bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-xl hover:bg-white/20 transition-all flex justify-between items-center"
              >
                <span>Login as Anil (Grape Farmer)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-xs text-white/60">&copy; KisanGPT AI Agent Network.</p>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 p-10 md:p-12 flex flex-col justify-center bg-card">
        <div className="space-y-2 mb-8 text-left">
          <h3 className="text-2xl font-bold tracking-tight">Sign In</h3>
          <p className="text-sm text-muted-foreground">Welcome back! Please enter your details below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="farmer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                  errors.email ? 'border-red-500 ring-red-500' : 'border-border'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                  errors.password ? 'border-red-500 ring-red-500' : 'border-border'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
            />
            <label htmlFor="remember" className="ml-2 text-xs font-semibold text-muted-foreground">
              Remember me on this device
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-opacity-95 transition-all shadow-md flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
        </div>


        <p className="mt-8 text-center text-xs text-muted-foreground font-semibold">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-bold">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
