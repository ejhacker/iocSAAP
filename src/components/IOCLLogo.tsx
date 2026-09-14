import { FC } from 'react';

interface IOCLLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textColor?: string;
}

export const IOCLLogo: FC<IOCLLogoProps> = ({ 
  size = 'md', 
  showText = true,
  textColor = 'text-slate-900'
}) => {
  const dimensions = {
    sm: { circle: 32, icon: 'w-8 h-8' },
    md: { circle: 42, icon: 'w-10 h-10 sm:w-11 sm:h-11' },
    lg: { circle: 56, icon: 'w-14 h-14' },
  }[size];

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Authentic IndianOil Circular Emblem */}
      <div className={`relative flex-shrink-0 ${dimensions.icon} rounded-full shadow-xs`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Saffron Outer/Inner Circle */}
          <circle cx="50" cy="50" r="48" fill="#F37021" stroke="#D95A0F" strokeWidth="2" />
          
          {/* Top text area: 'इंडियनऑयल' (Hindi) in white */}
          <text
            x="50"
            y="28"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="12.5"
            fontWeight="bold"
            fontFamily="'Public Sans', sans-serif"
            letterSpacing="0.5"
          >
            इंडियनऑयल
          </text>

          {/* Central IndianOil Navy Horizontal Band */}
          <rect x="2" y="38" width="96" height="24" rx="2" fill="#002B49" />

          {/* Slogan / Accent inside navy bar */}
          <text
            x="50"
            y="54"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="11.5"
            fontWeight="800"
            fontFamily="'Public Sans', sans-serif"
            letterSpacing="1.2"
          >
            IndianOil
          </text>

          {/* Bottom decorative arc/star */}
          <circle cx="50" cy="74" r="3" fill="#FFFFFF" />
          <circle cx="40" cy="73" r="2.2" fill="#FFFFFF" opacity="0.9" />
          <circle cx="60" cy="73" r="2.2" fill="#FFFFFF" opacity="0.9" />
          <circle cx="31" cy="71" r="1.6" fill="#FFFFFF" opacity="0.8" />
          <circle cx="69" cy="71" r="1.6" fill="#FFFFFF" opacity="0.8" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-slate-900 text-base sm:text-lg leading-tight">
              IndianOil
            </span>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[#F37021]/10 text-[#C2410C] border border-[#F37021]/20">
              IOCL
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#002B49] tracking-wide">
            इंडियन ऑयल कॉर्पोरेशन लिमिटेड
          </span>
        </div>
      )}
    </div>
  );
};
