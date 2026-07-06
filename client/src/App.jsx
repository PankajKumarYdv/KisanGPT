import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Auth and UI Providers
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import GuestRoute from './components/common/GuestRoute.jsx';

// Layouts
import AppLayout from './components/layout/AppLayout.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

// Public Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Dashboard Pages
import Dashboard from './pages/Dashboard.jsx';
import FarmerProfile from './pages/FarmerProfile.jsx';
import AddFarmer from './pages/AddFarmer.jsx';
import EditFarmer from './pages/EditFarmer.jsx';
import FarmerDetailsPage from './pages/FarmerDetailsPage.jsx';

// Assessment Pages
import Assessment from './pages/Assessment.jsx';
import AssessmentHistory from './pages/AssessmentHistory.jsx';
import AssessmentDetails from './pages/AssessmentDetails.jsx';
import AddAssessment from './pages/AddAssessment.jsx';
import EditAssessment from './pages/EditAssessment.jsx';

// Other Pages
import MarketIntelligence from './pages/MarketIntelligence.jsx';
import GovernmentSchemes from './pages/GovernmentSchemes.jsx';
import Alerts from './pages/Alerts.jsx';
import Settings from './pages/Settings.jsx';
import WorkflowVisualizer from './pages/WorkflowVisualizer.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-muted-foreground animate-pulse">Initializing KisanGPT...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Layout Routes */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          
          {/* Guest Only Routes */}
          <Route element={<GuestRoute />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="registration" element={<Navigate to="/signup" replace />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          <Route path="unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Main Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="workflow" element={<WorkflowVisualizer />} />

            {/* Farmer Profile Management */}
            <Route path="profile" element={<FarmerProfile />} />
            <Route path="profile-edit" element={<FarmerProfile />} />
            <Route path="profile/new" element={<AddFarmer />} />
            <Route path="profile/edit/:id" element={<EditFarmer />} />
            <Route path="profile/:id" element={<FarmerDetailsPage />} />

            {/* Assessment Module */}
            <Route path="assessment" element={<Assessment />} />
            <Route path="assessment/history" element={<AssessmentHistory />} />
            <Route path="assessment/new" element={<AddAssessment />} />
            <Route path="assessment/edit/:id" element={<EditAssessment />} />
            <Route path="assessment/:id" element={<AssessmentDetails />} />

            {/* Other Modules */}
            <Route path="market" element={<MarketIntelligence />} />
            <Route path="schemes" element={<GovernmentSchemes />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
