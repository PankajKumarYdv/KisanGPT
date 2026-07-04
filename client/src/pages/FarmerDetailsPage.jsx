import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFarmerDetail, useDeleteFarmer } from '../hooks/useFarmers.js';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.jsx';
import DeleteModal from '../components/ui/DeleteModal.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import {
  MapPin,
  Sprout,
  Grid,
  Landmark,
  Coins,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  CloudSun,
  TrendingUp,
  ArrowLeft,
  Edit,
  Trash2,
} from 'lucide-react';

export default function FarmerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const { data: farmer, isLoading, isError, error } = useFarmerDetail(id);
  const deleteMutation = useDeleteFarmer();
  
  const [deleteOpen, setDeleteOpen] = useState(false);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        addToast('Farmer profile deleted successfully!', 'success');
        setDeleteOpen(false);
        navigate('/profile');
      },
      onError: (err) => {
        const message = err.response?.data?.message || err.message || 'Failed to delete farmer profile';
        addToast(message, 'error');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <LoadingSkeleton type="detail" />
      </div>
    );
  }

  if (isError || !farmer) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-card border border-border rounded-2xl text-foreground">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Farmer Profile Not Found</h2>
        <p className="text-sm text-muted-foreground mb-4">{error?.message || 'The profile may have been deleted.'}</p>
        <button
          onClick={() => navigate('/profile')}
          className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-opacity-95 shadow-md"
        >
          Return to Farm Profiles
        </button>
      </div>
    );
  }

  const userRef = farmer.userId || {};
  const fullName = userRef.fullName || 'N/A';
  const email = userRef.email || 'N/A';
  const phone = userRef.phone || 'N/A';
  const avatar = userRef.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName}`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-foreground text-left">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Profiles List
          </Link>
          <div className="flex items-center gap-3">
            <img
              src={avatar}
              alt={fullName}
              className="w-14 h-14 rounded-2xl object-cover bg-primary/10 border border-primary/20"
            />
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">{fullName}</h1>
              <p className="text-sm text-muted-foreground font-semibold">
                Farm Name: <strong className="text-foreground">{farmer.farmName || 'Golden Fields'}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/profile/edit/${farmer._id}`)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl font-semibold"
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-950 rounded-xl font-semibold"
          >
            <Trash2 className="w-4 h-4" /> Delete Profile
          </Button>
        </div>
      </div>

      {/* Main Structural Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Farm Details Card */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-base border-b border-border pb-2 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-primary" /> Farm Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Crop Type</span>
                <span className="font-bold inline-flex px-2 py-0.5 rounded-md bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200 text-xs border border-green-200 dark:border-green-900">
                  {farmer.cropType || 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Land Size</span>
                <span className="font-bold text-foreground">
                  {farmer.landSize} {farmer.landUnit}
                </span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Irrigation Type</span>
                <span className="font-bold text-foreground">{farmer.irrigationType || 'Canal/Tube well'}</span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Soil Type</span>
                <span className="font-bold text-foreground">{farmer.soilType || 'Alluvial'}</span>
              </div>
            </div>
          </div>

          {/* Location details */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-base border-b border-border pb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Geographical Parameters
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">State</span>
                <span className="font-bold text-foreground">{farmer.state}</span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">District</span>
                <span className="font-bold text-foreground">{farmer.district}</span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Village</span>
                <span className="font-bold text-foreground">{farmer.village || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Pincode</span>
                <span className="font-bold text-foreground">{farmer.pincode || 'N/A'}</span>
              </div>
              {farmer.latitude && farmer.longitude && (
                <div className="col-span-2">
                  <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Spatial Coordinates</span>
                  <span className="font-bold text-foreground text-xs font-mono">
                    Lat: {farmer.latitude}, Lng: {farmer.longitude}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Financial details */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-base border-b border-border pb-2 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" /> Financial Records & Experience
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Annual Income</span>
                <span className="font-bold text-primary text-base">{formatCurrency(farmer.annualIncome)}</span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Active Loan Amount</span>
                <span className={`font-bold text-base ${farmer.loanAmount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}`}>
                  {farmer.loanAmount > 0 ? formatCurrency(farmer.loanAmount) : 'No outstanding loan'}
                </span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Experience</span>
                <span className="font-bold text-foreground">
                  {farmer.farmingExperience || 0} years in farming
                </span>
              </div>
              {farmer.livestock && farmer.livestock.length > 0 && (
                <div>
                  <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Livestock</span>
                  <span className="font-bold text-foreground">
                    {farmer.livestock.join(', ')}
                  </span>
                </div>
              )}
            </div>
            {farmer.notes && (
              <div className="pt-2 border-t border-border mt-2">
                <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Notes / Challenges</span>
                <p className="text-sm leading-relaxed text-muted-foreground">{farmer.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Coming soon widgets */}
        <div className="space-y-6">
          {/* Contact Details Card */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Contact Info</h4>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-semibold">Email:</span>
                <span className="font-bold text-foreground truncate max-w-[150px]">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-semibold">Phone:</span>
                <span className="font-bold text-foreground">{phone}</span>
              </div>
            </div>
          </div>

          {/* AI Assessment Placeholder */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm text-center relative overflow-hidden group">
            <div className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 rounded-md">
              Coming Soon
            </div>
            <div className="p-3 bg-primary/10 rounded-full text-primary w-fit mx-auto mb-3">
              <Sparkles className="w-5 h-5 group-hover:scale-115 transition-transform" />
            </div>
            <h4 className="font-bold text-sm text-foreground mb-1">AI Diagnostics</h4>
            <p className="text-xs text-muted-foreground">
              Intelligent crop risk index computations and advisory summaries.
            </p>
          </div>

          {/* Weather Advisor Placeholder */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm text-center relative overflow-hidden group">
            <div className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-md">
              Coming Soon
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400 w-fit mx-auto mb-3">
              <CloudSun className="w-5 h-5 group-hover:scale-115 transition-transform" />
            </div>
            <h4 className="font-bold text-sm text-foreground mb-1">Localized Weather</h4>
            <p className="text-xs text-muted-foreground">
              Soil moisture readings and localized multi-day weather forecasting.
            </p>
          </div>

          {/* Market Intelligence Placeholder */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm text-center relative overflow-hidden group">
            <div className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md">
              Coming Soon
            </div>
            <div className="p-3 bg-amber-500/10 rounded-full text-amber-600 dark:text-amber-400 w-fit mx-auto mb-3">
              <TrendingUp className="w-5 h-5 group-hover:scale-115 transition-transform" />
            </div>
            <h4 className="font-bold text-sm text-foreground mb-1">APMC Mandi Rates</h4>
            <p className="text-xs text-muted-foreground">
              Volatile crop commodity tracking and minimum price indices.
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        farmerName={fullName}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
