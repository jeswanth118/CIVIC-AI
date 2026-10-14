import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  BarChart3, 
  Filter, 
  Search, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Eye, 
  Check, 
  FileText, 
  MapPin, 
  Flame, 
  Users, 
  X,
  Layers,
  ChevronDown,
  Building,
  ShieldAlert
} from 'lucide-react';
import type { Complaint, ComplaintStatus, ComplaintPriority, ComplaintCategory } from '../types';

interface AdminDashboardProps {
  complaints: Complaint[];
  loading: boolean;
  onUpdateStatus: (id: string, newStatus: ComplaintStatus, note?: string) => Promise<void>;
  onSelectComplaint: (complaint: Complaint) => void;
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  complaints,
  loading,
  onUpdateStatus,
  onSelectComplaint,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Status edit modal state
  const [updatingComplaint, setUpdatingComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('In Progress');
  const [statusNote, setStatusNote] = useState('');
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string | null>(null);

  // Computed metrics from real stored records
  const total = complaints.length;
  const submittedCount = complaints.filter(c => c.status === 'Submitted').length;
  const underReviewCount = complaints.filter(c => c.status === 'Under Review').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  // Category breakdown
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of complaints) {
      counts[c.category] = (counts[c.category] || 0) + 1;
    }
    return counts;
  }, [complaints]);

  // Priority breakdown
  const criticalCount = complaints.filter(c => c.aiAnalysis?.suggested_priority === 'Critical').length;
  const highCount = complaints.filter(c => c.aiAnalysis?.suggested_priority === 'High').length;

  // Hotspots
  const hotspots = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of complaints) {
      const area = c.location.split(',')[0].trim();
      map[area] = (map[area] || 0) + 1;
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [complaints]);

  // Filtered complaints for the admin table
  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const matchesId = c.id.toLowerCase().includes(q);
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesLocation = c.location.toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesLocation) return false;
      }
      if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (priorityFilter !== 'All') {
        const p = c.aiAnalysis?.suggested_priority || 'Medium';
        if (p !== priorityFilter) return false;
      }
      return true;
    });
  }, [complaints, searchTerm, categoryFilter, statusFilter, priorityFilter]);

  const handleOpenStatusModal = (complaint: Complaint) => {
    setUpdatingComplaint(complaint);
    setNewStatus(complaint.status);
    setStatusNote('');
    setUpdateSuccessMsg(null);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!updatingComplaint) return;
    setIsSubmittingUpdate(true);
    try {
      await onUpdateStatus(updatingComplaint.id, newStatus, statusNote);
      setUpdateSuccessMsg(`Status updated to ${newStatus}`);
      setTimeout(() => {
        setUpdatingComplaint(null);
        setUpdateSuccessMsg(null);
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingUpdate(false);
    }
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

  const categories = [
    'All',
    'Road Damage',
    'Waste Management',
    'Water Leakage',
    'Streetlight',
    'Drainage',
    'Public Infrastructure',
    'Other',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header with Demonstration Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-semibold text-indigo-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Demonstration Environment — City Operations Control</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Municipal Operations Command</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Review incoming complaints, verify AI triage priority recommendations, and advance resolution workflows.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 glass-card hover:bg-white/5 rounded-xl text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sync Records</span>
          </button>
        </div>
      </div>

      {/* KPI Statistic Cards (strictly computed from records) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-white/16 shadow-lg">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Total Complaints</span>
          <p className="text-3xl font-extrabold text-white mt-2 font-mono tabular-nums">{total}</p>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">Stored records</span>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-400/30 shadow-lg">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Submitted / New</span>
          <p className="text-3xl font-extrabold text-slate-100 mt-2 font-mono tabular-nums">{submittedCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">Awaiting triage</span>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-sky-400/30 shadow-lg">
          <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block">Under Review</span>
          <p className="text-3xl font-extrabold text-sky-200 mt-2 font-mono tabular-nums">{underReviewCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">Dispatcher review</span>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-indigo-400/30 shadow-lg">
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">In Progress</span>
          <p className="text-3xl font-extrabold text-indigo-200 mt-2 font-mono tabular-nums">{inProgressCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">Crews on-site</span>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-emerald-400/30 shadow-lg col-span-2 lg:col-span-1">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">Resolved</span>
          <p className="text-3xl font-extrabold text-emerald-200 mt-2 font-mono tabular-nums">{resolvedCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">Closed & confirmed</span>
        </div>
      </div>

      {/* Analytics Row: Category Distribution & Priority Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Distribution Chart */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 sm:p-7 space-y-5 border border-white/16 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/12">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Category Distribution</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {Object.keys(categoryCounts).length} active sectors
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{cat}</span>
                    <span className="font-mono text-cyan-300 font-semibold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hotspots & Urgent Queue */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 sm:p-7 space-y-5 border border-white/16 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/12">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Recurring Hotspots</span>
            </h2>
            <span className="text-xs text-rose-300 font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30">
              {criticalCount + highCount} Urgent
            </span>
          </div>

          <div className="space-y-3">
            {hotspots.length === 0 ? (
              <p className="text-xs text-slate-300">No recurring cluster locations detected.</p>
            ) : (
              hotspots.map(([loc, count], idx) => (
                <div key={idx} className="glass-card glass-card-hover rounded-xl p-3.5 flex items-center justify-between text-xs border border-white/12">
                  <div className="flex items-center gap-2 truncate max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-slate-100 font-medium truncate">{loc}</span>
                  </div>
                  <span className="font-mono px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold shrink-0">
                    {count} reports
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Complaint Management Table */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-5 border border-white/16 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <h2 className="text-lg font-extrabold text-white">Live Complaint Queue</h2>
            <p className="text-xs text-slate-300 mt-0.5">Filter and advance municipal problem statuses in real-time</p>
          </div>
          <span className="text-xs font-mono text-cyan-300 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 font-bold">
            {filtered.length} of {complaints.length} Records
          </span>
        </div>

        {/* Table Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, keyword, or street..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl glass-input cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#070F24] text-white">
                  {c}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl glass-input cursor-pointer"
            >
              <option value="All" className="bg-[#070F24] text-white">All Statuses</option>
              <option value="Submitted" className="bg-[#070F24] text-white">Submitted</option>
              <option value="Under Review" className="bg-[#070F24] text-white">Under Review</option>
              <option value="In Progress" className="bg-[#070F24] text-white">In Progress</option>
              <option value="Resolved" className="bg-[#070F24] text-white">Resolved</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-2xl border border-white/14 shadow-inner">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/70 backdrop-blur-md text-slate-300 uppercase tracking-wider font-bold border-b border-white/14">
                <th className="py-3.5 px-4 font-mono">ID</th>
                <th className="py-3.5 px-4">Title & Location</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">AI Suggested Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8 bg-slate-950/30">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-300">
                    Loading records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-300">
                    No complaints match current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const priority = c.aiAnalysis?.suggested_priority || 'Medium';
                  return (
                    <tr key={c.id} className="hover:bg-cyan-500/10 transition-colors">
                      {/* ID */}
                      <td className="py-4 px-4 font-mono font-bold text-cyan-300 whitespace-nowrap">
                        {c.id}
                        {c.potentialDuplicateOf && (
                          <span
                            className="ml-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-sans font-bold border border-amber-500/35"
                            title={`Potentially duplicate of ${c.potentialDuplicateOf}`}
                          >
                            Sim. {c.potentialDuplicateOf}
                          </span>
                        )}
                      </td>

                      {/* Title & Location */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-bold text-white line-clamp-1">{c.title}</div>
                        <div className="text-[11px] text-slate-300 line-clamp-1 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>{c.location}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-slate-200 font-medium whitespace-nowrap">
                        {c.category}
                      </td>

                      {/* AI Priority */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getPriorityBadge(priority)}`}>
                          {priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(c.status)}`}>
                          {c.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectComplaint(c)}
                            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white transition-colors cursor-pointer border border-white/12"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          </button>
                          <button
                            onClick={() => handleOpenStatusModal(c)}
                            className="btn-glass-primary px-3 py-1.5 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                          >
                            Update Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {updatingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B1A]/85 backdrop-blur-xl">
          <div className="glass-panel rounded-3xl p-7 sm:p-9 max-w-lg w-full space-y-6 border border-cyan-400/35 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/12">
              <div>
                <span className="text-xs font-mono text-cyan-400 block font-bold tracking-wider">
                  {updatingComplaint.id}
                </span>
                <h3 className="text-xl font-extrabold text-white">Update Complaint Status</h3>
              </div>
              <button
                onClick={() => setUpdatingComplaint(null)}
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              "{updatingComplaint.title}" at <span className="text-cyan-300">{updatingComplaint.location}</span>
            </p>

            {/* Status Select */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                Target Status Transition
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(['Submitted', 'Under Review', 'In Progress', 'Resolved'] as ComplaintStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setNewStatus(st)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      newStatus === st
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg border-white/30'
                        : 'glass-card text-slate-300 hover:text-white hover:bg-white/10 border-white/12'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Note Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                Operational Log Note <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g., Dispatched crew #4 with cold asphalt truck; inspection scheduled for 2 PM..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs leading-relaxed"
              />
            </div>

            {updateSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-inner">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{updateSuccessMsg}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/12">
              <button
                type="button"
                onClick={() => setUpdatingComplaint(null)}
                className="btn-glass-secondary px-5 py-2.5 rounded-xl text-xs text-slate-200 hover:text-white font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusUpdate}
                disabled={isSubmittingUpdate}
                className="btn-glass-primary px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingUpdate ? (
                  <span>Saving Update...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Status Change</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
