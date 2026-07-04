import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCurrentFarmer } from '../hooks/useFarmers.js';
import { useAssessmentsList } from '../hooks/useAssessments.js';
import { useAuth } from '../context/AuthContext.jsx';
import RiskGauge from '../components/dashboard/RiskGauge.jsx';
import RiskChart from '../components/dashboard/RiskChart.jsx';
import AssessmentTimeline from '../components/dashboard/AssessmentTimeline.jsx';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Button from '../components/ui/Button.jsx';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ShieldAlert, Cpu, History, Plus, ArrowUpRight, TrendingUp, PlayCircle, ShieldCheck, FileText, ChevronRight } from 'lucide-react';

export default function Assessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: farmer, isLoading: farmerLoading } = useCurrentFarmer();

  const farmerId = farmer?._id;
  const isAdmin = user?.role === 'admin';

  // Fetch assessments (if admin, retrieve all; if farmer, retrieve for their profile)
  const apiParams = isAdmin ? {} : { farmerId };
  const { data: response, isLoading: assessmentsLoading } = useAssessmentsList(apiParams);

  const assessments = response?.data || [];
  const latestAssessment = assessments[0];

  const handleCreate = () => {
    navigate('/assessment/new');
  };

  const handleHistory = () => {
    navigate('/assessment/history');
  };

  const isLoading = farmerLoading || assessmentsLoading;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <LoadingSkeleton type="detail" />
      </div>
    );
  }

  // If farmer has no profile
  if (user && user.role !== 'admin' && !farmer) {
    return (
      <div className="py-12">
        <EmptyState
          title="Configure Farm Profile First"
          description="Assessments require geographical coordinates and cropping parameters. Setup your farm profile first."
          actionLabel="Create Profile"
          onAction={() => navigate('/profile')}
        />
      </div>
    );
  }

  // If there are no assessments in the database
  if (assessments.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          title="No Diagnostic Assessments Yet"
          description="Initiate your first farm diagnostic report to trace weather, soil moisture, pest, and financial risk threats."
          actionLabel="Initiate Diagnostics"
          onAction={handleCreate}
          icon={Cpu}
        />
      </div>
    );
  }

  // Plot historical risk values chronologically (oldest to newest)
  const historicalData = assessments
    .slice()
    .reverse()
    .map((a) => ({
      date: new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      Overall: a.overallRisk,
      Weather: a.weatherRisk,
      Crop: a.cropRisk,
    }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-foreground text-left">
      {/* Welcome & CTAs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/15 to-emerald-500/5 border border-primary/20 p-6 md:p-8 rounded-3xl shadow-sm">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight">Farm Diagnostics & Risk Hub</h1>
          <p className="text-sm text-muted-foreground font-semibold">
            Evaluate composite agricultural risk parameters using automated agent logs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleHistory}
            variant="outline"
            className="flex items-center gap-1.5 font-bold rounded-xl shadow-sm"
          >
            <History className="w-4 h-4" /> History Logs
          </Button>
          <Button
            onClick={handleCreate}
            variant="primary"
            className="flex items-center gap-1.5 font-bold rounded-xl shadow-md"
          >
            <Plus className="w-4 h-4" /> Run Diagnostics
          </Button>
        </div>
      </div>

      {/* Primary Row: Gauge and Radar Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Composite Risk Gauge Card */}
        <div className="md:col-span-1 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground">Composite risk Score</h3>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Reflected from the latest diagnostics audit (#{latestAssessment._id.substring(18)}).
            </p>
          </div>
          <RiskGauge risk={latestAssessment.overallRisk} />
          <div className="bg-muted/40 p-3 rounded-xl border border-border/80 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground font-bold">Status:</strong> {latestAssessment.summary}
          </div>
        </div>

        {/* Detailed Risk Breakdown Card */}
        <div className="md:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground">Detailed Risk Breakdown</h3>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Multi-dimensional threats plotted by diagnostic subjects.
            </p>
          </div>
          <RiskChart type="radar" assessment={latestAssessment} />
        </div>
      </div>

      {/* Secondary Row: Timeline and Historical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical Trend area graph */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Risk Trends Chart</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="overallGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Overall"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#overallGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Audit Timeline checklist */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Recent Audits</h3>
            <Link to="/assessment/history" className="text-xs text-primary font-bold hover:underline">
              View All
            </Link>
          </div>
          <AssessmentTimeline assessments={assessments.slice(0, 3)} />
        </div>
      </div>
    </div>
  );
}
