import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Sprout,
  ShieldCheck,
  TrendingUp,
  Landmark,
  ArrowRight,
  ChevronRight,
  CloudSun,
  UserCheck,
  Cpu,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      title: "Weather Risk Guard",
      desc: "Anticipate localized storms, frosts, and monsoon anomalies. Protect grapes, wheat, or sugarcane before damage hit.",
      icon: CloudSun,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Mandi Price Intel",
      desc: "Instant commodity trackers with predictive scenario graphs. Identify peak prices to sell your crops for maximum margins.",
      icon: TrendingUp,
      color: "text-green-500 bg-green-50 dark:bg-green-950/20"
    },
    {
      title: "Scheme Matcher",
      desc: "Automatically checks land coordinates and crops to match regional subsidies, diesel credits, or crop drip irrigation loans.",
      icon: Landmark,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20"
    },
    {
      title: "Crop Health Shields",
      desc: "Early pest advisory warnings. Detect signs of yellow rust, downy mildew, and match with government chemical guidelines.",
      icon: Sprout,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
    }
  ];

  const agentSteps = [
    { title: "Data Harvesting Agent", desc: "Monitors regional soil moisture, localized weather cells, and mandis." },
    { title: "Risk Estimator Agent", desc: "Projects probability matrices on harvest volumes and crop infections." },
    { title: "Advisory Action Agent", desc: "Constructs direct localized checklists for pest treatments and crop sales." }
  ];

  const faqs = [
    { q: "How does KisanGPT predict market mandi prices?", a: "We aggregate historical APMC pricing data, crop sowing volume reports, and trade patterns to model commodity pricing under low rain, normal supply, or import scenarios." },
    { q: "What parameters are checked under risk assessments?", a: "We assess financial debt burdens, multi-day weather anomaly trends, satellite-derived vegetation indices (soil moisture), and wellness indices to calculate overall farm risks." },
    { q: "Are advisory alerts compliant with organic standards?", a: "Yes. Advisories separate organic treatments and chemical guidelines as notified by the Department of Agriculture." }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="space-y-24 py-6 text-foreground">
      {/* 1. Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center gap-12 min-h-[60vh] max-w-6xl mx-auto px-4">
        <div className="flex-1 space-y-6 text-left">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-primary dark:text-emerald-400"
          >
            <Cpu className="w-4 h-4" /> Version 1.0 Live: Multi-Agent Ag-Intel
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight"
          >
            KisanGPT helps farmers make <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">smarter decisions</span> with AI.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-xl"
          >
            Empower your farm with autonomous AI agents that analyze soil conditions, forecast market mandi rates, and shield crops against sudden weather crises.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to={isAuthenticated ? "/dashboard" : "/signup"}
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:bg-opacity-95 flex items-center gap-2 transition-all group"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="px-6 py-3 border border-border bg-card font-bold rounded-xl shadow-sm hover:bg-muted transition-all"
            >
              Explore Features
            </a>
          </motion.div>
        </div>

        {/* Hero Interactive Illustration / Screenshot Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 w-full max-w-md relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-emerald-500/10 rounded-3xl filter blur-xl -z-10"></div>
          <div className="bg-card border border-border p-6 rounded-3xl shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              </div>
              <span className="text-xs text-muted-foreground font-bold">KisanGPT Agent Workspace</span>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 items-start bg-muted/40 p-3.5 rounded-xl border border-border">
                <Cpu className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">Advisory Agent</h4>
                  <p className="text-xs text-muted-foreground">"Weather risk for Amritsar wheat is high due to pre-monsoon shower prediction on 26th. Advise delaying harvest to 29th."</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start bg-muted/40 p-3.5 rounded-xl border border-border">
                <TrendingUp className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">Market Price Agent</h4>
                  <p className="text-xs text-muted-foreground">"Wheat MSP currently ₹2275. Khanna Mandi averages ₹2180. Hold stock for prediction peak in July."</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. Farmer Success Metrics */}
      <section className="bg-card border-y border-border py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { metric: "₹45K+", label: "Avg. Profit Increase/Acre" },
            { metric: "15,000+", label: "Farmers Empowered" },
            { metric: "92%", label: "Accuracy on Pest Alerts" },
            { metric: "35 Sec", label: "Avg. Risk Assessment Time" }
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-3xl md:text-4xl font-extrabold text-primary">{item.metric}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight">Coordinated intelligence to shield your farm.</h2>
          <p className="text-muted-foreground text-sm">Every feature is powered by specialized agents that pull parameters in real-time, working together to present a unified action plan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, index) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                className="bg-card border border-border p-6 rounded-2xl shadow-sm flex gap-4 items-start text-left"
              >
                <div className={`p-3 rounded-xl ${f.color} flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. AI Multi-Agent How It Works */}
      <section className="max-w-5xl mx-auto px-4 bg-muted/20 border border-border p-8 rounded-3xl space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold">Autonomous Multi-Agent Workflow</h2>
          <p className="text-sm text-muted-foreground">How KisanGPT coordinates behind the scenes</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-between relative">
          {agentSteps.map((step, idx) => (
            <div key={idx} className="flex-1 bg-card border border-border p-5 rounded-2xl relative z-10 text-left">
              <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md">
                {idx + 1}
              </span>
              <h4 className="font-bold text-sm mt-2 mb-1">{step.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Testimonial Section */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-8">
        <h2 className="text-2xl font-extrabold">Success Stories</h2>
        <div className="bg-card border border-border p-8 rounded-3xl shadow-sm relative">
          <p className="text-lg italic leading-relaxed text-muted-foreground">
            "KisanGPT weather alert warned us of early rainfall in Amritsar 48 hours before our neighborhood harvested. We brought the crop in and saved over ₹3 Lakhs in wheat spoiling. The market prediction prices also help us decide when to sell."
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <img
              src="https://api.dicebear.com/7.x/adventurer/svg?seed=Gurpreet"
              alt="Farmer Gurpreet"
              className="w-11 h-11 rounded-full border border-primary/20 bg-primary/5"
            />
            <div className="text-left">
              <h4 className="font-bold text-sm text-foreground">Gurpreet Singh</h4>
              <p className="text-xs text-muted-foreground">Wheat Farmer, Amritsar (Punjab)</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 space-y-8">
        <h2 className="text-3xl font-extrabold text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-border bg-card rounded-2xl overflow-hidden text-left">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-4 flex justify-between items-center font-semibold text-sm hover:bg-muted/30 transition-all focus:outline-none"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-border"
                  >
                    <p className="px-6 py-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Call To Action (CTA) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-r from-primary to-emerald-600 text-white rounded-3xl p-10 md:p-12 text-center space-y-6 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Ready to optimize your crop yields?</h2>
          <p className="text-white/80 max-w-xl mx-auto text-sm leading-relaxed">
            Create your farm profile in under 2 minutes. Get direct alerts, instant risk evaluations, and APMC predictions.
          </p>
          <div className="pt-2">
            <Link
              to={isAuthenticated ? "/dashboard" : "/signup"}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary font-bold rounded-xl shadow-lg hover:bg-neutral-50 transition-all group"
            >
              {isAuthenticated ? "Go to Dashboard" : "Register Your Farm Profile"}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
