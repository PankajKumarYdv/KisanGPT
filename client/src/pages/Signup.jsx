import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { User, Mail, Phone, Lock, AlertCircle, CheckCircle, Languages, Sprout, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [language, setLanguage] = useState('en');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!fullName.trim()) {
      tempErrors.fullName = 'Full name is required';
    } else if (fullName.length < 2) {
      tempErrors.fullName = 'Name must be at least 2 characters';
    }
    
    if (!email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Invalid email address';
    }

    if (!phone) {
      tempErrors.phone = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(phone.replace('+91', '').trim())) {
      tempErrors.phone = 'Please enter a valid 10-digit Indian phone number';
    }

    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      tempErrors.password = 'Must contain at least 1 uppercase, 1 lowercase, and 1 number';
    }

    if (confirmPassword !== password) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      tempErrors.agreeTerms = 'You must agree to the Terms of Service';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await signup(fullName, email, phone, password, 'farmer');
      addToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Registration failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto my-6 p-8 md:p-10 bg-card border border-border rounded-3xl shadow-xl text-foreground text-left">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex w-10 h-10 bg-primary/10 rounded-xl items-center justify-center border border-primary/20 text-primary mb-2">
          <Sprout className="w-5 h-5" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight">Create your Account</h2>
        <p className="text-sm text-muted-foreground">Register your farm profile to access AI risk models.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Rajesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                  errors.fullName ? 'border-red-500 ring-red-500' : 'border-border'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
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
                className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Mobile Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground text-sm font-bold">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                  errors.phone ? 'border-red-500 ring-red-500' : 'border-border'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Preferred Language */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Preferred Language</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Languages className="w-4 h-4" />
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="pb">ਪੰਜਾਬੀ (Punjabi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
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
              <p className="text-xs text-red-500 flex items-center gap-1 leading-tight">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                  errors.confirmPassword ? 'border-red-500 ring-red-500' : 'border-border'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="space-y-1">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-primary border-border rounded focus:ring-primary"
            />
            <label htmlFor="terms" className="ml-2.5 text-xs text-muted-foreground leading-relaxed">
              I agree to the KisanGPT{' '}
              <a href="#terms" className="text-primary hover:underline font-bold">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" className="text-primary hover:underline font-bold">
                Privacy Policy
              </a>
              .
            </label>
          </div>
          {errors.agreeTerms && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.agreeTerms}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-opacity-95 shadow-md flex justify-center items-center gap-2 mt-4"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-muted-foreground font-semibold">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline font-bold">
          Log in here
        </Link>
      </p>
    </div>
  );
}
