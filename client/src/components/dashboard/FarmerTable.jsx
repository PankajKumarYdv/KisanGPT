import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, ShieldAlert } from 'lucide-react';

export default function FarmerTable({ farmers = [], onEdit, onDelete }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="border border-border rounded-2xl overflow-hidden shadow-sm bg-card text-foreground">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-left">
          <thead className="bg-muted/30">
            <tr>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Photo</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Region</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Crop</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Land Size</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Income</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Loan</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {farmers.map((farmer) => {
              const userRef = farmer.userId || {};
              const fullName = userRef.fullName || 'Unknown Farmer';
              const email = userRef.email || '';
              const avatar = userRef.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName}`;

              return (
                <tr key={farmer._id} className="hover:bg-muted/10 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <img
                      src={avatar}
                      alt={fullName}
                      className="w-10 h-10 rounded-xl object-cover bg-primary/10 border border-primary/20"
                    />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-bold text-sm text-foreground">{fullName}</div>
                    <div className="text-xs text-muted-foreground">{email}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-semibold text-foreground">
                      {farmer.village ? `${farmer.village}, ` : ''}{farmer.district}
                    </div>
                    <div className="text-xs text-muted-foreground font-bold uppercase">{farmer.state}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 text-xs font-bold bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200 border border-green-200 dark:border-green-900 rounded-lg">
                      {farmer.cropType || 'Not specified'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-foreground">
                    {farmer.landSize} <span className="text-muted-foreground text-xs font-semibold">{farmer.landUnit}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-primary">
                    {formatCurrency(farmer.annualIncome)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-foreground">
                    {farmer.loanAmount > 0 ? (
                      <span className="text-orange-600 dark:text-orange-400 font-bold">
                        {formatCurrency(farmer.loanAmount)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">No Loan</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/profile/${farmer._id}`}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title="View Profile Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => onEdit(farmer._id)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title="Edit Profile"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(farmer._id, fullName)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-600 transition-all"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
