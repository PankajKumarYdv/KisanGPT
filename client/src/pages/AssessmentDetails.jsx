import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAssessmentDetail, useDeleteAssessment } from '../hooks/useAssessments.js';
import { useToast } from '../components/ui/Toast.jsx';
import { useDemoMode } from '../hooks/useDemoMode.js';
import { demoAssessments, demoFarmers, demoTimelineData } from '../mock/demoData.js';
import RiskChart from '../components/dashboard/RiskChart.jsx';
import RiskGauge from '../components/dashboard/RiskGauge.jsx';
import RiskBadge from '../components/ui/RiskBadge.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import DeleteModal from '../components/ui/DeleteModal.jsx';
import Button from '../components/ui/Button.jsx';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Edit, Trash2, Calendar, User, Leaf, CloudRain,
  DollarSign, TrendingDown, ShieldAlert, FileText, Cpu, BadgeCheck,
  MapPin, BarChart3, Printer, Download, Clock
} from 'lucide-react';

const RISK_DOMAINS = [
  { key: 'weatherRisk', label: 'Weather Risk', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { key: 'cropRisk', label: 'Crop Threat', icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  { key: 'financialRisk', label: 'Financial Risk', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-500/10' },
  { key: 'marketRisk', label: 'Market Volatility', icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-500/10' },
  { key: 'wellnessRisk', label: 'Farmer Wellness', icon: BadgeCheck, color: 'text-violet-600', bg: 'bg-violet-500/10' },
];

function RiskDomainBar({ label, value, color, bg, icon: Icon }) {
  const barColor =
    value >= 75 ? 'bg-red-500' :
    value >= 50 ? 'bg-amber-500' :
    value >= 25 ? 'bg-yellow-400' :
    'bg-emerald-500';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <span className={`p-1 rounded-lg ${bg} ${color}`}>
            <Icon className="w-3.5 h-3.5" />
          </span>
          {label}
        </div>
        <span className="font-extrabold text-sm">{value ?? 'N/A'}%</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`${barColor} h-full rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(value || 0, 100)}%` }}
        />
      </div>
    </div>
  );
}

const getTimeline = (ass, isDemoId, id) => {
  if (isDemoId) {
    const farmerKey = Object.keys(demoAssessments).find(
      fid => demoAssessments[fid]._id === id || fid === id
    ) || 'demo-farmer-1';
    return demoTimelineData[farmerKey] || [];
  }

  // Generate dynamic plan from real values
  const list = [];
  const overall = ass.overallRisk || 0;
  const weather = ass.weatherRisk || 0;
  const crop = ass.cropRisk || 0;
  const financial = ass.financialRisk || 0;
  const market = ass.marketRisk || 0;

  if (weather >= 50) {
    list.push({ time: "Today", task: "Open drainage trenches to clear stagnant surface water.", priority: "High", savings: "₹15,000", yield: "+5%", impact: 85 });
  } else {
    list.push({ time: "Today", task: "Schedule morning sprinkler cycles at pre-dawn hours.", priority: "Low", savings: "₹2,000", yield: "+2%", impact: 40 });
  }

  if (crop >= 50) {
    list.push({ time: "Tomorrow", task: "Procure organic soil inputs and bio-fertilizers from local cooperative.", priority: "High", savings: "₹12,000", yield: "+8%", impact: 80 });
  } else {
    list.push({ time: "Tomorrow", task: "Perform visual soil moisture checks at three root zones.", priority: "Low", savings: "₹1,000", yield: "N/A", impact: 35 });
  }

  if (financial >= 50) {
    list.push({ time: "Next 7 Days", task: "Apply for low-interest NABARD refinancing to clear private high-debt loans.", priority: "Medium", savings: "₹45,000", yield: "N/A", impact: 90 });
  }

  if (market >= 50) {
    list.push({ time: "Next Month", task: "Secure forward pricing pre-purchases with cooperative APMC traders.", priority: "Medium", savings: "₹30,000", yield: "+10%", impact: 75 });
  }

  if (list.length < 2) {
    list.push({ time: "Next 7 Days", task: "Verify micro-drip networks for potential blockages.", priority: "Low", savings: "₹3,500", yield: "+3%", impact: 45 });
  }

  return list;
};

export default function AssessmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isDemoId = id?.startsWith('demo-');
  let activeAssessment = null;
  let activeFarmer = null;

  if (isDemoId) {
    const farmerKey = Object.keys(demoAssessments).find(
      fid => demoAssessments[fid]._id === id || fid === id
    ) || 'demo-farmer-1';
    activeAssessment = demoAssessments[farmerKey];
    activeFarmer = demoFarmers.find(f => f._id === farmerKey);
  }

  const { data: realAssessment, isLoading, isError } = useAssessmentDetail(isDemoId ? null : id);
  const deleteMutation = useDeleteAssessment();

  const assessment = isDemoId ? activeAssessment : realAssessment;

  const handleDelete = () => {
    if (isDemoId) {
      addToast('Demo reports cannot be deleted.', 'warning');
      setDeleteOpen(false);
      return;
    }
    deleteMutation.mutate(id, {
      onSuccess: () => {
        addToast('Assessment report deleted.', 'success');
        navigate('/assessment/history');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to delete assessment';
        addToast(message, 'error');
      },
    });
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(assessment, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `KisanGPT_Report_${id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('JSON configuration exported.', 'success');
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <LoadingSkeleton type="detail" />
      </div>
    );
  }

  if (isError || !assessment) {
    return (
      <div className="py-12">
        <EmptyState
          title="Assessment Not Found"
          description="This diagnostic report could not be located. It may have been deleted or the ID is invalid."
          actionLabel="Back to History"
          onAction={() => navigate('/assessment/history')}
        />
      </div>
    );
  }

  const farmerRef = isDemoId ? activeFarmer : (assessment.farmerId || {});
  const userRef = isDemoId ? { fullName: activeFarmer?.fullName } : (farmerRef.userId || {});
  const farmerName = isDemoId ? activeFarmer?.fullName : (userRef.fullName || 'N/A');

  const timelineData = getTimeline(assessment, isDemoId, id);

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/assessment/history')}
            className="p-2 border border-border rounded-xl hover:bg-muted transition-all focus:outline-none"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Diagnostic Report #{id?.substring(18) || id}
              {isDemoId && <span className="ml-2.5 text-[9px] bg-primary text-primary-foreground font-black px-2 py-0.5 rounded-lg uppercase tracking-wider">Demo Mode</span>}
            </h1>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">
              {assessment.createdAt
                ? new Date(assessment.createdAt).toLocaleString()
                : 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="flex items-center gap-1.5 text-xs font-bold rounded-xl focus:outline-none"
          >
            <Printer className="w-4 h-4" /> Print / PDF
          </Button>
          <Button
            onClick={handleExportJSON}
            variant="outline"
            className="flex items-center gap-1.5 text-xs font-bold rounded-xl focus:outline-none"
          >
            <Download className="w-4 h-4" /> Export JSON
          </Button>
          <Button
            onClick={() => navigate(`/assessment/edit/${id}`)}
            variant="outline"
            className="flex items-center gap-1.5 text-xs font-bold rounded-xl focus:outline-none"
            disabled={isDemoId}
          >
            <Edit className="w-4 h-4" /> Edit
          </Button>
          <Button
            onClick={() => setDeleteOpen(true)}
            variant="danger"
            className="flex items-center gap-1.5 text-xs font-bold rounded-xl focus:outline-none"
            disabled={isDemoId}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Top Info Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Farmer Profile */}
        <div className="p-4 bg-card border border-border rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Farmer</p>
            <p className="text-sm font-extrabold truncate">{farmerName}</p>
            <p className="text-[10px] text-muted-foreground">{farmerRef.farmName}</p>
          </div>
        </div>

        {/* Location */}
        <div className="p-4 bg-card border border-border rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Location</p>
            <p className="text-sm font-extrabold">{farmerRef.village || 'N/A'}</p>
            <p className="text-[10px] text-muted-foreground">{farmerRef.district}, {farmerRef.state}</p>
          </div>
        </div>

        {/* Status */}
        <div className="p-4 bg-card border border-border rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Report Status</p>
            <StatusBadge status={assessment.assessmentStatus} />
            <p className="text-[10px] text-muted-foreground mt-0.5">Overall: <strong>{assessment.overallRisk}%</strong></p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composite Risk Gauge */}
        <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 flex flex-col items-center justify-between">
          <div className="w-full">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Composite Risk Score</p>
          </div>
          <RiskGauge risk={assessment.overallRisk} />
          <div className="w-full text-center">
            <RiskBadge risk={assessment.overallRisk} />
          </div>
        </div>

        {/* Radar Breakdown */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Multi-Domain Risk Breakdown</p>
            <p className="text-xs text-muted-foreground mt-1">Radar of all threat vectors — lower is safer.</p>
          </div>
          <RiskChart type="radar" assessment={assessment} />
        </div>
      </div>

      {/* Risk Domain Bars */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="font-extrabold text-base">Individual Domain Risk Levels</h2>
        </div>
        <div className="space-y-5">
          {RISK_DOMAINS.map(({ key, label, icon, color, bg }) => (
            <RiskDomainBar
              key={key}
              label={label}
              value={assessment[key]}
              icon={icon}
              color={color}
              bg={bg}
            />
          ))}
        </div>
      </div>

      {/* Chronological Action Plan Timeline */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 page-break">
        <div className="flex justify-between items-center border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-extrabold text-base">Mitigation Action Plan Timeline</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Chronological execution steps computed by KisanGPT multi-agent framework.</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-wider">
            {timelineData.length} steps
          </span>
        </div>

        <div className="relative pl-6 border-l-2 border-primary/20 space-y-8 py-2">
          {timelineData.map((item, index) => {
            const priorityColors = 
              item.priority === 'High' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' :
              item.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';

            return (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.12 }}
                className="relative space-y-2 text-left"
              >
                {/* Connector dot */}
                <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </span>

                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-black uppercase tracking-widest text-primary">{item.time}</span>
                  <span className={`px-2 py-0.5 border rounded text-[9px] font-black uppercase tracking-wider ${priorityColors}`}>
                    {item.priority} Priority
                  </span>
                  {item.savings && item.savings !== 'N/A' && (
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[9px] font-bold">
                      Savings: {item.savings}
                    </span>
                  )}
                  {item.yield && item.yield !== 'N/A' && (
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[9px] font-bold">
                      Yield: {item.yield}
                    </span>
                  )}
                </div>

                <p className="text-xs text-foreground font-semibold leading-relaxed">
                  {item.task}
                </p>

                <div className="flex items-center gap-2.5 mt-2.5">
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden max-w-[120px]">
                    <div 
                      className="bg-primary h-full rounded-full" 
                      style={{ width: `${item.impact}%` }} 
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground font-bold">Impact: {item.impact}/100</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Advisory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 page-break">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="font-extrabold text-base">Risk Summary</h2>
          </div>
          <div className="bg-muted/30 border border-border p-4 rounded-xl text-sm leading-relaxed text-muted-foreground font-semibold">
            {assessment.summary || 'No summary available for this assessment.'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-emerald-500/5 border border-primary/20 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h2 className="font-extrabold text-base">Agronomist Recommendation</h2>
          </div>
          <div className="text-sm leading-relaxed text-foreground/80 font-semibold">
            {assessment.recommendation ||
              'No recommendation generated. Complete all risk fields to receive AI-powered agronomic advisory.'}
          </div>
        </div>
      </div>

      {/* Metadata Footer */}
      <div className="p-4 bg-muted/20 border border-border rounded-2xl text-[10px] text-muted-foreground font-semibold flex flex-wrap gap-4 justify-between">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          Created: {assessment.createdAt ? new Date(assessment.createdAt).toLocaleString() : 'N/A'}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          Updated: {assessment.updatedAt ? new Date(assessment.updatedAt).toLocaleString() : 'N/A'}
        </span>
        <span className="font-mono opacity-70">ID: {assessment._id}</span>
      </div>

      <DeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Diagnostic Report"
        description="This action is permanent. The assessment and associated agent logs will be removed from the database."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
