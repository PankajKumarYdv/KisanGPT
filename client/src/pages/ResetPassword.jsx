import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'demo';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters long';
    }
    if (confirmPassword !== password) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      addToast('Password updated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-12 p-8 md:p-10 bg-card border border-border rounded-3xl shadow-xl text-foreground text-left">
      {!success ? (
        <>
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight">Reset Password</h2>
            <p className="text-sm text-muted-foreground">
              Configure a new secure password for your KisanGPT account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                    errors.password ? 'border-red-500 ring-red-500' : 'border-border'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirm New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                    errors.confirmPassword ? 'border-red-500 ring-red-500' : 'border-border'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.confirmPassword}
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
                'Save Password'
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
            <h2 className="text-2xl font-extrabold tracking-tight">Success!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your password has been reset successfully. You can now use your new credentials to access the farm workspace.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/login"
              className="w-full py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-opacity-95 shadow-md flex justify-center items-center"
            >
              Login to Workspace
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
