import { useState, useEffect } from 'react';
import AdSlot from './AdSlot';
import { X } from 'lucide-react';

interface InterstitialAdProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InterstitialAd({ isOpen, onClose }: InterstitialAdProps) {
  const [canClose, setCanClose] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3);

  useEffect(() => {
    if (isOpen) {
      setCanClose(false);
      setTimeLeft(3);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center p-6 animate-fadeIn">
      <div className="absolute top-8 right-8">
        <button
          onClick={onClose}
          className={`group flex items-center gap-2 p-2 px-4 rounded-full transition-all ${
            canClose 
            ? 'bg-gray-900 text-white hover:bg-black shadow-xl active:scale-95' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
          }`}
          disabled={!canClose}
        >
          <span className="text-[10px] font-black uppercase tracking-widest">
            {canClose ? 'Close Ad' : `Wait ${timeLeft}s`}
          </span>
          <X className={`w-5 h-5 ${canClose ? 'animate-bounce' : ''}`} />
        </button>
      </div>

      <div className="text-center mb-12">
        <div className="inline-block px-3 py-1 bg-gray-50 rounded-full border border-gray-100 mb-4">
          <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Sponsored Content</h3>
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Exporting your Post</h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Please support us by viewing this brief ad</p>
      </div>

      <div className="w-full max-w-sm aspect-[4/5] bg-gray-50 rounded-[32px] border border-gray-100 shadow-inner p-4 flex items-center justify-center">
        <AdSlot
          slot="4427938003"
          width="100%"
          height="100%"
          label="Interstitial Ad Unit"
        />
      </div>

      <div className="mt-12 text-center">
        {!canClose ? (
          <div className="space-y-2">
            <div className="w-48 h-1 bg-gray-100 rounded-full mx-auto overflow-hidden">
              <div 
                className="h-full bg-gray-900 transition-all duration-1000 ease-linear" 
                style={{ width: `${((3 - timeLeft) / 3) * 100}%` }}
              />
            </div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Closing in {timeLeft} seconds...
            </p>
          </div>
        ) : (
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
            Ready to export! Click close above.
          </p>
        )}
      </div>
    </div>
  );
}
