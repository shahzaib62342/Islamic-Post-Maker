import { useState, useEffect } from 'react';
import AdSlot from './AdSlot';
import { X } from 'lucide-react';

interface InterstitialAdProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InterstitialAd({ isOpen, onClose }: InterstitialAdProps) {
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCanClose(false);
      // Wait 3 seconds before allowing close to simulate ad engagement
      const timer = setTimeout(() => setCanClose(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 animate-fadeIn">
      <div className="absolute top-6 right-6">
        <button
          onClick={onClose}
          className={`p-2 rounded-full transition-all ${canClose ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'text-gray-200 cursor-not-allowed'}`}
          disabled={!canClose}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Advertisement</h3>
        <p className="text-[10px] font-bold text-gray-300 uppercase">Your download will start after the ad</p>
      </div>

      <div className="w-full max-w-lg aspect-[4/5] md:aspect-square">
        <AdSlot
          slot="4427938003" // USER: Replace with actual Interstitial/Large Rect slot ID
          width="100%"
          height="100%"
          label="Full Screen Ad Unit"
        />
      </div>

      <div className="mt-8 text-center">
        {!canClose && (
          <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest animate-pulse">
            Please wait...
          </p>
        )}
      </div>
    </div>
  );
}
