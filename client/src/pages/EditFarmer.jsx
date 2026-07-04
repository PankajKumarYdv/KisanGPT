import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FarmerForm from '../components/forms/FarmerForm.jsx';
import { useFarmerDetail, useUpdateFarmer } from '../hooks/useFarmers.js';
import { useToast } from '../components/ui/Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.jsx';
import { Edit } from 'lucide-react';

export default function EditFarmer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const { data: farmer, isLoading, isError, error } = useFarmerDetail(id);
  const updateMutation = useUpdateFarmer();
  const isAdmin = user?.role === 'admin';

  const handleSubmit = (data) => {
    updateMutation.mutate(
      { id, farmerData: data },
      {
        onSuccess: () => {
          addToast('Farmer profile updated successfully!', 'success');
          navigate(`/profile/${id}`);
        },
        onError: (err) => {
          const message = err.response?.data?.message || err.message || 'Failed to update farmer profile';
          addToast(message, 'error');
        },
      }
    );
  };

  const handleCancel = () => {
    navigate(`/profile/${id}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <LoadingSkeleton type="form" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-card border border-border rounded-2xl text-foreground">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Error Loading Farmer Details</h2>
        <p className="text-sm text-muted-foreground mb-4">{error.message || 'Check database connectivity.'}</p>
        <button
          onClick={() => navigate('/profile')}
          className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-opacity-95 shadow-md"
        >
          Return to Farm Profiles
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-foreground text-left">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
          <Edit className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Edit Farm Profile</h1>
          <p className="text-sm text-muted-foreground font-semibold">
            Modify values for farm name, land size, crop types, or location configurations.
          </p>
        </div>
      </div>

      <FarmerForm
        initialValues={farmer}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updateMutation.isPending}
        isAdmin={isAdmin}
        isEdit={true}
      />
    </div>
  );
}
