import React, { useState } from 'react';
import { mockSchemes } from '../mock/schemes.js';
import { useToast } from '../components/ui/Toast.jsx';
import Modal from '../components/ui/Modal.jsx';
import { FileText, Search, ShieldCheck, CheckCircle2, RefreshCw, FileQuestion } from 'lucide-react';

export default function GovernmentSchemes() {
  const { addToast } = useToast();
  const [schemes, setSchemes] = useState(mockSchemes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenApply = (scheme) => {
    setSelectedScheme(scheme);
    setModalOpen(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update local scheme status
    setSchemes(prev =>
      prev.map(s => (s.id === selectedScheme.id ? { ...s, status: 'Under Review', applicationDate: new Date().toISOString().split('T')[0] } : s))
    );
    
    addToast(`Application for ${selectedScheme.name} submitted successfully!`, 'success');
    setSubmitting(false);
    setModalOpen(false);
  };

  const filteredSchemes = schemes.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.benefits.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-foreground text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Government Schemes</h1>
          <p className="text-sm text-muted-foreground font-semibold">
            Direct income support subsidies, seed credits, and drip irrigation benefits matched to your farm coordinates.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64 flex-shrink-0">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search schemes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground text-xs font-semibold shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSchemes.map((scheme) => (
          <div key={scheme.id} className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-4">
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {scheme.id}
                </span>
                
                {scheme.status === 'Approved' && (
                  <span className="px-2.5 py-0.5 bg-green-500/10 text-primary rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                  </span>
                )}
                {scheme.status === 'Under Review' && (
                  <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Under Review
                  </span>
                )}
                {scheme.status.includes('Eligible') && (
                  <span className="px-2.5 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-bold">
                    Matched Eligible
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold tracking-tight text-foreground">{scheme.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{scheme.benefits}</p>
            </div>

            <div className="pt-4 border-t border-border flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-semibold">
                {scheme.applicationDate ? `Applied: ${scheme.applicationDate}` : 'Not Applied'}
              </span>
              
              {scheme.status.includes('Eligible') ? (
                <button
                  onClick={() => handleOpenApply(scheme)}
                  className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-opacity-95 shadow-sm transition-all"
                >
                  Apply Scheme
                </button>
              ) : (
                <button
                  onClick={() => handleOpenApply(scheme)}
                  className="px-4 py-2 border border-border hover:bg-muted text-muted-foreground hover:text-foreground font-bold rounded-xl transition-all"
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredSchemes.length === 0 && (
          <div className="md:col-span-2 p-12 text-center bg-card border border-border rounded-3xl space-y-3">
            <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto" />
            <h4 className="font-bold">No schemes matched</h4>
            <p className="text-xs text-muted-foreground">Try adjusting search parameters or check farm crop type.</p>
          </div>
        )}
      </div>

      {/* Scheme Application Modal */}
      {selectedScheme && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={selectedScheme.status.includes('Eligible') ? 'Apply for Welfare Scheme' : 'Scheme Details Overview'}
        >
          <form onSubmit={handleApplySubmit} className="space-y-5 text-left text-sm text-foreground">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Scheme Name</h4>
              <p className="font-extrabold text-base text-primary">{selectedScheme.name}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Benefits</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{selectedScheme.benefits}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Eligibility Criteria</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{selectedScheme.eligibility}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Required Documents</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold bg-muted/40 p-3 rounded-xl border border-border">
                {selectedScheme.documents}
              </p>
            </div>

            {selectedScheme.status.includes('Eligible') ? (
              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-opacity-95 shadow-md flex justify-center items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Submit Application
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-opacity-95 shadow-md"
                >
                  Close details
                </button>
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}
