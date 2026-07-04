import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssessmentForm from '../components/forms/AssessmentForm.jsx';
import { useAssessmentDetail, useUpdateAssessment } from '../hooks/useAssessments.js';
import { useToast } from '../components/ui/Toast.jsx';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { Edit3 } from 'lucide-react';

export default function EditAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data: assessment, isLoading, isError } = useAssessmentDetail(id);
  const updateMutation = useUpdateAssessment();

  const handleSubmit = (data) => {
    updateMutation.mutate(
      { id, assessmentData: data },
      {
        onSuccess: () => {
          addToast('Assessment updated successfully!', 'success');
          navigate(`/assessment/${id}`);
        },
        onError: (error) => {
          const message =
            error.response?.data?.message || error.message || 'Failed to update assessment';
          addToast(message, 'error');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <LoadingSkeleton type="form" />
      </div>
    );
  }

  if (isError || !assessment) {
    return (
      <div className="py-12">
        <EmptyState
          title="Assessment Not Found"
          description="The assessment report you are trying to edit could not be located."
          actionLabel="Go Back"
          onAction={() => navigate('/assessment/history')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-foreground text-left">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 border border-amber-500/20">
          <Edit3 className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Amend Diagnostic Report</h1>
          <p className="text-sm text-muted-foreground font-semibold">
            Updating report #{id?.substring(18)} — changes are logged and versioned.
          </p>
        </div>
      </div>

      <AssessmentForm
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/assessment/${id}`)}
        loading={updateMutation.isPending}
        initialData={assessment}
        isEdit={true}
      />
    </div>
  );
}
