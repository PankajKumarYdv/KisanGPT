import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Button from '../ui/Button.jsx';
import { User, MapPin, Sprout, Landmark, Plus, X } from 'lucide-react';
import { useToast } from '../ui/Toast.jsx';

// Zod validation schema matching backend model constraints
const farmerFormSchema = z.object({
  // Section 1: Personal (User metadata - read-only/informational or used for registration links)
  fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
  avatar: z.string().optional(),
  
  // Admin only field
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid 24-character MongoDB ID').optional().or(z.literal('')),

  // Section 2: Location
  state: z.string().min(2, 'State is required'),
  district: z.string().min(2, 'District is required'),
  village: z.string().optional().default(''),
  pincode: z.string().regex(/^[1-9]\d{5}$/, 'Pincode must be exactly 6 Indian postal digits').or(z.literal('')),

  // Section 3: Farm Information
  farmName: z.string().optional().default(''),
  landSize: z.preprocess((val) => Number(val), z.number().min(0, 'Land size must be a positive number')),
  landUnit: z.enum(['acres', 'hectares', 'bigha']),
  cropType: z.string().min(2, 'Crop type is required'),
  irrigationType: z.string().optional().default(''),
  soilType: z.string().optional().default(''),

  // Section 4: Financial Information
  annualIncome: z.preprocess((val) => Number(val), z.number().min(0, 'Annual income cannot be negative')),
  loanAmount: z.preprocess((val) => Number(val), z.number().min(0, 'Loan amount cannot be negative')),
  farmingExperience: z.preprocess((val) => Number(val), z.number().min(0, 'Experience cannot be negative')),

  // Section 5: Additional
  livestock: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export default function FarmerForm({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
  isAdmin = false,
  isEdit = false,
}) {
  const { addToast } = useToast();

  // Standard pre-populate matching initial state
  const defaultValues = {
    fullName: initialValues?.userId?.fullName || initialValues?.fullName || '',
    email: initialValues?.userId?.email || initialValues?.email || '',
    phone: initialValues?.userId?.phone || initialValues?.phone || '',
    avatar: initialValues?.userId?.avatar || initialValues?.avatar || '',
    userId: initialValues?.userId?._id || initialValues?.userId || '',
    state: initialValues?.state || '',
    district: initialValues?.district || '',
    village: initialValues?.village || '',
    pincode: initialValues?.pincode || '',
    farmName: initialValues?.farmName || '',
    landSize: initialValues?.landSize || 0,
    landUnit: initialValues?.landUnit || 'acres',
    cropType: initialValues?.cropType || '',
    irrigationType: initialValues?.irrigationType || '',
    soilType: initialValues?.soilType || '',
    annualIncome: initialValues?.annualIncome || 0,
    loanAmount: initialValues?.loanAmount || 0,
    farmingExperience: initialValues?.farmingExperience || 0,
    livestock: Array.isArray(initialValues?.livestock) ? initialValues.livestock.join(', ') : initialValues?.livestock || '',
    notes: initialValues?.notes || '',
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(farmerFormSchema),
    defaultValues,
  });

  // Track unsaved changes for page departures
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleCancelClick = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        'You have unsaved form fields. Discard all changes?'
      );
      if (!confirmLeave) return;
    }
    onCancel();
  };

  const onFormSubmit = (data) => {
    // Convert comma-separated livestock string to array before submitting
    const formattedData = {
      ...data,
      livestock: data.livestock
        ? data.livestock.split(',').map((item) => item.trim()).filter(Boolean)
        : [],
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 text-foreground text-left max-w-4xl mx-auto">
      {/* SECTION 1: Personal Information */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <User className="w-5 h-5 text-primary" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider">Section 1: Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Rajesh Kumar"
              {...register('fullName')}
              className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                errors.fullName ? 'border-red-500 ring-red-500' : 'border-border'
              }`}
            />
            {errors.fullName && <p className="text-xs text-red-500 font-medium">{errors.fullName.message}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
            <input
              type="text"
              placeholder="e.g. 9876543210"
              {...register('phone')}
              className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                errors.phone ? 'border-red-500 ring-red-500' : 'border-border'
              }`}
            />
            {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              placeholder="e.g. rajesh@example.com"
              {...register('email')}
              className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                errors.email ? 'border-red-500 ring-red-500' : 'border-border'
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
          </div>

          {/* Admin only: Link user ID */}
          {isAdmin && !isEdit && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                User ID Link (Admin Only)
              </label>
              <input
                type="text"
                placeholder="24-char MongoDB User ID"
                {...register('userId')}
                className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                  errors.userId ? 'border-red-500 ring-red-500' : 'border-border'
                }`}
              />
              {errors.userId && <p className="text-xs text-red-500 font-medium">{errors.userId.message}</p>}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Location */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider">Section 2: Location</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* State */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">State</label>
            <input
              type="text"
              placeholder="e.g. Punjab"
              {...register('state')}
              className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                errors.state ? 'border-red-500 ring-red-500' : 'border-border'
              }`}
            />
            {errors.state && <p className="text-xs text-red-500 font-medium">{errors.state.message}</p>}
          </div>

          {/* District */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">District</label>
            <input
              type="text"
              placeholder="e.g. Amritsar"
              {...register('district')}
              className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                errors.district ? 'border-red-500 ring-red-500' : 'border-border'
              }`}
            />
            {errors.district && <p className="text-xs text-red-500 font-medium">{errors.district.message}</p>}
          </div>

          {/* Village */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Village</label>
            <input
              type="text"
              placeholder="e.g. Jassa"
              {...register('village')}
              className="w-full px-3.5 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all"
            />
          </div>

          {/* Pincode */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Pincode</label>
            <input
              type="text"
              placeholder="e.g. 143001"
              {...register('pincode')}
              className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                errors.pincode ? 'border-red-500 ring-red-500' : 'border-border'
              }`}
            />
            {errors.pincode && <p className="text-xs text-red-500 font-medium">{errors.pincode.message}</p>}
          </div>
        </div>
      </div>

      {/* SECTION 3: Farm Information */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Sprout className="w-5 h-5 text-primary" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider">Section 3: Farm Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Farm Name */}
          <div className="space-y-1 md:col-span-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Farm Name</label>
            <input
              type="text"
              placeholder="e.g. Golden Harvester Fields"
              {...register('farmName')}
              className="w-full px-3.5 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all"
            />
          </div>

          {/* Crop Type */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Primary Crop Type</label>
            <input
              type="text"
              placeholder="e.g. Wheat"
              {...register('cropType')}
              className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                errors.cropType ? 'border-red-500 ring-red-500' : 'border-border'
              }`}
            />
            {errors.cropType && <p className="text-xs text-red-500 font-medium">{errors.cropType.message}</p>}
          </div>

          {/* Land Size */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Land Size</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 5.5"
              {...register('landSize')}
              className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                errors.landSize ? 'border-red-500 ring-red-500' : 'border-border'
              }`}
            />
            {errors.landSize && <p className="text-xs text-red-500 font-medium">{errors.landSize.message}</p>}
          </div>

          {/* Land Unit */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Land Unit</label>
            <select
              {...register('landUnit')}
              className="w-full px-3.5 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all"
            >
              <option value="acres">Acres</option>
              <option value="hectares">Hectares</option>
              <option value="bigha">Bigha</option>
            </select>
          </div>

          {/* Irrigation Type */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Irrigation Type</label>
            <input
              type="text"
              placeholder="e.g. Canal / Tube well / Drip"
              {...register('irrigationType')}
              className="w-full px-3.5 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all"
            />
          </div>

          {/* Soil Type */}
          <div className="space-y-1 md:col-span-3">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Soil Type</label>
            <input
              type="text"
              placeholder="e.g. Alluvial / Clayey / Sandy loam"
              {...register('soilType')}
              className="w-full px-3.5 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Financial Information */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Landmark className="w-5 h-5 text-primary" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider">Section 4: Financial Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Annual Income */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Annual Income (₹)</label>
            <input
              type="number"
              placeholder="e.g. 350000"
              {...register('annualIncome')}
              className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                errors.annualIncome ? 'border-red-500 ring-red-500' : 'border-border'
              }`}
            />
            {errors.annualIncome && <p className="text-xs text-red-500 font-medium">{errors.annualIncome.message}</p>}
          </div>

          {/* Loan Amount */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Outstanding Loan (₹)</label>
            <input
              type="number"
              placeholder="e.g. 50000"
              {...register('loanAmount')}
              className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                errors.loanAmount ? 'border-red-500 ring-red-500' : 'border-border'
              }`}
            />
            {errors.loanAmount && <p className="text-xs text-red-500 font-medium">{errors.loanAmount.message}</p>}
          </div>

          {/* Farming Experience */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Experience (Years)</label>
            <input
              type="number"
              placeholder="e.g. 12"
              {...register('farmingExperience')}
              className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all ${
                errors.farmingExperience ? 'border-red-500 ring-red-500' : 'border-border'
              }`}
            />
            {errors.farmingExperience && <p className="text-xs text-red-500 font-medium">{errors.farmingExperience.message}</p>}
          </div>
        </div>
      </div>

      {/* SECTION 5: Additional */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Plus className="w-5 h-5 text-primary" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider">Section 5: Additional</h3>
        </div>

        <div className="space-y-4">
          {/* Livestock */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Livestock</label>
            <input
              type="text"
              placeholder="e.g. Cow, Buffalo, Goat (comma-separated)"
              {...register('livestock')}
              className="w-full px-3.5 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Notes / Specific Challenges</label>
            <textarea
              rows="3"
              placeholder="Enter specific challenges, soil constraints, or notes..."
              {...register('notes')}
              className="w-full px-3.5 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancelClick}
          className="px-6 py-2.5 rounded-xl font-bold transition-all shadow-md"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          variant="primary"
          className="px-8 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center min-w-[120px]"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isEdit ? (
            'Save Changes'
          ) : (
            'Create Profile'
          )}
        </Button>
      </div>
    </form>
  );
}
