import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { ReportProblem } from './components/ReportProblem';
import { ComplaintExplorer } from './components/ComplaintExplorer';
import { TrackComplaint } from './components/TrackComplaint';
import { AdminDashboard } from './components/AdminDashboard';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { ScrollReveal } from './components/ScrollReveal';
import type { Complaint, ComplaintStatus } from './types';
import { Building2, Sparkles, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
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
    <div className="min-h-screen bg-[#060A17] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Ambient Lighting Orbs for Frosted-Glass Depth */}
      <div className="fixed inset-0 pointer-events-none -z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[680px] h-[680px] bg-cyan-500/18 rounded-full blur-[150px] opacity-80 animate-pulse-ambient" />
        <div className="absolute top-1/4 -right-40 w-[750px] h-[750px] bg-violet-600/18 rounded-full blur-[160px] opacity-80 animate-float-slow" />
        <div className="absolute top-2/3 left-1/4 w-[850px] h-[650px] bg-blue-600/14 rounded-full blur-[170px] opacity-75 animate-pulse-ambient" />
        <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-indigo-600/16 rounded-full blur-[150px] opacity-75 animate-float-slow" />
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

      {/* Footer */}
      <footer className="glass-panel border-t border-white/12 mt-auto py-8 text-xs text-slate-400 relative z-10">
        <ScrollReveal className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 border border-white/20">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white tracking-tight text-sm">CIVIC <span className="text-cyan-400">AI</span></span>
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
