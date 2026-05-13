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
        className={`bg-gray-100 border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 font-bold text-[10px] uppercase tracking-widest select-none ${className}`}
        style={{ 
          width: width || '100%', 
          height: height || '100%', 
          minWidth: width, 
          minHeight: height,
          ...style 
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="opacity-50">{label}</span>
          <div className="w-8 h-px bg-gray-200" />
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
