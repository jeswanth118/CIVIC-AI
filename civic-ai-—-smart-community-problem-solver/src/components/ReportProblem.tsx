import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  Copy, 
  Check, 
  Eye, 
  ShieldAlert, 
  Info,
  RefreshCw,
  Camera,
  X
} from 'lucide-react';
import type { ComplaintCategory, ComplaintPriority, AIAnalysis, Complaint } from '../types';

interface ReportProblemProps {
  initialCategory?: string;
  onComplaintSubmitted: (complaint: Complaint) => void;
  onNavigateToTrack: (complaintId: string) => void;
}

export const ReportProblem: React.FC<ReportProblemProps> = ({
  initialCategory,
  onComplaintSubmitted,
  onNavigateToTrack,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>(
    (initialCategory as ComplaintCategory) || 'Road Damage'
  );
  const [allowAiCategory, setAllowAiCategory] = useState(!initialCategory);
  const [location, setLocation] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // AI analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Duplicate warning state
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  // Submission state
  const [saving, setSaving] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const categories: ComplaintCategory[] = [
    'Road Damage',
    'Waste Management',
    'Water Leakage',
    'Streetlight',
    'Drainage',
    'Public Infrastructure',
    'Other',
  ];

  // Check duplicate when location and title or category are entered
  useEffect(() => {
    if (!title || !location || title.length < 5 || location.length < 4) {
      setDuplicateWarning(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCheckingDuplicate(true);
        const res = await fetch('/api/check-duplicate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, location, category }),
        });
        const data = await res.json();
        if (data.hasDuplicate) {
          setDuplicateWarning(data.matchedComplaint);
        } else {
          setDuplicateWarning(null);
        }
      } catch (err) {
        console.error('Duplicate check error:', err);
      } finally {
        setCheckingDuplicate(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [title, description, location, category]);

  // Handle location detection via Geolocation API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    setLocationStatus('Requesting GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // User is given readable coordinates that they can edit or annotate
        const locString = `Near Lat ${latitude.toFixed(4)}, Long ${longitude.toFixed(4)} (GPS Verified)`;
        setLocation(locString);
        setDetectingLocation(false);
        setLocationStatus('Location detected. You may edit or append specific street details.');
      },
      (error) => {
        setDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('Location access was denied. Please enter your address manually.');
        } else {
          setLocationStatus('Unable to determine location. Please enter manually.');
        }
      },
      { timeout: 10000 }
    );
  };

  // Image file handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please choose a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset quick photos for quick hackathon testing
  const handleSetPresetPhoto = (type: 'pothole' | 'trash' | 'light') => {
    // Generate simple SVG data URIs
    let svgContent = '';
    if (type === 'pothole') {
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#1e293b"/><circle cx="200" cy="150" r="80" fill="#0f172a" stroke="#475569" stroke-width="6"/><path d="M140 130 Q200 170 260 140" stroke="#f59e0b" stroke-width="4" fill="none"/><text x="200" y="270" fill="#94a3b8" font-size="14" text-anchor="middle" font-family="sans-serif">Verified Road Pothole Condition</text></svg>`;
    } else if (type === 'trash') {
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#1e293b"/><rect x="130" y="80" width="140" height="150" rx="8" fill="#334155" stroke="#64748b" stroke-width="4"/><path d="M120 75 L280 75" stroke="#10b981" stroke-width="8"/><text x="200" y="270" fill="#94a3b8" font-size="14" text-anchor="middle" font-family="sans-serif">Overflowing Waste Container</text></svg>`;
    } else {
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#0f172a"/><line x1="200" y1="260" x2="200" y2="80" stroke="#475569" stroke-width="8"/><circle cx="200" cy="70" r="25" fill="#38bdf8" opacity="0.8"/><text x="200" y="270" fill="#94a3b8" font-size="14" text-anchor="middle" font-family="sans-serif">Streetlight Outage Site</text></svg>`;
    }
    const base64 = `data:image/svg+xml;base64,${btoa(svgContent)}`;
    setImagePreview(base64);
  };

  // Validate form
  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!title.trim()) errors.title = 'Title is required';
    else if (title.trim().length < 5) errors.title = 'Title must be at least 5 characters';

    if (!description.trim()) errors.description = 'Problem description is required';
    else if (description.trim().length < 15) errors.description = 'Please provide a more detailed description (at least 15 characters)';

    if (!location.trim()) errors.location = 'Location or address is required';
    else if (location.trim().length < 3) errors.location = 'Please enter a valid location';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 1: Run Gemini AI Analysis
  const handleAnalyzeWithAI = async () => {
    if (!validate()) return;

    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          location,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to complete AI analysis');
      }

      const data = await res.json();
      setAiResult(data.analysis);

      // If user enabled AI category suggestion, adopt it
      if (allowAiCategory && data.analysis?.category) {
        setCategory(data.analysis.category);
      }
    } catch (err: any) {
      console.error('AI triage error:', err);
      setAnalysisError(err.message || 'Unable to connect to AI analysis service.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Step 2: Finalize and save complaint to database
  const handleFinalSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    setAnalysisError(null);

    try {
      // If AI hasn't been run yet, run analysis in background or use default
      let analysisToUse = aiResult;
      if (!analysisToUse) {
        const triageRes = await fetch('/api/analyze-complaint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, category, location }),
        });
        if (triageRes.ok) {
          const triageData = await triageRes.json();
          analysisToUse = triageData.analysis;
        }
      }

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          location,
          aiAnalysis: analysisToUse,
          imageUrl: imagePreview,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save complaint.');
      }

      const newComplaint: Complaint = await res.json();
      setSubmittedComplaint(newComplaint);
      onComplaintSubmitted(newComplaint);
    } catch (err: any) {
      console.error('Error saving complaint:', err);
      setAnalysisError(err.message || 'Saving complaint failed. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  const copyIdToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setImagePreview(null);
    setAiResult(null);
    setSubmittedComplaint(null);
    setDuplicateWarning(null);
    setValidationErrors({});
    setAnalysisError(null);
  };

  // Priority badge styling
  const getPriorityBadge = (priority: ComplaintPriority) => {
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

  // If complaint was submitted successfully, show confirmation screen
  if (submittedComplaint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-emerald-500/40 text-center space-y-7 shadow-2xl backdrop-blur-2xl">
          <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-emerald-500/25 to-teal-500/10 border border-emerald-400/40 text-emerald-300 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Complaint Successfully Lodged
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Thank You for Reporting
            </h2>
            <p className="text-sm text-slate-200 max-w-lg mx-auto">
              Your community problem has been registered into the CIVIC AI system and routed for review.
            </p>
          </div>

          {/* Complaint Tracking ID Box */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-cyan-400/30 max-w-md mx-auto space-y-2 shadow-inner">
            <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Your Unique Complaint ID</span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-cyan-300 tracking-wider">
                {submittedComplaint.id}
              </span>
              <button
                onClick={() => copyIdToClipboard(submittedComplaint.id)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all cursor-pointer border border-white/15"
                title="Copy Complaint ID"
              >
                {copiedId ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {copiedId && <span className="text-xs text-emerald-300 font-semibold block">Copied to clipboard!</span>}
          </div>

          {/* AI Summary Recap */}
          {submittedComplaint.aiAnalysis && (
            <div className="text-left p-6 rounded-2xl glass-card border border-white/14 max-w-xl mx-auto space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Assigned Category:</span>
                <span className="text-white font-semibold">{submittedComplaint.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Routing Department:</span>
                <span className="text-cyan-300 font-semibold">
                  {submittedComplaint.aiAnalysis.suggested_department}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Suggested Priority:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold border ${getPriorityBadge(submittedComplaint.aiAnalysis.suggested_priority)}`}>
                  {submittedComplaint.aiAnalysis.suggested_priority}
                </span>
              </div>
              <div className="pt-2.5 border-t border-white/10 text-slate-200">
                <span className="text-slate-400 block mb-1 font-semibold uppercase text-[10px]">Summary:</span>
                {submittedComplaint.aiAnalysis.summary}
              </div>
            </div>
          )}

          {/* Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigateToTrack(submittedComplaint.id)}
              className="btn-glass-primary w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Track Complaint Progress</span>
            </button>

            <button
              onClick={resetForm}
              className="btn-glass-secondary w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-slate-200 rounded-xl cursor-pointer"
            >
              <span>Submit Another Issue</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-left space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-xs font-semibold text-cyan-200 border border-cyan-400/30">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span>Automated Gemini AI Triage</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Report a Community Problem</h1>
        <p className="text-sm text-slate-200 leading-relaxed">
          Submit details about local infrastructure, sanitation, or safety concerns. Our Gemini AI engine will analyze urgency and recommend the responsible municipal department.
        </p>
      </div>

      {/* Duplicate Warning Banner */}
      {duplicateWarning && (
        <div className="glass-panel rounded-2xl p-5 border border-amber-500/50 bg-amber-950/20 flex items-start gap-3.5 shadow-lg">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1.5 flex-1">
            <span className="font-bold text-amber-300 block text-sm">
              Potentially similar complaint found in this area
            </span>
            <p className="text-slate-200 leading-relaxed">
              An existing complaint <strong className="text-white font-mono">{duplicateWarning.id}</strong> ("{duplicateWarning.title}") is currently active at <span className="text-amber-200 font-semibold">{duplicateWarning.location}</span>.
            </p>
            <div className="pt-1 flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigateToTrack(duplicateWarning.id)}
                className="text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View Existing Case</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300">You may still proceed with your submission if it is distinct.</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleAnalyzeWithAI(); }} className="space-y-7">
        <div className="glass-panel rounded-3xl p-7 sm:p-9 space-y-7 border border-white/14">
          {/* Complaint Title */}
          <div className="space-y-2">
            <label htmlFor="complaint-title" className="block text-sm font-bold text-white">
              Complaint Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="complaint-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Severe pothole damaging vehicle rims near Elm & 4th"
              className={`w-full px-4 py-3.5 rounded-xl glass-input text-sm ${
                validationErrors.title ? 'border-rose-500/80 focus:border-rose-500' : ''
              }`}
            />
            {validationErrors.title && (
              <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {validationErrors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="complaint-desc" className="block text-sm font-bold text-white">
              Detailed Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="complaint-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, depth or severity, hazards created, how long it has persisted, and any impact on pedestrians or drivers..."
              className={`w-full px-4 py-3.5 rounded-xl glass-input text-sm leading-relaxed ${
                validationErrors.description ? 'border-rose-500/80 focus:border-rose-500' : ''
              }`}
            />
            {validationErrors.description && (
              <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {validationErrors.description}
              </p>
            )}
            <p className="text-[11px] text-slate-400">
              Provide thorough details. Gemini AI uses this description as the primary source of truth for triage without inventing outside facts.
            </p>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-white">
                Category Selection
              </label>
              <label className="flex items-center gap-2 text-xs text-cyan-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowAiCategory}
                  onChange={(e) => setAllowAiCategory(e.target.checked)}
                  className="rounded bg-slate-900 border-white/20 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                />
                <span>Allow AI to auto-categorize</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setAllowAiCategory(false);
                  }}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-cyan-500/25 border border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'glass-card text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Location Field with Geolocation Helper */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="complaint-location" className="block text-sm font-bold text-white">
                Location or Address <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="text-xs font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {detectingLocation ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Detect My Location</span>
                  </>
                )}
              </button>
            </div>

            <input
              id="complaint-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., 5th Ave & Main Street, Downtown Sector"
              className={`w-full px-4 py-3.5 rounded-xl glass-input text-sm ${
                validationErrors.location ? 'border-rose-500/80 focus:border-rose-500' : ''
              }`}
            />
            {locationStatus && (
              <p className="text-[11px] text-cyan-300 flex items-center gap-1">
                <Info className="w-3 h-3 shrink-0" />
                {locationStatus}
              </p>
            )}
            {validationErrors.location && (
              <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {validationErrors.location}
              </p>
            )}
          </div>

          {/* Photo Upload with Hackathon Test Presets */}
          <div className="space-y-3 pt-2">
            <label className="block text-sm font-bold text-white">
              Incident Photo <span className="text-xs font-normal text-slate-400">(Optional)</span>
            </label>

            {imagePreview ? (
              <div className="relative inline-block rounded-2xl overflow-hidden border border-white/20 shadow-lg">
                <img
                  src={imagePreview}
                  alt="Incident Preview"
                  className="w-64 h-44 object-cover rounded-2xl"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-950/80 text-white hover:bg-rose-600 transition-colors cursor-pointer border border-white/20"
                  title="Remove Photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-2xl hover:border-cyan-400/50 hover:bg-white/5 transition-all cursor-pointer glass-card">
                  <Camera className="w-8 h-8 text-cyan-400 mb-2" />
                  <span className="text-xs font-bold text-slate-200">Upload Site Photo</span>
                  <span className="text-[11px] text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {/* Instant Presets for Hackathon Judges */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Quick Demo Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleSetPresetPhoto('pothole')}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/12 text-[11px] font-medium cursor-pointer transition-colors"
                  >
                    Road Pothole
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetPhoto('trash')}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/12 text-[11px] font-medium cursor-pointer transition-colors"
                  >
                    Dumpster Overflow
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetPhoto('light')}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/12 text-[11px] font-medium cursor-pointer transition-colors"
                  >
                    Dark Streetlight
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Analysis Trigger Button */}
          <div className="pt-4 border-t border-white/12 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleAnalyzeWithAI}
              disabled={analyzing}
              className="btn-glass-primary px-6 py-3 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center gap-2.5 cursor-pointer disabled:opacity-60 transition-all"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Gemini AI Analyzing Complaint...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>{aiResult ? 'Re-Analyze with Gemini AI' : 'Run Gemini AI Triage First'}</span>
                </>
              )}
            </button>

            <span className="text-xs text-slate-400">
              Review AI recommendations before final save
            </span>
          </div>
        </div>

        {/* AI Analysis Error Banner */}
        {analysisError && (
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-rose-500/40 bg-rose-950/20 text-xs text-rose-200 flex items-center gap-2.5 shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{analysisError}</span>
          </div>
        )}

        {/* AI Analysis Review Box (When generated) */}
        {aiResult && (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-400/40 bg-cyan-950/25 space-y-6 shadow-2xl backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/12">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md border border-white/20">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Gemini AI Assessment & Recommendation
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    AI suggestions are provided for human review, not an official legal decision.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">Suggested Priority:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityBadge(aiResult.suggested_priority)}`}>
                  {aiResult.suggested_priority}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-1.5 border border-white/12">
                <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Triage Summary</span>
                <p className="text-white text-sm leading-relaxed">{aiResult.summary}</p>
              </div>

              <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-1.5 border border-white/12">
                <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Recommended Municipal Department</span>
                <p className="text-cyan-300 text-sm font-bold">{aiResult.suggested_department}</p>
              </div>

              <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-1.5 border border-white/12">
                <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Priority Urgency Rationale</span>
                <p className="text-slate-200 leading-relaxed">{aiResult.priority_reason}</p>
              </div>

              <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-1.5 border border-white/12">
                <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Possible Public Safety Risk</span>
                <p className="text-amber-200 leading-relaxed font-medium">{aiResult.possible_safety_risk}</p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 sm:p-5 text-xs space-y-1.5 border border-white/12">
              <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Recommended Action for Response Crew</span>
              <p className="text-emerald-300 font-semibold text-sm">{aiResult.recommended_action}</p>
            </div>
          </div>
        )}

        {/* Final Submit Complaint Button */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={saving || analyzing}
            className="btn-glass-primary w-full sm:w-auto px-9 py-4 rounded-xl text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting & Minting Complaint ID...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm & Submit Complaint</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
