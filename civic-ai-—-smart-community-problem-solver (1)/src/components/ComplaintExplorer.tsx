import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import type { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../types';

interface ComplaintExplorerProps {
  complaints: Complaint[];
  loading: boolean;
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigateToTrack: (complaintId: string) => void;
  onRefresh: () => void;
}

export const ComplaintExplorer: React.FC<ComplaintExplorerProps> = ({
  complaints,
  loading,
  onSelectComplaint,
  onNavigateToTrack,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');

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

  const statuses = ['All', 'Submitted', 'Under Review', 'In Progress', 'Resolved'];
  const priorities = ['All', 'Critical', 'High', 'Medium', 'Low'];

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Search term (ID, Title, Location)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesId = c.id.toLowerCase().includes(query);
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesLocation = c.location.toLowerCase().includes(query);
        if (!matchesId && !matchesTitle && !matchesLocation) return false;
      }

      // Category
      if (selectedCategory !== 'All' && c.category !== selectedCategory) {
        return false;
      }

      // Status
      if (selectedStatus !== 'All' && c.status !== selectedStatus) {
        return false;
      }

      // Priority
      if (selectedPriority !== 'All') {
        const p = c.aiAnalysis?.suggested_priority || 'Medium';
        if (p !== selectedPriority) return false;
      }

      return true;
    });
  }, [complaints, searchTerm, selectedCategory, selectedStatus, selectedPriority]);

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

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedPriority('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Explore Community Complaints</h1>
          <p className="text-sm text-slate-300 mt-1">
            Browse verified municipal incident reports, track departmental response, and view AI triage insights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 glass-card hover:bg-white/5 rounded-xl text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh Complaints"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-5 border border-white/14">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4.5 h-4.5 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search complaints by ID (e.g. CIVIC-2026-1042), keyword, or location..."
            className="w-full pl-12 pr-12 py-3 rounded-2xl glass-input text-sm text-white placeholder-slate-400 shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-300 hover:text-white font-medium cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Dropdowns / Segments */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-100 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#0A1226] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-100 cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s} value={s} className="bg-[#0A1226] text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Priority Urgency
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-100 cursor-pointer"
            >
              {priorities.map((p) => (
                <option key={p} value={p} className="bg-[#0A1226] text-white">
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Indicators & Reset */}
        {(selectedCategory !== 'All' || selectedStatus !== 'All' || selectedPriority !== 'All' || searchTerm) && (
          <div className="pt-3 flex items-center justify-between text-xs text-slate-300 border-t border-white/10">
            <span>
              Showing <strong className="text-white font-mono">{filteredComplaints.length}</strong> of <strong className="text-white font-mono">{complaints.length}</strong> complaints
            </span>
            <button
              onClick={handleResetFilters}
              className="text-cyan-300 hover:text-cyan-200 font-bold cursor-pointer transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Complaint List View */}
      {loading ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-3 border border-white/14">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-300">Retrieving community complaint database...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-white/14">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/12 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Matching Complaints Found</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
            Try adjusting your search keywords or clearing active category and status filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="btn-glass-secondary px-5 py-2.5 rounded-xl text-xs text-white font-bold cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredComplaints.map((complaint) => {
            const priority = complaint.aiAnalysis?.suggested_priority || 'Medium';
            return (
              <div
                key={complaint.id}
                className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 group cursor-pointer border border-white/14"
                onClick={() => onSelectComplaint(complaint)}
              >
                {/* Card Top: ID and Status */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider">
                        {complaint.id}
                      </span>
                      {complaint.isDemo && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          Demo Data
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${getStatusBadge(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {complaint.title}
                  </h3>

                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                    {complaint.description}
                  </p>
                </div>

                {/* AI Triage Mini Highlight */}
                {complaint.aiAnalysis && (
                  <div className="p-4 rounded-2xl bg-slate-950/45 backdrop-blur-md border border-white/12 space-y-2 text-xs shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-semibold">AI Routing Dept:</span>
                      </span>
                      <span className="text-cyan-300 font-bold truncate max-w-[200px]">
                        {complaint.aiAnalysis.suggested_department}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-semibold">Assessed Priority:</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(priority)}`}>
                        {priority}
                      </span>
                    </div>
                  </div>
                )}

                {/* Card Footer: Location, Date & Action */}
                <div className="pt-3 border-t border-white/12 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate text-slate-200 font-medium">{complaint.location}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 font-medium">{formatDate(complaint.createdAt)}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToTrack(complaint.id);
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/25 text-cyan-300 hover:text-white transition-colors cursor-pointer border border-white/12"
                      title="Track Live"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
