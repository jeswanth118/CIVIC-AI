import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Copy, 
  Check, 
  Eye, 
  ArrowRight 
} from 'lucide-react';
import type { Complaint, ComplaintPriority, ComplaintStatus } from '../types';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  onNavigateToTrack: (complaintId: string) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  onClose,
  onNavigateToTrack,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!complaint) return null;

  const copyId = () => {
    navigator.clipboard.writeText(complaint.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'In Progress':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Under Review':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'Submitted':
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B1A]/85 backdrop-blur-xl overflow-y-auto">
      <div className="glass-panel rounded-3xl p-7 sm:p-9 max-w-2xl w-full my-8 space-y-6 border border-white/18 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/12">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-extrabold text-cyan-300 tracking-wider">
                {complaint.id}
              </span>
              <button
                onClick={copyId}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/12"
                title="Copy ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              {complaint.isDemo && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Demo Data
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5">{complaint.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status & Priority Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${getStatusBadge(complaint.status)}`}>
              {complaint.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Category:</span>
            <span className="text-white font-medium">{complaint.category}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Reported:</span>
            <span className="text-slate-300 font-mono">{formatDate(complaint.createdAt)}</span>
          </div>
        </div>

        {/* Location & Description */}
        <div className="space-y-3">
          <div className="glass-card rounded-xl p-3.5 text-xs flex items-center gap-2 text-slate-200">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-300">Location:</span>
            <span>{complaint.location}</span>
          </div>

          <div className="glass-card rounded-xl p-4 text-xs space-y-1.5">
            <span className="text-slate-400 uppercase tracking-wider font-semibold block">Citizen Description</span>
            <p className="text-slate-200 text-sm leading-relaxed">{complaint.description}</p>
          </div>

          {/* Photo if present */}
          {complaint.imageUrl && (
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Submitted Photo Evidence</span>
              <img
                src={complaint.imageUrl}
                alt="Submitted Evidence"
                className="w-full max-h-60 object-contain rounded-xl border border-white/10 bg-slate-900"
              />
            </div>
          )}
        </div>

        {/* Gemini AI Triage Analysis */}
        {complaint.aiAnalysis && (
          <div className="glass-card rounded-xl p-5 border border-cyan-500/30 bg-cyan-950/20 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Gemini AI Assessment & Triage</span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getPriorityBadge(complaint.aiAnalysis.suggested_priority)}`}>
                {complaint.aiAnalysis.suggested_priority} Priority
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 uppercase tracking-wider font-medium text-[11px] block">Problem Summary:</span>
                <p className="text-white text-sm font-medium mt-0.5">{complaint.aiAnalysis.summary}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Recommended Department:</span>
                  <span className="text-cyan-300 font-semibold">{complaint.aiAnalysis.suggested_department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Priority Rationale:</span>
                  <span className="text-slate-200">{complaint.aiAnalysis.priority_reason}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-slate-400 block text-[11px]">Recommended Next Action:</span>
                <span className="text-emerald-300 font-medium">{complaint.aiAnalysis.recommended_action}</span>
              </div>

              {complaint.aiAnalysis.possible_safety_risk && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-2 mt-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Safety Risk:</strong> {complaint.aiAnalysis.possible_safety_risk}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Log */}
        {complaint.statusHistory && complaint.statusHistory.length > 0 && (
          <div className="space-y-2 text-xs">
            <span className="text-slate-400 uppercase tracking-wider font-semibold block">Audit Timeline</span>
            <div className="space-y-2">
              {complaint.statusHistory.map((h, i) => (
                <div key={i} className="glass-card rounded-lg p-3 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-white">{h.status}</span>
                    <span className="text-slate-400 mx-1.5">·</span>
                    <span className="text-cyan-300">{h.updatedBy}</span>
                    <p className="text-slate-300 mt-0.5">{h.note}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{formatDate(h.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/12">
          <button
            onClick={() => {
              onClose();
              onNavigateToTrack(complaint.id);
            }}
            className="btn-glass-primary px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Eye className="w-4 h-4" />
            <span>Open in Tracker</span>
          </button>

          <button
            onClick={onClose}
            className="btn-glass-secondary px-6 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
