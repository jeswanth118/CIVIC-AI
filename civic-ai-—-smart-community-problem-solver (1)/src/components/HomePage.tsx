import React from 'react';
import { ParticleWaveBackground } from './ParticleWaveBackground';
import { PlusCircle, Search, ShieldCheck, Bot, ArrowRight } from 'lucide-react';
import type { Complaint } from '../types';

interface HomePageProps {
  complaints?: Complaint[];
  onNavigate: (tab: string, complaintIdToTrack?: string, prefillCategory?: string) => void;
}

/**
 * HomePage - CIVIC AI
 * Features:
 * 1. Animated Hero: Cinematic black background, flowing digital particle-wave animation,
 *    CIVIC AI branding, and supporting text (NO "Explore CIVIC AI" arrow button).
 * 2. "What Can CIVIC AI Do?" Section: Clean 4-capability grid explaining Report Problem,
 *    Explore Complaints, Administrative Dashboard, and AI Assistance.
 */
export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-[calc(100vh-68px)] flex flex-col items-center p-3 sm:p-6 lg:p-8 space-y-16 sm:space-y-24 overflow-hidden">
      {/* 1. CINEMATIC ANIMATED HERO (WITH SILVER-FRAMED LAYOUT & PARTICLE-WAVE CANVAS) */}
      <div className="cinematic-frame w-full max-w-[1440px] min-h-[72vh] sm:min-h-[78vh] relative flex flex-col justify-between overflow-hidden">
        {/* Dynamic Digital Particle-Wave Flowing Background */}
        <ParticleWaveBackground strandCount={38} nodeCount={52} />

        {/* Subtle Central Ambient Silver Lighting Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-white/4 rounded-full blur-[150px] pointer-events-none z-0" />

        {/* Top spacer inside frame */}
        <div className="pt-6 sm:pt-8 px-6 sm:px-14 lg:px-20" />

        {/* Minimal Hero Content (Clean & Spacious - NO Explore Arrow Button) */}
        <div className="relative z-10 px-6 sm:px-14 lg:px-20 py-12 sm:py-20 lg:py-24 max-w-3xl text-left">
          {/* Supporting Pre-Headline */}
          <div className="text-[11px] sm:text-xs font-mono font-medium tracking-[0.25em] text-neutral-400 uppercase mb-4 sm:mb-6">
            ARTIFICIAL INTELLIGENCE. COMMUNITY INTELLIGENCE.
          </div>

          {/* Headline: CIVIC AI */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.05] mb-5 font-heading">
            CIVIC AI
          </h1>

          {/* Supporting Line: Intelligence for stronger communities */}
          <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-neutral-200 tracking-tight mb-4 font-heading">
            Intelligence for stronger communities.
          </p>

          {/* Short Description */}
          <p className="text-sm sm:text-base text-neutral-400 max-w-[500px] leading-relaxed font-normal">
            Discover community issues. Turn awareness into action.
          </p>
        </div>

        {/* Bottom Frame Status Strip */}
        <div className="cinematic-frame-bottom-strip">
          <span className="text-neutral-400 font-medium">
            Technology connects. Community drives change.
          </span>
          <button
            onClick={() => {
              const el = document.getElementById('capabilities-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-neutral-300 hover:text-white tracking-wider font-mono text-[11px] uppercase transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>WHAT CAN CIVIC AI DO?</span>
            <span>↓</span>
          </button>
        </div>
      </div>

      {/* 2. "WHAT CAN CIVIC AI DO?" CAPABILITIES SECTION */}
      <section 
        id="capabilities-section" 
        className="w-full max-w-[1440px] px-4 sm:px-8 pt-4 pb-12"
      >
        <div className="text-left mb-10 sm:mb-12 space-y-2.5">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-heading tracking-tight">
            What Can CIVIC AI Do?
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl font-normal">
            One place to report community problems, explore local concerns, and access AI assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Capability 1: Report Community Problems */}
          <div className="glass-panel glass-panel-hover p-6 sm:p-7 rounded-2xl border border-white/12 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/12 flex items-center justify-center text-white">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                Report Community Problems
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Report problems affecting your community using the available reporting form.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('report')}
                className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Open reporting form</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Capability 2: Explore Complaints */}
          <div className="glass-panel glass-panel-hover p-6 sm:p-7 rounded-2xl border border-white/12 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/12 flex items-center justify-center text-white">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                Explore Complaints
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Browse available complaints and discover the issues being reported.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('explore')}
                className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Browse complaints</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Capability 3: Administrative Dashboard */}
          <div className="glass-panel glass-panel-hover p-6 sm:p-7 rounded-2xl border border-white/12 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/12 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                Administrative Dashboard
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Access the available complaint management and administrative tools.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('admin')}
                className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Access dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Capability 4: AI Assistance */}
          <div className="glass-panel glass-panel-hover p-6 sm:p-7 rounded-2xl border border-white/12 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/12 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                AI Assistance
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Use the available AI assistant to ask questions and receive AI-generated guidance.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('chatbot')}
                className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Ask AI assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default HomePage;
