import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFarmersList, useDeleteFarmer } from '../hooks/useFarmers.js';
import SearchBar from '../components/dashboard/SearchBar.jsx';
import FilterPanel from '../components/dashboard/FilterPanel.jsx';
import FarmerTable from '../components/dashboard/FarmerTable.jsx';
import FarmerCard from '../components/dashboard/FarmerCard.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.jsx';
import DeleteModal from '../components/ui/DeleteModal.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import Button from '../components/ui/Button.jsx';
import { Sprout, Plus, Filter, LayoutGrid, List } from 'lucide-react';

export default function FarmerProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const isAdmin = user?.role === 'admin';

  // State parameters for pagination, sorting, filters, search
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Soft delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');

  const deleteMutation = useDeleteFarmer();

  // API parameters mapping
  const apiParams = {
    page,
    limit: 6,
    search: search || undefined,
    state: filters.state || undefined,
    district: filters.district || undefined,
    cropType: filters.cropType || undefined,
    sortBy,
    sortOrder,
  };

  const { data: response, isLoading, isError, error } = useFarmersList(apiParams);

  const farmers = response?.data || [];
  const pagination = response?.meta || { page: 1, totalPages: 1 };

  // Farmer Role: auto-redirect if profile exists
  useEffect(() => {
    if (user && user.role !== 'admin' && farmers.length > 0) {
      // Find matching profile owned by current user
      const owned = farmers.find(f => f.userId?._id === (user._id || user.id) || f.userId === (user._id || user.id));
      if (owned) {
        navigate(`/profile/${owned._id}`, { replace: true });
      }
    }
  }, [farmers, user, navigate]);

  const handleEdit = (id) => {
    navigate(`/profile/edit/${id}`);
  };

  const handleDeleteTrigger = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        addToast('Farmer profile deleted successfully!', 'success');
        setDeleteOpen(false);
      },
      onError: (err) => {
        const message = err.response?.data?.message || err.message || 'Failed to delete farmer profile';
        addToast(message, 'error');
      },
    });
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset page on filter
  };

  const handleSearch = (query) => {
    setSearch(query);
    setPage(1); // Reset page on search
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === 'newest') {
      setSortBy('newest');
      setSortOrder('desc');
    } else if (value === 'oldest') {
      setSortBy('oldest');
      setSortOrder('asc');
    } else if (value === 'landSize') {
      setSortBy('landSize');
      setSortOrder('desc');
    } else if (value === 'annualIncome') {
      setSortBy('annualIncome');
      setSortOrder('desc');
    }
    setPage(1);
  };

  // If farmer has no profile, show Empty State CTA
  if (user && user.role !== 'admin' && !isLoading && farmers.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          title="Setup Your Farm Profile"
          description="You haven't configured your farm metrics yet. Setup your profile now to gain access to crop assessments, APMC trends, and scheme matches."
          actionLabel="Configure Farm Profile"
          onAction={() => navigate('/profile/new')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-foreground text-left">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isAdmin ? 'Farmer Profiles Directory' : 'My Farm Workspace'}
          </h1>
          <p className="text-sm text-muted-foreground font-semibold">
            {isAdmin
              ? 'Search, filter, edit, or delete active agricultural records in the system database.'
              : 'Access your structural logs, financial parameters, and coordinates.'}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => navigate('/profile/new')}
            variant="primary"
            className="flex items-center gap-1.5 font-bold rounded-xl shadow-md py-2.5"
          >
            <Plus className="w-5 h-5" /> Add New Farmer
          </Button>
        )}
      </div>

      {/* Grid container with Filters + Search/List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Toggle Filters sidebar */}
        <div className={`lg:col-span-1 space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <FilterPanel onFilter={handleFilter} currentFilters={filters} />
        </div>

        {/* Content list columns */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:max-w-md">
              <SearchBar onSearch={handleSearch} />
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
                  onChange={handleSortChange}
                  className="px-3 py-1.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground text-xs font-semibold"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="landSize">Land Size (High-Low)</option>
                  <option value="annualIncome">Annual Income (High-Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loader states */}
          {isLoading && (
            <div className="space-y-6">
              <div className="hidden sm:block">
                <LoadingSkeleton type="table" count={5} />
              </div>
              <div className="sm:hidden">
                <LoadingSkeleton type="card" count={3} />
              </div>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="p-8 text-center bg-card border border-border border-dashed rounded-3xl">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Failed to load profiles</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4 font-semibold">
                {error.message || 'Check database connection. The API server may not be reachable.'}
              </p>
              <Button variant="outline" onClick={() => navigate(0)} className="text-xs">
                Retry Query
              </Button>
            </div>
          )}

          {/* Data List container */}
          {!isLoading && !isError && (
            <>
              {farmers.length === 0 ? (
                <EmptyState
                  title="No Farmers Found"
                  description="No matches match the search term or applied filters. Refine criteria and retry."
                />
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <FarmerTable farmers={farmers} onEdit={handleEdit} onDelete={handleDeleteTrigger} />
                  </div>

                  {/* Mobile Cards View */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                    {farmers.map((farmer) => (
                      <FarmerCard
                        key={farmer._id}
                        farmer={farmer}
                        onEdit={handleEdit}
                        onDelete={handleDeleteTrigger}
                      />
                    ))}
                  </div>

                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={setPage}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        farmerName={deleteName}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
