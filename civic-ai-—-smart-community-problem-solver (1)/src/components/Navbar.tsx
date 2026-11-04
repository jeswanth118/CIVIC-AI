import React from 'react';
import { Logo } from './Logo';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, complaintIdToTrack?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const handleNavClick = (tabId: string) => {
    onNavigate(tabId);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#000000]/80 border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left side: CIVIC AI Logo and brand name */}
      <button 
        onClick={() => handleNavClick('home')}
        className="text-left focus:outline-none cursor-pointer flex items-center gap-2.5"
        aria-label="CIVIC AI Home"
      >
        <Logo size="md" showTagline={false} />
      </button>

      {/* Right / Center: Single set of navigation links: Home, Explore, Report Problem, Dashboard */}
      <nav className="flex items-center gap-4 sm:gap-8 text-xs font-medium tracking-wide" aria-label="Main Navigation">
        <button 
          onClick={() => handleNavClick('home')} 
          className={`transition-colors cursor-pointer py-1.5 px-2 ${
            currentTab === 'home' 
              ? 'text-white font-bold border-b border-white' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Home
        </button>
        <button 
          onClick={() => handleNavClick('explore')} 
          className={`transition-colors cursor-pointer py-1.5 px-2 ${
            currentTab === 'explore' 
              ? 'text-white font-bold border-b border-white' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Explore
        </button>
        <button 
          onClick={() => handleNavClick('report')} 
          className={`transition-colors cursor-pointer py-1.5 px-2 ${
            currentTab === 'report' 
              ? 'text-white font-bold border-b border-white' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Report Problem
        </button>
        <button 
          onClick={() => handleNavClick('admin')} 
          className={`transition-colors cursor-pointer py-1.5 px-2 ${
            currentTab === 'admin' 
              ? 'text-white font-bold border-b border-white' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Dashboard
        </button>
      </nav>
    </header>
  );
};

