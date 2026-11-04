import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false }) => {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <div className="flex items-center gap-3 group" role="img" aria-label="CIVIC AI Logo">
      {/* Pure Black Liquid Glass Monogram Symbol with Geometric C & Community Nodes */}
      <div 
        className="relative flex items-center justify-center rounded-xl bg-[#0A0A0A] border border-white/22 shadow-[0_4px_20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.22)] group-hover:scale-105 transition-transform duration-200"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg 
          width={iconSize * 0.6} 
          height={iconSize * 0.6} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-white"
        >
          {/* Geometric Letter C with Connected Community Nodes */}
          <path d="M19 8C17.5 5.5 15 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C15 20 17.5 18.5 19 16" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          <line x1="14.5" y1="12" x2="18" y2="12" />
          <circle cx="19" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`${textSize} font-bold tracking-wide text-white flex items-center gap-1.5 font-heading`}>
          CIVIC <span className="text-[#A3A3A3] font-semibold">AI</span>
        </span>
        {showTagline && (
          <span className="text-[11px] text-[#737373] tracking-wider font-medium font-body uppercase">
            Smart Community Problem Solver
          </span>
        )}
      </div>
    </div>
  );
};
