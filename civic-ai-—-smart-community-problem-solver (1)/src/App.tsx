import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { ReportProblem } from './components/ReportProblem';
import { ComplaintExplorer } from './components/ComplaintExplorer';
import { TrackComplaint } from './components/TrackComplaint';
import { AdminDashboard } from './components/AdminDashboard';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { CivicChatbot } from './components/CivicChatbot';
import { ScrollReveal } from './components/ScrollReveal';
import type { Complaint, ComplaintStatus } from './types';
import { Building2, Sparkles, ShieldCheck, Heart, Bot, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [trackComplaintId, setTrackComplaintId] = useState<string | undefined>(undefined);
  const [prefillCategory, setPrefillCategory] = useState<string | undefined>(undefined);

  // Load complaints from the full-stack server
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      } else {
        console.error('Failed to fetch complaints from server');
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleNavigate = (tab: string, complaintIdToTrack?: string, prefillCat?: string) => {
    setCurrentTab(tab);
    if (complaintIdToTrack) {
      setTrackComplaintId(complaintIdToTrack);
    }
    if (prefillCat) {
      setPrefillCategory(prefillCat);
    } else {
      setPrefillCategory(undefined);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComplaintSubmitted = (newComplaint: Complaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
  };

  const handleUpdateStatus = async (id: string, newStatus: ComplaintStatus, note?: string) => {
    const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        note,
        updatedBy: 'Municipal Operations Dispatcher',
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to update status.');
    }

    const updated: Complaint = await res.json();
    setComplaints((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );

    if (selectedComplaint && selectedComplaint.id === updated.id) {
      setSelectedComplaint(updated);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans selection:bg-white/30 selection:text-black relative overflow-x-hidden pb-24">
      {/* Ambient Lighting Orbs for Frosted-Glass Depth */}
      <div className="fixed inset-0 pointer-events-none -z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[680px] h-[680px] bg-white/4 rounded-full blur-[160px] opacity-70 animate-pulse-ambient" />
        <div className="absolute top-1/4 -right-40 w-[750px] h-[750px] bg-white/4 rounded-full blur-[170px] opacity-70 animate-float-slow" />
        <div className="absolute top-2/3 left-1/4 w-[850px] h-[650px] bg-white/3 rounded-full blur-[180px] opacity-60 animate-pulse-ambient" />
      </div>

      {/* Top Glassmorphism Navigation */}
      <Navbar currentTab={currentTab} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {currentTab === 'home' && (
          <HomePage
            complaints={complaints}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'report' && (
          <ReportProblem
            initialCategory={prefillCategory}
            onComplaintSubmitted={handleComplaintSubmitted}
            onNavigateToTrack={(id) => handleNavigate('track', id)}
          />
        )}

        {currentTab === 'explore' && (
          <ComplaintExplorer
            complaints={complaints}
            loading={loading}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
            onNavigateToTrack={(id) => handleNavigate('track', id)}
            onRefresh={fetchComplaints}
          />
        )}

        {currentTab === 'chatbot' && (
          <CivicChatbot />
        )}

        {currentTab === 'track' && (
          <TrackComplaint
            initialSearchId={trackComplaintId}
            complaints={complaints}
            onNavigateToReport={() => handleNavigate('report')}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            complaints={complaints}
            loading={loading}
            onUpdateStatus={handleUpdateStatus}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
            onRefresh={fetchComplaints}
          />
        )}
      </main>

      {/* Modal Detail View */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onNavigateToTrack={(id) => {
            setSelectedComplaint(null);
            handleNavigate('track', id);
          }}
        />
      )}

      {/* Floating AI Chat Button (Separated from top navigation bar near bottom-right) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Floating AI Chat Panel */}
        {isChatOpen && (
          <div className="mb-3 w-[92vw] sm:w-[440px] h-[640px] max-h-[85vh] rounded-3xl border border-white/14 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(255,255,255,0.03)] flex flex-col overflow-hidden animate-hero-badge backdrop-blur-2xl">
            <CivicChatbot onClose={() => setIsChatOpen(false)} />
          </div>
        )}

        {/* Floating AI Chat Toggle Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border transition-all duration-300 cursor-pointer shadow-2xl backdrop-blur-xl ${
            isChatOpen
              ? 'bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.4)] font-bold scale-[1.03]'
              : 'bg-[#08090B]/95 hover:bg-[#121316] text-[#F5F5F5] border-white/16 hover:border-white/40 shadow-[0_10px_35px_rgba(0,0,0,0.85)]'
          }`}
          aria-label="Toggle AI Chat"
        >
          <Bot className={`w-4 h-4 ${isChatOpen ? 'text-black' : 'text-white'}`} />
          <span className="text-xs font-semibold tracking-wide font-heading">AI Chat</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="glass-panel border-t border-white/12 mt-auto py-8 text-xs text-slate-400 relative z-10">
        <ScrollReveal className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white border border-white/20">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-white tracking-tight text-sm font-heading">CIVIC <span className="text-slate-300 font-semibold">AI</span></span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">Smart Community Problem Solver</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-slate-400">
              <span className="text-slate-300 font-medium">Powered by Gemini 3.8 Flash</span>
              <span className="text-slate-600">·</span>
              <span>Full-Stack Persistent Records</span>
              <span className="text-slate-600">·</span>
              <span>Zero False Administrative Claims</span>
            </div>
          </div>
        </ScrollReveal>
      </footer>
    </div>
  );
}
