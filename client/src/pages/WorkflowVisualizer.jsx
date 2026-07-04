import React from 'react';
import { motion } from 'framer-motion';
import { useDemoMode } from '../hooks/useDemoMode.js';
import { useCurrentFarmer } from '../hooks/useFarmers.js';
import { useAssessmentsList } from '../hooks/useAssessments.js';
import {
  User,
  Cpu,
  Landmark,
  CloudSun,
  Sprout,
  FileSpreadsheet,
  TrendingUp,
  ShieldCheck,
  Heart,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle,
  Activity
} from 'lucide-react';

export default function WorkflowVisualizer() {
  const { isDemo, currentFarmer, currentAssessment } = useDemoMode();
  const { data: realFarmer } = useCurrentFarmer();
  const { data: realAssessmentsResponse } = useAssessmentsList(realFarmer?._id ? { farmerId: realFarmer._id } : {});
  
  const activeFarmer = isDemo ? currentFarmer : realFarmer;
  const activeAssessments = isDemo ? [currentAssessment] : (realAssessmentsResponse?.data || []);
  const latestAssessment = activeAssessments[0] || null;

  // Pre-compiled agent telemetry metrics
  const agentDetails = {
    FinancialAgent: {
      name: "Financial Agent",
      icon: Landmark,
      desc: "Computes Debt-to-Income and credit risk classification.",
      latency: isDemo ? "1,240ms" : "1,450ms",
      confidence: isDemo ? `${latestAssessment?.financialRiskScore ? 100 - latestAssessment.financialRiskScore : 85}%` : "95%",
      status: "Online",
      color: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-600 dark:text-blue-400"
    },
    WeatherAgent: {
      name: "Weather Agent",
      icon: CloudSun,
      desc: "Fetches live coordinates from OpenWeatherMap & dispatches DB alerts.",
      latency: isDemo ? "820ms" : "980ms",
      confidence: isDemo ? "90%" : "95%",
      status: "Online",
      color: "from-sky-500/20 to-sky-600/5 border-sky-500/30 text-sky-600 dark:text-sky-400"
    },
    CropAgent: {
      name: "Crop Suitability Agent",
      icon: Sprout,
      desc: "Validates crop health indices and evaluates soil type matches.",
      latency: isDemo ? "950ms" : "1,120ms",
      confidence: isDemo ? "92%" : "95%",
      status: "Online",
      color: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
    },
    GovernmentSchemeAgent: {
      name: "Gov Scheme Agent",
      icon: FileSpreadsheet,
      desc: "Filters public agriculture welfare eligibility matrices.",
      latency: isDemo ? "610ms" : "750ms",
      confidence: isDemo ? "95%" : "98%",
      status: "Online",
      color: "from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-600 dark:text-purple-400"
    },
    MarketAgent: {
      name: "Market Pricing Agent",
      icon: TrendingUp,
      desc: "Queries real APMC rates from data.gov.in and generates profit matrices.",
      latency: isDemo ? "1,520ms" : "1,880ms",
      confidence: isDemo ? `${latestAssessment?.priceScore || 88}%` : "92%",
      status: "Online",
      color: "from-green-500/20 to-green-600/5 border-green-500/30 text-green-600 dark:text-green-400"
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const nodeVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="space-y-8 text-left text-foreground">
      {/* Welcome & Title */}
      <div className="bg-gradient-to-r from-primary/10 to-indigo-500/5 border border-primary/20 p-8 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">AI Multi-Agent DAG Workflow</h1>
          <p className="text-sm text-muted-foreground font-semibold">
            Chronological visualization of KisanGPT's orchestration pipeline and specialist execution loops.
          </p>
        </div>
        <div className="px-3.5 py-1.5 bg-card border border-border rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-primary animate-pulse" />
          DAG Status: <span className="text-primary font-black">Active (8 Nodes)</span>
        </div>
      </div>

      {!activeFarmer && (
        <div className="p-8 bg-card border border-border rounded-2xl text-center">
          <p className="text-sm text-muted-foreground">Please select a farmer profile or enable Demo Mode to view workflow telemetry.</p>
        </div>
      )}

      {activeFarmer && (
        <motion.div 
          className="space-y-12 relative pb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Node 1: Input Profile */}
          <motion.div className="flex flex-col lg:flex-row items-center gap-6" variants={nodeVariants}>
            <div className="w-full lg:w-1/3 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">Input Node: Farmer Profile</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Trigger</p>
                </div>
              </div>
              <div className="text-xs space-y-2 border-t border-border pt-3">
                <p><span className="text-muted-foreground">Name:</span> <strong className="float-right">{activeFarmer.fullName}</strong></p>
                <p><span className="text-muted-foreground">Crop:</span> <strong className="float-right">{activeFarmer.cropType}</strong></p>
                <p><span className="text-muted-foreground">Location:</span> <strong className="float-right">{activeFarmer.district}, {activeFarmer.state}</strong></p>
                <p><span className="text-muted-foreground">Land Size:</span> <strong className="float-right">{activeFarmer.landSize} Acres</strong></p>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center justify-center text-muted-foreground">
              <ArrowRight className="w-8 h-8 animate-pulse text-primary" />
            </div>

            {/* Node 2: Orchestrator */}
            <div className="w-full lg:w-1/2 bg-card border border-primary/30 bg-gradient-to-r from-primary/5 to-transparent p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary text-primary-foreground rounded-xl">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-primary">Pipeline Orchestrator</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Router & DAG Manager</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Initializes context, validates farmer inputs, reads capability registry indexes, and fires 5 independent specialist execution runs in parallel.
              </p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-[10px] font-bold">Parallel: Yes</span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-[10px] font-bold">Max Workers: 8</span>
              </div>
            </div>
          </motion.div>

          {/* Node 3: Specialist Agent Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {Object.keys(agentDetails).map((key) => {
              const agent = agentDetails[key];
              const Icon = agent.icon;
              return (
                <motion.div 
                  key={key} 
                  className={`p-5 bg-card border rounded-2xl shadow-sm space-y-3 flex flex-col justify-between bg-gradient-to-b ${agent.color}`}
                  variants={nodeVariants}
                >
                  <div className="space-y-2">
                    <div className="p-2.5 bg-card border border-border rounded-xl w-fit">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-black text-xs text-foreground">{agent.name}</h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{agent.desc}</p>
                  </div>
                  <div className="border-t border-border pt-2 text-[10px] space-y-1.5 font-bold">
                    <p className="flex justify-between"><span className="text-muted-foreground">Latency:</span> <span>{agent.latency}</span></p>
                    <p className="flex justify-between"><span className="text-muted-foreground">Confidence:</span> <span>{agent.confidence}</span></p>
                    <p className="flex justify-between"><span className="text-muted-foreground">Status:</span> <span className="text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {agent.status}</span></p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Node 4: Synthesis & Output Generation */}
          <motion.div className="flex flex-col lg:flex-row items-center gap-6" variants={nodeVariants}>
            {/* Risk Assessment */}
            <div className="w-full lg:w-1/3 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-xs">Risk Assessment Node</h4>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Aggregates soil, weather limits, APMC margins, and credit loan metrics to compute the overall farm risk score.
              </p>
              <p className="text-xs font-black text-rose-500 mt-2">Score: {latestAssessment?.overallRisk || 50}%</p>
            </div>

            <div className="hidden lg:flex items-center justify-center text-muted-foreground">
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
            </div>

            {/* Wellness Advisor */}
            <div className="w-full lg:w-1/3 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-pink-500/10 text-pink-500 rounded-xl">
                  <Heart className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-xs">Wellness & Stress Analyzer</h4>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Evaluates debt burdens against crop failures to identify stress metrics and suggest direct counseling tools.
              </p>
              <p className="text-xs font-black text-pink-500 mt-2">Index: {latestAssessment?.wellnessScore || 50}/100</p>
            </div>

            <div className="hidden lg:flex items-center justify-center text-muted-foreground">
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
            </div>

            {/* Action Planner */}
            <div className="w-full lg:w-1/3 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-xs">Action Plan Generator</h4>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Translates agricultural risk warnings into immediate daily, weekly, and seasonal actionable timelines.
              </p>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[9px] font-bold">Timeline Built: Yes</span>
            </div>
          </motion.div>

          {/* Node 5: Final Recommendation Output */}
          <motion.div className="w-full bg-card border-2 border-primary/40 bg-gradient-to-r from-primary/10 to-indigo-500/5 p-6 rounded-3xl shadow-md space-y-4" variants={nodeVariants}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-primary to-indigo-500 text-primary-foreground rounded-2xl shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-foreground">Synthesis Node: Final Recommendation</h3>
                  <p className="text-[10px] text-muted-foreground font-semibold">Gemini Generative Output</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Total Latency: {isDemo ? "2,180ms" : "2,540ms"}
              </div>
            </div>
            
            <div className="bg-card border border-border p-5 rounded-2xl text-xs leading-relaxed text-muted-foreground font-medium">
              {latestAssessment?.recommendation || "Run a diagnostics report to construct Gemini generative advisory output."}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
