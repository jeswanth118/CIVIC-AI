import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Building2, 
  Sparkles, 
  ShieldAlert, 
  ChevronRight, 
  FileText,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';
import type { Complaint, ComplaintStatus, ComplaintPriority } from '../types';

interface TrackComplaintProps {
  initialSearchId?: string;
  complaints: Complaint[];
  onNavigateToReport: () => void;
}

export const TrackComplaint: React.FC<TrackComplaintProps> = ({
  initialSearchId,
  complaints,
  onNavigateToReport,
}) => {
  const [searchId, setSearchId] = useState(initialSearchId || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-search if initialSearchId is provided
  useEffect(() => {
    if (initialSearchId) {
      setSearchId(initialSearchId);
      performSearch(initialSearchId);
    }
  }, [initialSearchId]);

  const performSearch = async (idToSearch: string) => {
    const trimmed = idToSearch.trim().toUpperCase();
    if (!trimmed) {
      setError('Please enter a complaint ID');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/complaints/${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        if (res.status === 404) {
          setComplaint(null);
          setError(`No complaint found with ID "${trimmed}". Please double check your tracking code.`);
        } else {
          throw new Error('Failed to query complaint status.');
        }
      } else {
        const data = await res.json();
        setComplaint(data);
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with tracking service.');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchId);
  };

  const copyId = () => {
    if (complaint) {
      navigator.clipboard.writeText(complaint.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const milestoneStatuses: ComplaintStatus[] = [
    'Submitted',
    'Under Review',
    'In Progress',
    'Resolved',
  ];

  const getStepIndex = (status: ComplaintStatus) => {
    switch (status) {
      case 'Submitted':
        return 0;
      case 'Under Review':
        return 1;
      case 'In Progress':
        return 2;
      case 'Resolved':
        return 3;
      default:
        return 0;
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getPriorityBadge = (priority?: ComplaintPriority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Medium':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'Low':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  const currentStep = complaint ? getStepIndex(complaint.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-left space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-xs font-semibold text-cyan-200 border border-cyan-400/30">
          <Search className="w-3.5 h-3.5 text-cyan-300" />
          <span>Real-Time Citizen Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Track Complaint Status</h1>
        <p className="text-sm text-slate-200 leading-relaxed">
          Enter your unique CIVIC AI Complaint ID to check real-time triage updates, dispatched crew progress, and official resolution verification.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5 border border-white/14 shadow-2xl">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4.5 h-4.5 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. CIVIC-2026-1042"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-sm font-mono tracking-wider text-white uppercase placeholder:font-sans placeholder:normal-case placeholder-slate-400 shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-glass-primary px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
          >
            {loading ? (
              <span>Locating Record...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Track Status</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Sample IDs helper */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Quick Test IDs:</span>
          {complaints.slice(0, 4).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSearchId(c.id);
                performSearch(c.id);
              }}
              className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 font-mono font-semibold border border-white/12 cursor-pointer transition-colors"
            >
              {c.id}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-panel rounded-2xl p-6 border border-rose-500/40 bg-rose-950/20 space-y-3 shadow-xl">
          <div className="flex items-center gap-2.5 text-rose-300 font-bold text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>Complaint Not Found</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">{error}</p>
          <div className="pt-1 flex items-center gap-3">
            <button
              onClick={onNavigateToReport}
              className="text-xs font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Submit a New Complaint</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Matching Complaint Result */}
      {complaint && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Progress Indicator Card */}
          <div className="glass-panel rounded-3xl p-7 sm:p-9 space-y-8 border border-white/16 shadow-2xl backdrop-blur-2xl">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/12">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold text-cyan-300 tracking-wider">
                    {complaint.id}
                  </span>
                  <button
                    onClick={copyId}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/12"
                    title="Copy ID"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  {complaint.isDemo && (
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Demo Data
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">{complaint.title}</h2>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Current Status</span>
                <span className={`inline-block mt-1.5 text-sm font-bold px-3.5 py-1 rounded-full border ${
                  complaint.status === 'Resolved'
                    ? 'bg-emerald-500/25 text-emerald-200 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                    : complaint.status === 'In Progress'
                    ? 'bg-indigo-500/25 text-indigo-200 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                    : complaint.status === 'Under Review'
                    ? 'bg-sky-500/25 text-sky-200 border-sky-500/40'
                    : 'bg-slate-500/25 text-slate-200 border-slate-500/40'
                }`}>
                  {complaint.status}
                </span>
              </div>
            </div>

            {/* Stepped Progress Milestones */}
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Resolution Lifecycle Progress
              </span>

              <div className="grid grid-cols-4 gap-2 relative">
                {/* Connecting bar */}
                <div className="absolute top-4 left-6 right-6 h-1 bg-white/12 -z-0 rounded-full" />
                <div
                  className="absolute top-4 left-6 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 -z-0 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                  style={{ width: `${(currentStep / 3) * 88}%` }}
                />

                {milestoneStatuses.map((mStatus, idx) => {
                  const isCompleted = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={mStatus} className="flex flex-col items-center text-center space-y-2 z-10">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all shadow-md ${
                        isCurrent
                          ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                          : isCompleted
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 border border-white/15'
                      }`}>
                        {isCompleted && !isCurrent ? (
                          <Check className="w-4.5 h-4.5 stroke-[3]" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span className={`text-[11px] sm:text-xs font-bold leading-tight ${
                        isCurrent
                          ? 'text-cyan-300'
                          : isCompleted
                          ? 'text-white'
                          : 'text-slate-400'
                      }`}>
                        {mStatus}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Complaint Location & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-4 border-t border-white/12">
              <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-1.5 border border-white/12">
                <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Incident Location</span>
                <p className="text-white font-semibold flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{complaint.location}</span>
                </p>
              </div>

              <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-1.5 border border-white/12">
                <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Category Classification</span>
                <p className="text-white font-semibold text-sm">
                  {complaint.category}
                </p>
              </div>
            </div>

            {/* AI Analysis Details */}
            {complaint.aiAnalysis && (
              <div className="glass-card rounded-2xl p-6 border border-cyan-400/35 bg-cyan-950/20 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 text-xs text-cyan-300 font-bold">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Gemini AI Triage Assessment</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(complaint.aiAnalysis.suggested_priority)}`}>
                    {complaint.aiAnalysis.suggested_priority} Priority
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-white font-semibold text-sm leading-relaxed">{complaint.aiAnalysis.summary}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-white/10">
                  <div>
                    <span className="text-slate-300 block text-[11px] font-semibold">Responsible Department:</span>
                    <span className="text-cyan-300 font-bold">{complaint.aiAnalysis.suggested_department}</span>
                  </div>
                  <div>
                    <span className="text-slate-300 block text-[11px] font-semibold">Recommended Action:</span>
                    <span className="text-slate-100 font-medium">{complaint.aiAnalysis.recommended_action}</span>
                  </div>
                </div>

                {complaint.aiAnalysis.possible_safety_risk && (
                  <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/35 text-xs text-amber-200 flex items-start gap-2.5 mt-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Assessed Safety Risk:</strong> {complaint.aiAnalysis.possible_safety_risk}</span>
                  </div>
                )}
              </div>
            )}

            {/* Status History & Department Log */}
            {complaint.statusHistory && complaint.statusHistory.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Activity & Verification History
                </span>

                <div className="space-y-3">
                  {complaint.statusHistory.map((history, i) => (
                    <div
                      key={i}
                      className="glass-card rounded-2xl p-4 flex items-start justify-between text-xs gap-3 border border-white/12"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{history.status}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-cyan-300 font-medium">{history.updatedBy}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{history.note}</p>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        {formatDate(history.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
