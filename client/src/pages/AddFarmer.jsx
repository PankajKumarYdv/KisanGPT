import React from 'react';
import { useNavigate } from 'react-router-dom';
import FarmerForm from '../components/forms/FarmerForm.jsx';
import { useCreateFarmer } from '../hooks/useFarmers.js';
import { useToast } from '../components/ui/Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Sprout } from 'lucide-react';

export default function AddFarmer() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  
  const createMutation = useCreateFarmer();
  const isAdmin = user?.role === 'admin';

  const handleSubmit = (data) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        addToast('Farmer profile created successfully!', 'success');
        navigate('/profile');
      },
      onError: (error) => {
        const message = error.response?.data?.message || error.message || 'Failed to create farmer profile';
        addToast(message, 'error');
      },
    });
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-foreground text-left">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
          <Sprout className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Create Farmer Profile</h1>
          <p className="text-sm text-muted-foreground font-semibold">
            Input personal details, spatial location, and cropping parameters to create a new profile.
          </p>
        </div>
      </div>

      <FarmerForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={createMutation.isPending}
        isAdmin={isAdmin}
        isEdit={false}
      />
    </div>
  );
}
