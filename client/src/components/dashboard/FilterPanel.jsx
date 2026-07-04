import React, { useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import Button from '../ui/Button.jsx';

export default function FilterPanel({ onFilter, currentFilters = {} }) {
  const [state, setState] = useState(currentFilters.state || '');
  const [district, setDistrict] = useState(currentFilters.district || '');
  const [cropType, setCropType] = useState(currentFilters.cropType || '');
  const [landSize, setLandSize] = useState(currentFilters.landSize || '');
  const [loanRange, setLoanRange] = useState(currentFilters.loanRange || '');
  const [incomeRange, setIncomeRange] = useState(currentFilters.incomeRange || '');

  const handleApply = (e) => {
    e.preventDefault();
    onFilter({
      state,
      district,
      cropType,
      landSize,
      loanRange,
      incomeRange,
    });
  };

  const handleReset = () => {
    setState('');
    setDistrict('');
    setCropType('');
    setLandSize('');
    setLoanRange('');
    setIncomeRange('');
    onFilter({});
  };

  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm text-foreground text-left space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" /> Filter Options
        </h3>
        <button
          onClick={handleReset}
          className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      <form onSubmit={handleApply} className="space-y-4">
        {/* State */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">State</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-3.5 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all"
          >
            <option value="">All States</option>
            <option value="Punjab">Punjab</option>
            <option value="Haryana">Haryana</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Maharashtra">Maharashtra</option>
          </select>
        </div>

        {/* District */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">District</label>
          <input
            type="text"
            placeholder="e.g. Amritsar"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full px-3.5 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all"
          />
        </div>

        {/* Crop */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Crop</label>
          <input
            type="text"
            placeholder="e.g. Wheat"
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            className="w-full px-3.5 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all"
          />
        </div>

        {/* Land Size */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Land Size Range</label>
          <select
            value={landSize}
            onChange={(e) => setLandSize(e.target.value)}
            className="w-full px-3.5 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all"
          >
            <option value="">Any Size</option>
            <option value="0-2">Small (&lt; 2 acres)</option>
            <option value="2-5">Medium (2-5 acres)</option>
            <option value="5-10">Large (5-10 acres)</option>
            <option value="10+">Very Large (&gt; 10 acres)</option>
          </select>
        </div>

        {/* Loan Range */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Loan Range</label>
          <select
            value={loanRange}
            onChange={(e) => setLoanRange(e.target.value)}
            className="w-full px-3.5 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all"
          >
            <option value="">Any Loan</option>
            <option value="none">No Loans</option>
            <option value="0-50000">Under ₹50k</option>
            <option value="50000-150000">₹50k - ₹1.5L</option>
            <option value="150000+">Over ₹1.5L</option>
          </select>
        </div>

        {/* Income Range */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Income Range</label>
          <select
            value={incomeRange}
            onChange={(e) => setIncomeRange(e.target.value)}
            className="w-full px-3.5 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm font-semibold transition-all"
          >
            <option value="">Any Income</option>
            <option value="0-100000">Under ₹1L</option>
            <option value="100000-300000">₹1L - ₹3L</option>
            <option value="300000-600000">₹3L - ₹6L</option>
            <option value="600000+">Over ₹6L</option>
          </select>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 rounded-xl font-bold mt-2 flex justify-center"
        >
          Apply Filters
        </Button>
      </form>
    </div>
  );
}
