import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCurrentFarmer, useFarmersList } from '../hooks/useFarmers.js';
import { useAssessmentsList, useDeleteAssessment } from '../hooks/useAssessments.js';
import { useAuth } from '../context/AuthContext.jsx';
import AssessmentTable from '../components/dashboard/AssessmentTable.jsx';
import AssessmentCard from '../components/dashboard/AssessmentCard.jsx';
import SearchBar from '../components/dashboard/SearchBar.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.jsx';
import DeleteModal from '../components/ui/DeleteModal.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import Button from '../components/ui/Button.jsx';
import { FileText, ArrowLeft, Plus, Filter, RotateCcw } from 'lucide-react';

export default function AssessmentHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { data: farmer } = useCurrentFarmer();

  const isAdmin = user?.role === 'admin';
  const farmerId = farmer?._id;

  // Filter and pagination states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [selectedFarmerFilter, setSelectedFarmerFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Soft delete modal states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const deleteMutation = useDeleteAssessment();

  // Load assessments
  const apiParams = isAdmin ? {} : { farmerId };
  const { data: response, isLoading, isError, error } = useAssessmentsList(apiParams);
  const { data: farmersResponse } = useFarmersList({ limit: 100 });
  
  const assessments = response?.data || [];
  const farmersList = farmersResponse?.data || [];

  const handleEdit = (id) => {
    navigate(`/assessment/edit/${id}`);
  };

  const handleDeleteTrigger = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        addToast('Assessment record deleted successfully!', 'success');
        setDeleteOpen(false);
      },
      onError: (err) => {
        addToast(err.message || 'Failed to delete assessment', 'error');
      },
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setRiskFilter('');
    setSelectedFarmerFilter('');
    setDateFrom('');
    setDateTo('');
    setSortBy('newest');
    setPage(1);
  };

  // Client-side filtering & sorting over retrieved dataset
  let filtered = [...assessments];

  // 1. Search Query
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a._id.toLowerCase().includes(q) ||
        a.summary?.toLowerCase().includes(q) ||
        a.recommendation?.toLowerCase().includes(q)
    );
  }

  // 2. Status Filter
  if (statusFilter) {
    filtered = filtered.filter((a) => a.assessmentStatus === statusFilter);
  }

  // 3. Risk Level Filter
  if (riskFilter) {
    filtered = filtered.filter((a) => {
      const risk = a.overallRisk;
      if (riskFilter === 'low') return risk < 35;
      if (riskFilter === 'medium') return risk >= 35 && risk < 65;
      if (riskFilter === 'high') return risk >= 65;
      return true;
    });
  }

  // 4. Farmer Filter (Admin only)
  if (isAdmin && selectedFarmerFilter) {
    filtered = filtered.filter(
      (a) => a.farmerId?._id === selectedFarmerFilter || a.farmerId === selectedFarmerFilter
    );
  }

  // 5. Date Range Filter
  if (dateFrom) {
    const fromTime = new Date(dateFrom).getTime();
    filtered = filtered.filter((a) => new Date(a.createdAt).getTime() >= fromTime);
  }
  if (dateTo) {
    const toTime = new Date(dateTo).getTime() + 86400000; // include full day
    filtered = filtered.filter((a) => new Date(a.createdAt).getTime() <= toTime);
  }

  // 6. Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'highestRisk') return b.overallRisk - a.overallRisk;
    if (sortBy === 'lowestRisk') return a.overallRisk - b.overallRisk;
    return 0;
  });

  // 7. Client-side Pagination
  const itemsPerPage = 8;
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedItems = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6 text-foreground text-left max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <Link
            to="/assessment"
            className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Assessments History Logs</h1>
          <p className="text-sm text-muted-foreground font-semibold">
            View all diagnostic audits and recommendations.
          </p>
        </div>
        <Button
          onClick={() => navigate('/assessment/new')}
          variant="primary"
          className="flex items-center gap-1.5 font-bold rounded-xl shadow-md py-2.5"
        >
          <Plus className="w-4 h-4" /> Run Diagnostics
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Collapsible Filter Panel */}
        <div className={`lg:col-span-1 space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-primary" /> Filter Audits
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-1.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-xs font-semibold"
              >
                <option value="">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            {/* Risk Level */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Risk Level</label>
              <select
                value={riskFilter}
                onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-1.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-xs font-semibold"
              >
                <option value="">All Risks</option>
                <option value="low">Low (&lt; 35%)</option>
                <option value="medium">Medium (35% - 65%)</option>
                <option value="high">High (&gt; 65%)</option>
              </select>
            </div>

            {/* Farmer selection (Admin only) */}
            {isAdmin && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Farmer</label>
                <select
                  value={selectedFarmerFilter}
                  onChange={(e) => { setSelectedFarmerFilter(e.target.value); setPage(1); }}
                  className="w-full px-3 py-1.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-xs font-semibold"
                >
                  <option value="">All Farmers</option>
                  {farmersList.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.userId?.fullName || 'N/A'} - {f.farmName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Date Range</label>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold">From</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                  className="w-full px-3 py-1.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-xs font-semibold"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold">To</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                  className="w-full px-3 py-1.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content list */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:max-w-md">
              <SearchBar onSearch={setSearch} placeholder="Search reports..." />
            </div>

            <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end items-center">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 lg:hidden text-xs rounded-xl font-semibold"
              >
                <Filter className="w-4 h-4" /> Filters
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-semibold whitespace-nowrap">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="px-3 py-1.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground text-xs font-semibold"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highestRisk">Highest Risk</option>
                  <option value="lowestRisk">Lowest Risk</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loader */}
          {isLoading && (
            <div className="space-y-4">
              <LoadingSkeleton type="table" count={5} />
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="p-8 text-center bg-card border border-border border-dashed rounded-3xl">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Error Loading Assessments</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">{error.message}</p>
            </div>
          )}

          {/* Table list */}
          {!isLoading && !isError && (
            <>
              {paginatedItems.length === 0 ? (
                <EmptyState
                  title="No Assessments Logged"
                  description="No matches match the search query or applied filters. Reset parameters and retry."
                />
              ) : (
                <>
                  <div className="hidden md:block">
                    <AssessmentTable
                      assessments={paginatedItems}
                      onEdit={handleEdit}
                      onDelete={handleDeleteTrigger}
                      showFarmerColumn={isAdmin}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                    {paginatedItems.map((a) => (
                      <AssessmentCard
                        key={a._id}
                        assessment={a}
                        onEdit={handleEdit}
                        onDelete={handleDeleteTrigger}
                        showFarmerName={isAdmin}
                      />
                    ))}
                  </div>

                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>

      <DeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        farmerName="this risk assessment report"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
