import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setSuccess(true);
      addToast('Recovery instructions dispatched!', 'success');
    } catch (err) {
      setError(err.message || 'Error occurred');
      addToast(err.message || 'Error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-12 p-8 md:p-10 bg-card border border-border rounded-3xl shadow-xl text-foreground text-left">
      <div className="mb-6">
        <Link to="/login" className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
      </div>

      {!success ? (
        <>
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight">Forgot Password?</h2>
            <p className="text-sm text-muted-foreground">
              Enter your registered email address and we'll dispatch a link to reset your credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                    error ? 'border-red-500 ring-red-500' : 'border-border'
                  }`}
                />
              </div>
              {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-opacity-95 transition-all shadow-md flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center space-y-4 py-4">
          <div className="inline-flex w-12 h-12 bg-green-500/10 text-primary rounded-full items-center justify-center border border-green-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight">Check your Email</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We have dispatched a secure link to <strong className="text-foreground">{email}</strong>. 
              Click the link inside to configure a new password.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/reset-password?token=demo-token"
              className="text-xs font-bold text-primary hover:underline"
            >
              Configure new password directly (Demo reset)
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
