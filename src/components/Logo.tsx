import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const AgroLogo: React.FC<LogoProps> = ({ className = '', size = 36, showText = true }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-green-800 text-white shadow-sm p-1.5"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Stylized Leaf with IoT Circuit Traces */}
          <path
            d="M24 6C15 6 8 15 8 26C8 37 17 42 24 42C31 42 40 37 40 26C40 13 32 6 24 6Z"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <path
            d="M24 8C17 8 11 16 11 26C11 35 18 39.5 24 40C30 39.5 37 35 37 26C37 14 30 8 24 8Z"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Central IoT Node Spine */}
          <path
            d="M24 13V35"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Circuit Veins & Sensor Dots */}
          <path
            d="M24 19L17 15M24 25L31 21M24 30L17 27M24 33L30 31"
            stroke="#A7F3D0"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="17" cy="15" r="2.2" fill="#FDE047" />
          <circle cx="31" cy="21" r="2.2" fill="#FDE047" />
          <circle cx="17" cy="27" r="2.2" fill="#FDE047" />
          <circle cx="30" cy="31" r="2" fill="#FDE047" />
          <circle cx="24" cy="24" r="3" fill="white" stroke="#059669" strokeWidth="1.5" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-wider text-emerald-950 font-sans">
              AGRO<span className="text-emerald-600">-IOT</span>
            </span>
          </div>
          <span className="text-[11px] font-medium text-stone-500">
            Smart Farming Assistant
          </span>
        </div>
      )}
    </div>
  );
};
