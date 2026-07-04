import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, MapPin, Grid, DollarSign, Activity } from 'lucide-react';

export default function FarmerCard({ farmer, onEdit, onDelete }) {
  const userRef = farmer.userId || {};
  const fullName = userRef.fullName || 'Unknown Farmer';
  const email = userRef.email || '';
  const avatar = userRef.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName}`;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="border border-border bg-card p-6 rounded-2xl shadow-sm space-y-4 flex flex-col text-foreground text-left transition-all hover:shadow-md">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            alt={fullName}
            className="w-12 h-12 rounded-xl object-cover bg-primary/10 border border-primary/20 flex-shrink-0"
          />
          <div>
            <h4 className="font-extrabold text-base leading-tight">{fullName}</h4>
            <p className="text-xs text-muted-foreground font-semibold">{email}</p>
          </div>
        </div>
        <span className="inline-flex px-2.5 py-1 text-xs font-bold bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200 border border-green-200 dark:border-green-900 rounded-lg">
          {farmer.cropType || 'Crop: N/A'}
        </span>
      </div>

      {/* Region and Parameters */}
      <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-border">
        <div className="space-y-1">
          <span className="block text-muted-foreground uppercase font-bold tracking-wider text-[10px]">Location</span>
          <div className="flex items-center gap-1 text-foreground font-semibold">
            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="truncate">{farmer.village || farmer.district}</span>
          </div>
        </div>
        <div className="space-y-1">
          <span className="block text-muted-foreground uppercase font-bold tracking-wider text-[10px]">Land Area</span>
          <div className="flex items-center gap-1 text-foreground font-semibold">
            <Grid className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span>{farmer.landSize} {farmer.landUnit}</span>
          </div>
        </div>
        <div className="space-y-1 pt-1">
          <span className="block text-muted-foreground uppercase font-bold tracking-wider text-[10px]">Income</span>
          <div className="flex items-center gap-1 text-primary font-bold">
            <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{formatCurrency(farmer.annualIncome)}</span>
          </div>
        </div>
        <div className="space-y-1 pt-1">
          <span className="block text-muted-foreground uppercase font-bold tracking-wider text-[10px]">Active Loan</span>
          <div className="flex items-center gap-1 text-foreground font-semibold">
            <Activity className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className={farmer.loanAmount > 0 ? 'text-orange-600 dark:text-orange-400 font-bold' : ''}>
              {farmer.loanAmount > 0 ? formatCurrency(farmer.loanAmount) : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-border mt-auto">
        <Link
          to={`/profile/${farmer._id}`}
          className="flex-1 py-2 border border-border rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
        >
          <Eye className="w-4 h-4" /> View Details
        </Link>
        <button
          onClick={() => onEdit(farmer._id)}
          className="p-2 border border-border rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          title="Edit Farmer"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(farmer._id, fullName)}
          className="p-2 border border-border hover:border-red-200 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-600 transition-all"
          title="Delete Farmer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
