import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  BarChart3, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Lightbulb, 
  Droplet, 
  Hammer, 
  Layers,
  Bot,
  Activity,
  CheckSquare,
  TrendingUp,
  PlusCircle,
  Clock,
  Compass,
  FileSearch,
  Sliders,
  Check,
  Eye,
  Building
} from 'lucide-react';
import type { Complaint } from '../types';
import { ScrollReveal } from './ScrollReveal';

interface HomePageProps {
  complaints: Complaint[];
  onNavigate: (tab: string, complaintIdToTrack?: string, prefillCategory?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ complaints, onNavigate }) => {
  const [quickTrackId, setQuickTrackId] = useState('');

  // Compute metrics strictly from real stored database records
  const total = complaints.length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const underReview = complaints.filter(c => c.status === 'Under Review').length;
  const submitted = complaints.filter(c => c.status === 'Submitted').length;
  const hasDemo = complaints.some(c => c.isDemo);

  const categories = [
    { name: 'Road Damage', icon: AlertTriangle, desc: 'Potholes, cracks, and asphalt sinkage' },
    { name: 'Waste Management', icon: Trash2, desc: 'Overflowing dumpsters, debris & illegal dumping' },
    { name: 'Water Leakage', icon: Droplet, desc: 'Burst mains, pipeline leaks & standing pools' },
    { name: 'Streetlight', icon: Lightbulb, desc: 'Outages, flickering bulbs & damaged poles' },
    { name: 'Drainage', icon: Layers, desc: 'Clogged storm basins, culvert backups & flooding' },
    { name: 'Public Infrastructure', icon: Hammer, desc: 'Broken railings, sidewalk cracks & signage' },
  ];

  // 4 Core Capabilities Feature Cards
  const featureCards = [
    {
      id: 'ai-analysis',
      title: 'AI-Powered Complaint Analysis',
      desc: 'Gemini AI analyzes reported problems, suggests categories, and recommends an appropriate priority for human review.',
      icon: Bot,
      accent: 'from-cyan-500/20 to-blue-500/10',
      borderAccent: 'border-cyan-500/35',
      iconColor: 'text-cyan-300',
    },
    {
      id: 'tracking',
      title: 'Smart Complaint Tracking',
      desc: 'Track submitted complaints using a unique complaint ID and view their current status.',
      icon: Search,
      accent: 'from-indigo-500/20 to-violet-500/10',
      borderAccent: 'border-indigo-500/35',
      iconColor: 'text-indigo-300',
    },
    {
      id: 'insights',
      title: 'Community Insights',
      desc: 'Understand recurring community problems using insights derived from available complaint records.',
      icon: BarChart3,
      accent: 'from-violet-500/20 to-fuchsia-500/10',
      borderAccent: 'border-purple-500/35',
      iconColor: 'text-violet-300',
    },
    {
      id: 'admin',
      title: 'Transparent Administration',
      desc: 'Give administrators a central place to review complaints and update their progress.',
      icon: ShieldCheck,
      accent: 'from-emerald-500/20 to-teal-500/10',
      borderAccent: 'border-emerald-500/35',
      iconColor: 'text-emerald-300',
    },
  ];

  // 4 Steps for "From Report to Resolution"
  const workflowSteps = [
    {
      step: '01',
      title: 'Report',
      desc: 'Describe the local problem and provide its location.',
      icon: PlusCircle,
    },
    {
      step: '02',
      title: 'Analyze',
      desc: 'Gemini AI suggests a category, summary, and priority.',
      icon: Sparkles,
    },
    {
      step: '03',
      title: 'Review',
      desc: 'An administrator reviews the complaint and updates its status.',
      icon: CheckSquare,
    },
    {
      step: '04',
      title: 'Track',
      desc: "Follow the complaint's progress using its unique ID.",
      icon: Activity,
    },
  ];

  const recentComplaints = complaints.slice(0, 3);

  const handleQuickTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackId.trim()) {
      onNavigate('track', quickTrackId.trim().toUpperCase());
    } else {
      onNavigate('track');
    }
  };

  return (
    <div className="space-y-24 pb-28 overflow-x-hidden">
      {/* 1. HERO SECTION (EXACT 2-COLUMN LAYOUT WITH RIGHT-SLIDE DEMO HUB) */}
      <section className="relative pt-12 sm:pt-20 pb-8 overflow-hidden">
        {/* Subtle Ambient floating lighting glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[420px] bg-gradient-to-tr from-cyan-500/20 via-indigo-600/18 to-purple-600/22 rounded-full blur-[140px] pointer-events-none -z-0 animate-pulse-ambient" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Badge */}
              <div className="animate-hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-xs font-semibold text-cyan-200 border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.18)]">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Next-Generation Civic Intelligence</span>
              </div>

              {/* Large Heading */}
              <h1 className="animate-hero-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-balance">
                <span className="text-white block">Smarter Communities</span>
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent block">
                  Start With Us.
                </span>
              </h1>

              {/* Description */}
              <p className="animate-hero-desc text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed font-normal">
                Report local problems, understand community needs, and turn everyday concerns into actionable insights with AI.
              </p>

              {/* Buttons */}
              <div className="animate-hero-actions flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('report')}
                  className="btn-glass-primary px-7 py-3.5 text-sm font-bold text-white rounded-xl flex items-center gap-2.5 group cursor-pointer shadow-lg"
                >
                  <span>Report a Problem</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('explore')}
                  className="btn-glass-secondary px-7 py-3.5 text-sm font-bold text-slate-100 rounded-xl flex items-center gap-2.5 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-cyan-300" />
                  <span>Explore Complaints</span>
                </button>
              </div>

              {/* Trust & Transparency Note */}
              <div className="animate-hero-trust pt-2 flex items-center gap-2 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Responsible AI assistance • Transparent complaint tracking</span>
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE CIVIC HUB (SLIDES GENTLY FROM RIGHT) */}
            <div className="lg:col-span-5 relative animate-hero-visual-right">
              <div className="glass-panel rounded-3xl p-6 sm:p-7 relative overflow-hidden border border-white/20 shadow-2xl backdrop-blur-2xl space-y-5">
                
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-white/12">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-white">LIVE CIVIC HUB</span>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    DEMO EXAMPLE
                  </span>
                </div>

                {/* DEMO EXAMPLE COMPLAINT CARD */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/65 backdrop-blur-md border border-cyan-500/35 space-y-3.5 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-cyan-300">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-bold">Gemini AI Analysis</span>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/25 text-rose-200 border border-rose-500/40 font-bold tracking-wide">
                      Priority: Critical
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Complaint:</span>
                    <p className="text-sm font-bold text-white leading-snug">
                      Deep pothole causing vehicle tire blowouts on 5th Avenue
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-200 pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-slate-400 font-medium">Suggested Department:</span>
                      <span className="text-cyan-300 font-semibold text-right">Public Works & Road Maintenance</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                      <span className="text-slate-400 font-medium shrink-0">Recommended Action:</span>
                      <span className="text-slate-200 font-medium sm:text-right">Inspect the road and assess temporary safety measures</span>
                    </div>
                  </div>
                </div>

                {/* 4-Step Visual Progress Indicator */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Workflow Status Indicator
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 font-bold shadow-sm">
                      1. Intake
                    </div>
                    <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 font-bold shadow-sm">
                      2. AI Triage
                    </div>
                    <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/35 text-indigo-300 font-bold shadow-sm">
                      3. Review
                    </div>
                    <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/35 text-purple-300 font-bold shadow-sm">
                      4. Resolution
                    </div>
                  </div>
                </div>

                {/* Have a tracking number? Area with Track ID button */}
                <div className="pt-3.5 border-t border-white/12 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Search className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Have a tracking number?</span>
                  </div>
                  <button
                    onClick={() => onNavigate('track')}
                    className="btn-glass-primary px-3.5 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Track ID</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Honest Transparency Label */}
                <p className="text-[10px] text-slate-400 text-center italic">
                  *Sample demonstration record. Live complaints require administrator review prior to municipal dispatch.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CORE CAPABILITIES ("WHAT CAN CIVIC AI DO?") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Core Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">What Can CIVIC AI Do?</h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            One intelligent platform to help communities report, understand, and track local problems.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <ScrollReveal key={card.id} delay={idx * 120}>
                <div className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-7 space-y-4 border border-white/16 shadow-xl h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${card.accent} border ${card.borderAccent} flex items-center justify-center ${card.iconColor} shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white leading-snug">{card.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                      {card.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION: "FROM REPORT TO RESOLUTION" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">From Report to Resolution</h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            A transparent 4-stage lifecycle ensuring community problems are documented, prioritized, and acted upon.
          </p>
        </ScrollReveal>

        <div className="relative">
          {/* Horizontal connecting bar on desktop */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-1 bg-white/10 -translate-y-1/2 z-0 rounded-full" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <ScrollReveal key={step.step} delay={idx * 130}>
                  <div className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-7 space-y-4 border border-white/16 shadow-xl h-full flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-2xl font-extrabold text-cyan-400 tracking-wider">
                          {step.step}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/12 flex items-center justify-center text-cyan-300">
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    <div className="pt-2 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      Stage {idx + 1} of 4
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. REPORT A PROBLEM SECTION (DIRECT ACTION & QUICK CATEGORY LAUNCHER) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="glass-panel rounded-3xl p-7 sm:p-10 border border-white/16 shadow-2xl backdrop-blur-2xl space-y-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/12">
              <div>
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Citizen Reporting</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  Report a Problem in Your Neighborhood
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  Select an issue category to launch the complaint intake form with automated Gemini AI assistance.
                </p>
              </div>

              <button
                onClick={() => onNavigate('report')}
                className="btn-glass-purple px-6 py-3 rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer self-start sm:self-auto shadow-lg shrink-0"
              >
                <PlusCircle className="w-4 h-4 text-purple-200" />
                <span>Open Full Report Form</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <ScrollReveal key={cat.name} delay={idx * 70}>
                    <button
                      onClick={() => onNavigate('report', undefined, cat.name)}
                      className="w-full text-left glass-card glass-card-hover p-5 rounded-2xl group cursor-pointer border border-white/14 h-full flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="p-3 rounded-xl bg-white/5 border border-white/12 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/15 transition-all">
                            <Icon className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="font-bold text-white mt-3.5 text-sm group-hover:text-cyan-300 transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                          {cat.desc}
                        </p>
                      </div>
                    </button>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 5. EXPLORE COMPLAINTS SECTION (METRICS & ACTIVE REGISTRY PREVIEW) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="glass-panel rounded-3xl p-7 sm:p-10 border border-white/16 shadow-2xl backdrop-blur-2xl space-y-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/12">
              <div>
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Public Problem Explorer</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  Explore Community Registry
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  Browse real-time status updates and triage results across {total} logged complaints.
                </p>
              </div>

              <button
                onClick={() => onNavigate('explore')}
                className="btn-glass-secondary px-6 py-3 rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer self-start sm:self-auto shadow-md shrink-0"
              >
                <Search className="w-4 h-4 text-cyan-300" />
                <span>Search All Complaints</span>
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <ScrollReveal delay={50}>
                <div className="glass-card glass-card-hover rounded-2xl p-5 border border-white/14 shadow-lg">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Total Reports</span>
                  <p className="text-3xl sm:text-4xl font-extrabold text-white mt-2 font-mono tabular-nums">{total}</p>
                  <span className="text-xs text-slate-400 mt-1 block">Logged complaints</span>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={120}>
                <div className="glass-card glass-card-hover rounded-2xl p-5 border border-sky-400/30 shadow-lg">
                  <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block">Under Review</span>
                  <p className="text-3xl sm:text-4xl font-extrabold text-sky-200 mt-2 font-mono tabular-nums">{underReview}</p>
                  <span className="text-xs text-slate-400 mt-1 block">Triage in progress</span>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={190}>
                <div className="glass-card glass-card-hover rounded-2xl p-5 border border-indigo-400/30 shadow-lg">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">In Progress</span>
                  <p className="text-3xl sm:text-4xl font-extrabold text-indigo-200 mt-2 font-mono tabular-nums">{inProgress}</p>
                  <span className="text-xs text-slate-400 mt-1 block">Field crews dispatched</span>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={260}>
                <div className="glass-card glass-card-hover rounded-2xl p-5 border border-emerald-400/30 shadow-lg">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">Resolved</span>
                  <p className="text-3xl sm:text-4xl font-extrabold text-emerald-200 mt-2 font-mono tabular-nums">{resolved}</p>
                  <span className="text-xs text-slate-400 mt-1 block">Verified community fixes</span>
                </div>
              </ScrollReveal>
            </div>

            {/* Recent Complaints Preview */}
            {recentComplaints.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                {recentComplaints.map((item, idx) => (
                  <ScrollReveal key={item.id} delay={idx * 100}>
                    <div
                      onClick={() => onNavigate('track', item.id)}
                      className="glass-card glass-card-hover rounded-2xl p-5 border border-white/12 space-y-3 cursor-pointer group flex flex-col justify-between h-full"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-cyan-300 font-bold">{item.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.status === 'Resolved'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : item.status === 'In Progress'
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                        <span className="truncate max-w-[170px] flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </span>
                        <span className="text-cyan-300 font-bold flex items-center gap-0.5">
                          Track <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      </section>

      {/* 6. TRACK COMPLAINT SECTION (DEDICATED LOOKUP STATION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="glass-panel rounded-3xl p-7 sm:p-10 border border-white/16 shadow-2xl backdrop-blur-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/12">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Complaint Tracker</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  Track Your Report Status
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  Enter your tracking code to view live milestone history, department assignments, and resolution notes.
                </p>
              </div>

              {/* Quick Tracking Search Form */}
              <form onSubmit={handleQuickTrackSubmit} className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
                <input
                  type="text"
                  value={quickTrackId}
                  onChange={(e) => setQuickTrackId(e.target.value)}
                  placeholder="e.g. CIVIC-2026-1042"
                  className="px-4 py-3 rounded-xl glass-input text-xs font-mono text-white placeholder-slate-400 min-w-[220px]"
                />
                <button
                  type="submit"
                  className="btn-glass-primary px-5 py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>Track Status</span>
                </button>
              </form>
            </div>

            {/* Quick Test Tracking Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="text-slate-400 font-semibold">Popular Tracking Codes:</span>
              {complaints.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  onClick={() => onNavigate('track', c.id)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 font-mono font-bold border border-white/12 cursor-pointer transition-colors"
                >
                  {c.id}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 7. ADMIN DASHBOARD SECTION (MUNICIPAL OPERATIONS OVERVIEW) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="glass-panel rounded-3xl p-7 sm:p-10 border border-white/16 shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/12">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Operations Control</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Municipal Administrator Dashboard
                </h2>
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  City coordinators and maintenance dispatchers evaluate incoming complaints, review Gemini AI recommendations, and advance resolution milestones with permanent audit history logs.
                </p>
              </div>

              <button
                onClick={() => onNavigate('admin')}
                className="btn-glass-primary px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center gap-2 cursor-pointer shadow-lg shrink-0 self-start lg:self-auto"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Open Admin Operations</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Operations Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 text-xs">
              <div className="glass-card rounded-2xl p-5 border border-white/12 space-y-2">
                <span className="font-bold text-cyan-300 text-sm block">1. AI Priority Triage</span>
                <p className="text-slate-300 leading-relaxed">
                  Incoming reports are triaged by Gemini 3.8 Flash, recommending safety risk classifications and department routing for human validation.
                </p>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-white/12 space-y-2">
                <span className="font-bold text-indigo-300 text-sm block">2. Duplicate Detection</span>
                <p className="text-slate-300 leading-relaxed">
                  Spatial and text clustering flags potential duplicate complaints in nearby neighborhoods, preventing redundant maintenance deployments.
                </p>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-white/12 space-y-2">
                <span className="font-bold text-emerald-300 text-sm block">3. Verifiable Milestones</span>
                <p className="text-slate-300 leading-relaxed">
                  Dispatchers transition complaints across Submitted, Under Review, In Progress, and Resolved with immutable timestamped action notes.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 8. FINAL CALL-TO-ACTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-cyan-400/30 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-purple-950/40 text-center space-y-6 shadow-2xl backdrop-blur-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-cyan-500/25 border border-white/20">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Ready to Make Your Neighborhood Smarter & Safer?
              </h2>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                Join proactive citizens improving local infrastructure with AI-assisted reporting and verifiable progress tracking.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('report')}
                className="btn-glass-purple px-8 py-3.5 text-sm font-bold text-white rounded-xl flex items-center gap-2 cursor-pointer shadow-xl"
              >
                <PlusCircle className="w-4 h-4 text-purple-200" />
                <span>Report a Problem Now</span>
              </button>

              <button
                onClick={() => onNavigate('track')}
                className="btn-glass-secondary px-8 py-3.5 text-sm font-bold text-slate-100 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4 text-cyan-300" />
                <span>Track an Existing Issue</span>
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};
