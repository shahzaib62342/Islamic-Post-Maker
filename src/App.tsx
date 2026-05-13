import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import './index.css';

import Sidebar from './components/Sidebar';
import PosterPreview from './components/PosterPreview';
import CornerModal from './components/CornerModal';
import { usePosterStore } from './store/usePosterStore';

import { Toaster } from 'react-hot-toast';
import { initGA, trackAction, trackPageView } from './utils/analytics';

import AdSlot from './components/AdSlot';
import InterstitialAd from './components/InterstitialAd';

export default function App() {
  const posterRef = useRef<HTMLDivElement>(null);
  const { showGuides, setShowGuides, setIsDownloading } = usePosterStore();
  const [isAdOpen, setIsAdOpen] = useState(false);

  useEffect(() => {
    initGA();
    trackPageView(window.location.pathname);
  }, []);

  const executeDownload = async () => {
    if (!posterRef.current) return;

    setIsDownloading(true);
    const wasShowingGuides = showGuides;
    if (wasShowingGuides) setShowGuides(false);

    // Wait for state update (guides to hide)
    setTimeout(async () => {
      try {
        const dataUrl = await toPng(posterRef.current!, {
          pixelRatio: 3,
          backgroundColor: '#ffffff'
        });

        const link = document.createElement('a');
        link.download = 'Islamic-Poster.png';
        link.href = dataUrl;
        link.click();

        trackAction("Export Success", { method: "PNG" });
      } catch (err) {
        console.error("Download failed:", err);
        trackAction("Export Failed", { error: String(err) });
      } finally {
        if (wasShowingGuides) setShowGuides(true);
        setIsDownloading(false);
      }
    }, 100);
  };

  const handleDownloadRequest = () => {
    trackAction("Export Request Initiated");
    // Show the full screen ad first
    setIsAdOpen(true);
  };

  const handleAdClose = () => {
    setIsAdOpen(false);
    // After ad is closed, start the download
    executeDownload();
  };

  return (
    <>
      <Toaster position="top-right" />
      <InterstitialAd isOpen={isAdOpen} onClose={handleAdClose} />

      <Sidebar onDownload={handleDownloadRequest} />

      {/* Main Content Area with Ads */}
      <main className="flex-1 flex flex-col h-full lg:ml-[450px] bg-gray-50 overflow-hidden">
        <h1 className="sr-only">Islamic Poster Maker - Online Urdu Quran and Hadith Post Designer</h1>
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left Ad */}
          <div className="w-[176px] flex-shrink-0 hidden xl:flex items-center justify-center p-2 bg-gray-50 border-r border-gray-100">
            <AdSlot
              slot="8558754709"
              width="160px" height="600px" label="Side Ad"
            />
          </div>

          {/* Center Preview */}
          <div className="flex-1 overflow-hidden relative min-h-0">
            <PosterPreview posterRef={posterRef} />
          </div>

          {/* Right Ad */}
          <div className="w-[176px] flex-shrink-0 hidden xl:flex items-center justify-center p-2 bg-gray-50 border-l border-gray-100">
            <AdSlot
              slot="8558754709"
              width="160px" height="600px" label="Side Ad"
            />
          </div>
        </div>

        {/* Bottom Ad */}
        <div className="h-[76px] flex-shrink-0 flex items-center justify-center p-2 bg-white border-t border-gray-100">
          <AdSlot
            slot="7363881087"
            width="100%" height="60px" label="Bottom Banner Ad" className="max-w-4xl"
          />
        </div>
      </main>

      <CornerModal />
    </>
  );
}
