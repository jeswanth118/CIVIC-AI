import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Search, 
  Compass, 
  ShieldCheck, 
  PlusCircle, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, complaintIdToTrack?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Building2 },
    { id: 'report', label: 'Report a Problem', icon: PlusCircle },
    { id: 'explore', label: 'Explore Complaints', icon: Compass },
    { id: 'track', label: 'Track Complaint', icon: Search },
    { id: 'admin', label: 'Admin Dashboard', icon: ShieldCheck },
  ];

  const handleNavClick = (tabId: string) => {
    onNavigate(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-[#060A17]/70 border-b border-white/14 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.6)] animate-navbar-fade">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl shrink-0 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-white/20 group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2 whitespace-nowrap">
                CIVIC <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">AI</span>
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-cyan-200 bg-cyan-950/70 border border-cyan-500/40 rounded-full shadow-inner">
                  <Sparkles className="w-2.5 h-2.5 mr-1 text-cyan-300" />
                  Gemini
                </span>
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap transition-colors py-1.5 px-1 relative focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 cursor-pointer ${
                    isActive 
                      ? 'text-cyan-300 font-semibold drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]' 
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action - Prominent Purple Report Issue Button */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('report')}
              className="btn-glass-purple px-4 py-2.5 text-xs font-bold text-white rounded-xl flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-purple-200" />
              <span>Report Issue</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl border border-white/10 focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/12 px-4 pt-3 pb-5 space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
          <div className="pt-2">
            <button
              onClick={() => handleNavClick('report')}
              className="w-full py-2.5 text-xs font-bold text-white btn-glass-purple rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <PlusCircle className="w-4 h-4 text-purple-200" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
