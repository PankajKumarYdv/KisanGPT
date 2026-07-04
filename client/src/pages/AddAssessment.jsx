import React from 'react';
import { useNavigate } from 'react-router-dom';
import AssessmentForm from '../components/forms/AssessmentForm.jsx';
import { useCreateAssessment } from '../hooks/useAssessments.js';
import { useToast } from '../components/ui/Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldCheck } from 'lucide-react';

export default function AddAssessment() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const createMutation = useCreateAssessment();

  const handleSubmit = (data) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        addToast('Assessment report created successfully!', 'success');
        navigate('/assessment/history');
      },
      onError: (error) => {
        const message =
          error.response?.data?.message || error.message || 'Failed to create assessment';
        addToast(message, 'error');
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-foreground text-left">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Initiate Farm Diagnostics</h1>
          <p className="text-sm text-muted-foreground font-semibold">
            Select a farmer profile and manually enter threat indices for each risk domain.
          </p>
        </div>
      </div>

      <AssessmentForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/assessment')}
        loading={createMutation.isPending}
        isEdit={false}
      />
    </div>
  );
}
