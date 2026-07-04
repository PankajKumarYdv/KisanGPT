import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrentFarmer, useFarmersList } from '../hooks/useFarmers.js';
import { useAssessmentsList } from '../hooks/useAssessments.js';
import { useAlertsList } from '../hooks/useAlerts.js';
import { useDemoMode } from '../hooks/useDemoMode.js';
import { mockMarketData } from '../mock/market.js';
import { mockWeatherData } from '../mock/weather.js';
import { mockSchemes } from '../mock/schemes.js';
import {
  TrendingUp,
  CloudSun,
  ShieldAlert,
  Landmark,
  ArrowUpRight,
  Sprout,
  ChevronRight,
  AlertTriangle,
  Plus,
  Bell,
  FileText,
  Activity,
  Cpu,
  Heart,
  Droplet,
  Thermometer,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.jsx';
import RiskBadge from '../components/ui/RiskBadge.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-xl shadow-lg text-xs font-semibold text-foreground">
        <p className="font-bold border-b border-border pb-1 mb-1">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} style={{ color: item.color || item.fill }}>
            {item.name}: {item.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const getDemoWeather = (farmerId) => {
  switch (farmerId) {
    case 'demo-farmer-1':
      return { temp: 24, humidity: 95, wind: 18, pressure: 1002, moisture: '88%', summary: 'Heavy Rains & Storm Warning' };
    case 'demo-farmer-2':
      return { temp: 31, humidity: 45, wind: 10, pressure: 1010, moisture: '28%', summary: 'Dry Conditions' };
    case 'demo-farmer-3':
      return { temp: 28, humidity: 60, wind: 8, pressure: 1012, moisture: '55%', summary: 'Optimal Sunlight' };
    case 'demo-farmer-4':
      return { temp: 8, humidity: 85, wind: 22, pressure: 1018, moisture: '70%', summary: 'Impending Frost Wave' };
    case 'demo-farmer-5':
      return { temp: 38, humidity: 30, wind: 14, pressure: 1006, moisture: '40%', summary: 'High Evaporation Risk' };
    default:
      return { temp: 27, humidity: 65, wind: 12, pressure: 1011, moisture: '60%', summary: 'Normal Conditions' };
  }
};

const getDemoMarket = (farmerId) => {
  switch (farmerId) {
    case 'demo-farmer-1':
      return { price: '₹1,950', change: '-2.4%', volume: '12K Qtl', status: 'Declining Margin' };
    case 'demo-farmer-2':
      return { price: '₹3,200', change: '+1.5%', volume: '4.5K Qtl', status: 'Moderate Demand' };
    case 'demo-farmer-3':
      return { price: '₹8,500', change: '+5.8%', volume: '1.2K Qtl', status: 'Export Premium' };
    case 'demo-farmer-4':
      return { price: '₹3,400', change: '+0.5%', volume: '18K Qtl', status: 'Stable APMC Rate' };
    case 'demo-farmer-5':
      return { price: '₹2,550', change: '+8.2%', volume: '25K Qtl', status: 'Record High Volume' };
    default:
      return { price: '₹2,180', change: '+0.7%', volume: '8K Qtl', status: 'Stable' };
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDemo, currentFarmer, currentAssessment, currentAlerts, farmers } = useDemoMode();

  const { data: realFarmer, isLoading: farmerLoading } = useCurrentFarmer();
  const farmerId = realFarmer?._id;
  const isAdmin = user?.role === 'admin';

  // Fetch real assessments (scoped to farmer if not admin)
  const { data: assessmentsResponse, isLoading: assessmentsLoading } = useAssessmentsList(
    isDemo ? { enabled: false } : (isAdmin ? {} : farmerId ? { farmerId } : {})
  );
  // Fetch real alerts
  const { data: alertsResponse, isLoading: alertsLoading } = useAlertsList(
    isDemo ? { enabled: false } : (farmerId ? { farmerId } : {})
  );
  // Fetch all farmers for crop distribution
  const { data: farmersResponse } = useFarmersList(
    isDemo ? { enabled: false } : { limit: 100 }
  );

  const activeFarmer = isDemo ? currentFarmer : realFarmer;
  const assessments = isDemo ? (currentAssessment ? [currentAssessment] : []) : (assessmentsResponse?.data || []);
  
  // Read demo alert IDs from localStorage to compute dynamic count
  const [demoReadIds, setDemoReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem('kisangpt_demo_read_alerts');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('kisangpt_demo_read_alerts');
        setDemoReadIds(stored ? JSON.parse(stored) : []);
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const alerts = isDemo ? currentAlerts.filter(a => !demoReadIds.includes(a._id)) : (alertsResponse?.data || []);
  const unreadAlerts = isDemo ? alerts : alerts.filter((a) => !a.isRead);
  const latestAssessment = assessments[0] || null;
  const isLoading = isDemo ? false : (farmerLoading || assessmentsLoading || alertsLoading);

  // Compute overall risks
  const overallRisk = latestAssessment?.overallRisk || 0;
  const weatherRisk = latestAssessment?.weatherRisk || 0;
  const cropRisk = latestAssessment?.cropRisk || 0;

  // Build area chart data from recent assessments (oldest to newest)
  const historicalData = isDemo 
    ? [
        { date: 'May 1', 'Overall Risk': Math.max(10, overallRisk - 15), 'Weather Risk': Math.max(10, weatherRisk - 10), 'Crop Risk': Math.max(10, cropRisk - 5) },
        { date: 'May 15', 'Overall Risk': Math.max(10, overallRisk - 8), 'Weather Risk': Math.max(10, weatherRisk - 15), 'Crop Risk': Math.max(10, cropRisk - 12) },
        { date: 'Jun 1', 'Overall Risk': Math.max(10, overallRisk - 5), 'Weather Risk': Math.max(10, weatherRisk - 5), 'Crop Risk': Math.max(10, cropRisk + 5) },
        { date: 'Jun 15', 'Overall Risk': Math.max(10, overallRisk + 2), 'Weather Risk': Math.max(10, weatherRisk + 8), 'Crop Risk': Math.max(10, cropRisk - 2) },
        { date: 'Today', 'Overall Risk': overallRisk, 'Weather Risk': weatherRisk, 'Crop Risk': cropRisk },
      ]
    : assessments
        .slice()
        .reverse()
        .slice(-8)
        .map((a) => ({
          date: new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          'Overall Risk': a.overallRisk,
          'Weather Risk': a.weatherRisk,
          'Crop Risk': a.cropRisk,
        }));

  // Crop suitability calculation
  const activeFarmers = isDemo ? farmers : (farmersResponse?.data || []);
  const cropCounts = activeFarmers.reduce((acc, f) => {
    acc[f.cropType] = (acc[f.cropType] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(cropCounts).map(crop => ({
    name: crop,
    value: cropCounts[crop]
  }));
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  // Custom Telemetries
  const weatherTelemetry = isDemo 
    ? getDemoWeather(currentFarmer._id)
    : {
        temp: mockWeatherData.current.temp,
        humidity: 65,
        wind: 12,
        moisture: mockWeatherData.current.soilMoisture,
        summary: mockWeatherData.current.condition
      };

  const marketTelemetry = isDemo 
    ? getDemoMarket(currentFarmer._id)
    : {
        price: '₹2,180',
        change: '+0.7%',
        volume: '8.4K Qtl',
        status: 'Stable Mandi Rate'
      };

  // Agent statuses mapping
  const agentRuns = [
    { name: "Financial Agent", icon: Landmark, status: "Success", latency: isDemo ? "1,240ms" : "1,450ms", confidence: isDemo ? `${latestAssessment?.financialRiskScore ? 100 - latestAssessment.financialRiskScore : 85}%` : "95%", color: "text-blue-500 bg-blue-500/10" },
    { name: "Weather Agent", icon: CloudSun, status: "Success", latency: isDemo ? "820ms" : "980ms", confidence: isDemo ? "90%" : "95%", color: "text-sky-500 bg-sky-500/10" },
    { name: "Crop Agent", icon: Sprout, status: "Success", latency: isDemo ? "950ms" : "1,120ms", confidence: isDemo ? "92%" : "95%", color: "text-emerald-500 bg-emerald-500/10" },
    { name: "Gov Scheme Agent", icon: FileText, status: "Success", latency: isDemo ? "610ms" : "750ms", confidence: isDemo ? "95%" : "98%", color: "text-purple-500 bg-purple-500/10" },
    { name: "Market Agent", icon: TrendingUp, status: "Success", latency: isDemo ? "1,520ms" : "1,880ms", confidence: isDemo ? `${latestAssessment?.priceScore || 88}%` : "92%", color: "text-green-500 bg-green-500/10" }
  ];

  // Circular gauge setup
  const radius = 40;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallRisk / 100) * circumference;
  
  let riskColor = "stroke-emerald-500 text-emerald-500";
  let riskBgColor = "stroke-emerald-500/20";
  if (overallRisk >= 70) {
    riskColor = "stroke-red-500 text-red-500";
    riskBgColor = "stroke-red-500/20";
  } else if (overallRisk >= 35) {
    riskColor = "stroke-amber-500 text-amber-500";
    riskBgColor = "stroke-amber-500/20";
  }

  return (
    <div className="space-y-8 text-foreground text-left">
      {/* 1. Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 to-emerald-500/5 border border-primary/20 p-6 md:p-8 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome, {user ? user.fullName : 'Farmer'}!
            {isDemo && <span className="ml-2.5 text-xs bg-primary text-primary-foreground font-black px-2.5 py-1 rounded-xl shadow-sm uppercase tracking-widest">Demo Mode</span>}
          </h1>
          {activeFarmer ? (
            <p className="text-sm text-muted-foreground font-semibold">
              Farm:{' '}
              <strong className="text-foreground">{activeFarmer.farmName}</strong>{' '}
              ({activeFarmer.village}, {activeFarmer.district}, {activeFarmer.state})
            </p>
          ) : (
            <p className="text-sm text-muted-foreground font-semibold">
              No farm profile linked yet.{' '}
              <Link to="/profile/new" className="text-primary font-bold hover:underline">
                Create one now →
              </Link>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <span className="px-3.5 py-1.5 bg-card border border-border rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            Soil Sensor Sync: Online
          </span>
          <button
            onClick={() => navigate('/assessment/new')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow flex items-center gap-1.5 hover:opacity-90 transition-all focus:outline-none"
          >
            <Plus className="w-4 h-4" /> New Diagnostic
          </button>
        </div>
      </div>

      {/* 2. Live Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} type="card" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Circular Risk score card */}
          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Composite Risk</span>
              {latestAssessment ? (
                <div className="space-y-1">
                  <span className="text-2xl font-black">{overallRisk}%</span>
                  <div>
                    <RiskBadge risk={overallRisk} />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground font-semibold">No assessments yet</p>
              )}
            </div>
            
            {latestAssessment && (
              <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-95" viewBox="0 0 100 100">
                  <circle
                    className={riskBgColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className={`transition-all duration-500 ease-out ${riskColor}`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <ShieldAlert className={`w-4 h-4 ${overallRisk >= 70 ? 'text-red-500' : overallRisk >= 35 ? 'text-amber-500' : 'text-emerald-500'}`} />
                </div>
              </div>
            )}
          </div>

          {/* Weather sync telemetry */}
          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Weather Sync</span>
              <CloudSun className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex items-center gap-3">
              <div className="space-y-0.5">
                <p className="text-2xl font-black">{weatherTelemetry.temp}°C</p>
                <p className="text-[10px] text-muted-foreground font-bold leading-normal">
                  Moisture: {weatherTelemetry.moisture} • {weatherTelemetry.summary}
                </p>
              </div>
            </div>
            <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 py-1 px-2.5 rounded-lg inline-block">
              ⚡ OpenWeatherMap Live
            </div>
          </div>

          {/* Market Index telemetry */}
          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mandi Index</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-black">{marketTelemetry.price}</p>
              <p className="text-[10px] text-muted-foreground font-bold mt-1">
                Volume: {marketTelemetry.volume} • {marketTelemetry.status}
              </p>
            </div>
            <div className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 py-1 px-2.5 rounded-lg inline-flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> {marketTelemetry.change} Daily
            </div>
          </div>

          {/* Alerts Count */}
          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Alerts</span>
              <Bell className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-black">{unreadAlerts.length}</p>
              <p className="text-[10px] text-muted-foreground font-bold mt-1">
                Unread anomalies dispatched
              </p>
            </div>
            <Link
              to="/alerts"
              className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 py-1 px-2.5 rounded-lg inline-block hover:opacity-80 transition-all"
            >
              View All Alerts →
            </Link>
          </div>
        </div>
      )}

      {/* 3. Alerts Ribbon */}
      {unreadAlerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3.5 shadow-sm text-sm">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <p className="font-bold text-red-700 dark:text-red-400">
              Critical Warnings Active ({unreadAlerts.length})
            </p>
            <p className="text-xs text-muted-foreground">
              {unreadAlerts[0].title}: {unreadAlerts[0].description}
            </p>
          </div>
          <Link
            to="/alerts"
            className="text-xs font-bold text-red-600 hover:underline flex-shrink-0"
          >
            View All →
          </Link>
        </div>
      )}

      {/* 4. Analytics Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Trends Area Chart */}
        <div className="lg:col-span-2 p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-primary" />
            Farm Risk Trends (Live Diagnostics Timeline)
          </h3>
          {historicalData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashRiskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="Overall Risk"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#dashRiskGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Weather Risk"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="Crop Risk"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
              No assessment history yet.{' '}
              <Link to="/assessment/new" className="text-primary font-bold ml-1 hover:underline">
                Run diagnostics →
              </Link>
            </div>
          )}
        </div>

        {/* Crop Distribution Pie Chart */}
        <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-primary" />
            Crop Distribution ({isDemo ? "Demo Cohort" : "Live"})
          </h3>
          <div className="h-64 relative flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Farms`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground">No crop distribution data available.</p>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black">{activeFarmers.length}</span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Farms</span>
            </div>
          </div>
          {pieData.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center text-[10px] font-bold">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-muted-foreground">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Live Agent Monitor board */}
      <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-primary" />
            AI Execution Telemetry (Last Diagnostic Run)
          </h3>
          <Link to="/workflow" className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5">
            View Workflow DAG <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {agentRuns.map((agent) => {
            const Icon = agent.icon;
            return (
              <div key={agent.name} className="p-4 bg-muted/30 border border-border rounded-xl space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${agent.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="px-1.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-[9px] font-black uppercase tracking-wide">
                    {agent.status}
                  </span>
                </div>
                <div className="space-y-0.5 text-left">
                  <h4 className="font-bold text-[11px] truncate">{agent.name}</h4>
                  <p className="text-[10px] text-muted-foreground">Confidence: <span className="text-foreground font-bold">{agent.confidence}</span></p>
                  <p className="text-[10px] text-muted-foreground">Latency: <span className="text-foreground font-bold">{agent.latency}</span></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Bottom Split: AI Advisory & Recent Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Advisory Panel */}
        <div className="lg:col-span-2 p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex gap-2 items-center text-primary font-bold">
              <Zap className="w-5 h-5" />
              <h3 className="text-base text-foreground font-extrabold">Agronomic Advisory (Synthesis Output)</h3>
            </div>
            <div className="bg-muted/30 p-5 rounded-2xl border border-border text-xs leading-relaxed text-muted-foreground font-semibold">
              {latestAssessment?.recommendation ||
                'No diagnostic data available. Run a farm assessment to generate an AI-powered advisory.'}
            </div>
          </div>
          {latestAssessment && (
            <Link
              to={`/assessment/${latestAssessment._id}`}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-4"
            >
              <FileText className="w-3.5 h-3.5" /> View detailed Action Plan & Schemes →
            </Link>
          )}
        </div>

        {/* Recent Assessments List */}
        <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h3 className="font-bold text-sm text-foreground">Recent Reports</h3>
            <Link to="/assessment/history" className="text-xs text-primary font-bold hover:underline">
              View All
            </Link>
          </div>
          {assessments.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No reports yet.</p>
          ) : (
            <div className="space-y-4 relative pl-4 border-l border-border">
              {assessments.slice(0, 4).map((a) => (
                <div key={a._id} className="relative space-y-0.5">
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
                  <p className="text-[10px] text-muted-foreground font-bold">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                  <Link
                    to={`/assessment/${a._id}`}
                    className="text-xs font-bold hover:text-primary transition-colors block"
                  >
                    Report #{a._id.substring(18) || a._id}
                  </Link>
                  <div className="flex items-center gap-1.5">
                    <RiskBadge risk={a.overallRisk} />
                    <StatusBadge status={a.assessmentStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
