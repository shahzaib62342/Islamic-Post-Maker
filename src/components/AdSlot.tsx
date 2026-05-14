import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdSlotProps {
  slot?: string;
  width?: string;
  height?: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  format?: 'auto' | 'fluid' | 'rectangle';
}

export default function AdSlot({ slot, width, height, label = "Advertisement", className = "", style = {}, format = 'auto' }: AdSlotProps) {
  useEffect(() => {
    if (slot) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn("AdSense error:", e);
      }
    }
  }, [slot]);

  if (!slot) {
    return (
      <div 
        className={`relative bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden group ${className}`}
        style={{ 
          width: width || '100%', 
          height: height || '100%', 
          minWidth: width, 
          minHeight: height,
          ...style 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 to-transparent" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            {label}
          </div>
          <div className="w-12 h-0.5 bg-gray-200 rounded-full opacity-50" />
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ width, height, ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
