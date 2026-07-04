import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Button from '../ui/Button.jsx';
import { useFarmersList } from '../../hooks/useFarmers.js';
import { ShieldCheck, User, BarChart2, Info, ChevronRight, ChevronLeft } from 'lucide-react';

const assessmentFormSchema = z.object({
  farmerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Select a valid farmer profile'),
  financialRisk: z.preprocess((val) => Number(val), z.number().min(0).max(100)),
  weatherRisk: z.preprocess((val) => Number(val), z.number().min(0).max(100)),
  cropRisk: z.preprocess((val) => Number(val), z.number().min(0).max(100)),
  marketRisk: z.preprocess((val) => Number(val), z.number().min(0).max(100)),
  wellnessRisk: z.preprocess((val) => Number(val), z.number().min(0).max(100)),
  overallRisk: z.preprocess((val) => Number(val), z.number().min(0).max(100)),
  recommendation: z.string().min(10, 'Recommendation must be at least 10 characters long'),
  summary: z.string().min(5, 'Summary must be at least 5 characters long'),
  assessmentStatus: z.enum(['Pending', 'Completed', 'Failed']),
});

export default function AssessmentForm({
  initialValues,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
}) {
  const [step, setStep] = useState(1);
  const init = initialData || initialValues; // support both prop names

  // Fetch farmers list for dropdown selection (especially for admins)
  const { data: response, isLoading: farmersLoading } = useFarmersList({ limit: 100 });
  const farmersList = response?.data || [];

  const defaultValues = {
    farmerId: init?.farmerId?._id || init?.farmerId || '',
    financialRisk: init?.financialRisk ?? 30,
    weatherRisk: init?.weatherRisk ?? 30,
    cropRisk: init?.cropRisk ?? 30,
    marketRisk: init?.marketRisk ?? 30,
    wellnessRisk: init?.wellnessRisk ?? 30,
    overallRisk: init?.overallRisk ?? 30,
    recommendation: init?.recommendation || '',
    summary: init?.summary || '',
    assessmentStatus: init?.assessmentStatus || 'Pending',
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues,
  });

  // Watch fields to compute real-time average for overallRisk
  const financial = watch('financialRisk');
  const weather = watch('weatherRisk');
  const crop = watch('cropRisk');
  const market = watch('marketRisk');
  const wellness = watch('wellnessRisk');
  const selectedFarmerId = watch('farmerId');

  // Automatically update overallRisk as average on value changes
  useEffect(() => {
    const avg = Math.round(
      (Number(financial || 0) +
        Number(weather || 0) +
        Number(crop || 0) +
        Number(market || 0) +
        Number(wellness || 0)) /
        5
    );
    setValue('overallRisk', avg, { shouldValidate: true });
  }, [financial, weather, crop, market, wellness, setValue]);

  // Unsaved changes handler
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleNextStep = () => {
    if (!selectedFarmerId) {
      alert('Please select a farmer profile before moving to the next step.');
      return;
    }
    setStep(2);
  };

  const handleCancelClick = () => {
    if (isDirty) {
      const confirmDiscard = window.confirm('Discard all unsaved assessment edits?');
      if (!confirmDiscard) return;
    }
    onCancel();
  };

  return (
    <div className="max-w-3xl mx-auto text-foreground text-left">
      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
            1
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Farmer</span>
        </div>
        <div className="w-12 h-0.5 bg-border"></div>
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
            2
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Diagnostic Data</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 ? (
          /* STEP 1: SELECT FARMER */
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-base border-b border-border pb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Step 1: Select Farmer Profile
            </h3>

            {farmersLoading ? (
              <div className="py-8 text-center animate-pulse text-sm text-muted-foreground">
                Retrieving farmers directory...
              </div>
            ) : farmersList.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No active farmers registered. Create a farmer profile first.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Farmer Profile Link
                  </label>
                  <select
                    {...register('farmerId')}
                    disabled={isEdit}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                      errors.farmerId ? 'border-red-500 ring-red-500' : 'border-border'
                    }`}
                  >
                    <option value="">-- Choose Profile --</option>
                    {farmersList.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.userId?.fullName || 'N/A'} - {f.farmName} ({f.cropType})
                      </option>
                    ))}
                  </select>
                  {errors.farmerId && <p className="text-xs text-red-500 font-medium">{errors.farmerId.message}</p>}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNextStep}
                    className="flex items-center gap-1.5 font-bold rounded-xl"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* STEP 2: ASSESSMENT DATA */
          <div className="space-y-6">
            {/* Risk Parameters sliders */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5">
              <h3 className="font-extrabold text-base border-b border-border pb-2 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" /> Step 2: Risk Threat Indices (0 - 100%)
              </h3>

              <div className="space-y-4">
                {[
                  { name: 'financialRisk', label: 'Financial Exposure Risk' },
                  { name: 'weatherRisk', label: 'Weather Anomaly Risk' },
                  { name: 'cropRisk', label: 'Crop Pest / Disease Threat' },
                  { name: 'marketRisk', label: 'Market Mandi Volatility' },
                  { name: 'wellnessRisk', label: 'Farmer Health & Wellness' },
                ].map((field) => {
                  const currentVal = watch(field.name);
                  return (
                    <div key={field.name} className="space-y-2 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                          {field.label}
                        </label>
                        <span className="text-sm font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg">
                          {currentVal}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        {...register(field.name)}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  );
                })}

                {/* Overall calculated Risk */}
                <div className="bg-muted/40 p-4 rounded-xl border border-border flex justify-between items-center mt-4">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Calculated Overall Risk</h4>
                    <p className="text-xs text-muted-foreground">Computed automatically as the average of the indices.</p>
                  </div>
                  <span className="text-2xl font-black text-primary bg-card px-4 py-1.5 border border-border rounded-xl">
                    {watch('overallRisk')}%
                  </span>
                </div>
              </div>
            </div>

            {/* Assessment advisories */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-base border-b border-border pb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" /> Reports & Status details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Diagnostic Status
                  </label>
                  <select
                    {...register('assessmentStatus')}
                    className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                {/* Summary */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Overview Summary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Risk elevated due to storm forecasts."
                    {...register('summary')}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                      errors.summary ? 'border-red-500 ring-red-500' : 'border-border'
                    }`}
                  />
                  {errors.summary && <p className="text-xs text-red-500 font-medium">{errors.summary.message}</p>}
                </div>

                {/* Recommendation */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Advisory Recommendation Actions
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Enter detailed action advices for crop, pesticides, or storage..."
                    {...register('recommendation')}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all resize-none ${
                      errors.recommendation ? 'border-red-500 ring-red-500' : 'border-border'
                    }`}
                  />
                  {errors.recommendation && (
                    <p className="text-xs text-red-500 font-medium">{errors.recommendation.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelClick}
                className="px-5 py-2.5 rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className="px-8 py-2.5 rounded-xl font-bold shadow-md flex items-center justify-center min-w-[120px]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isEdit ? (
                  'Save Report'
                ) : (
                  'Create Report'
                )}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
