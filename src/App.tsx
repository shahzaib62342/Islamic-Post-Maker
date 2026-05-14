import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import './index.css';

import Sidebar from './components/Sidebar';
import PosterPreview from './components/PosterPreview';
import CornerModal from './components/CornerModal';
import { usePosterStore } from './store/usePosterStore';

import { Toaster } from 'react-hot-toast';
import { initGA, trackAction, trackPageView } from './utils/analytics';
import { Download } from 'lucide-react';

import AdSlot from './components/AdSlot';
import InterstitialAd from './components/InterstitialAd';
import ExportModal from './components/ExportModal';
import { toJpeg } from 'html-to-image';

export default function App() {
  const posterRef = useRef<HTMLDivElement>(null);
  const { showGuides, setShowGuides, isDownloading, setIsDownloading, isSidebarVisible } = usePosterStore();
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    initGA();
    trackPageView(window.location.pathname);
  }, []);

  const executeExport = async (format: 'png' | 'jpg' | 'jpeg') => {
    if (!posterRef.current) return;

    setIsDownloading(true);
    const wasShowingGuides = showGuides;
    if (wasShowingGuides) setShowGuides(false);

    // Wait for state update (guides to hide)
    setTimeout(async () => {
      try {
        let dataUrl = '';
        if (format === 'png') {
          dataUrl = await toPng(posterRef.current!, { pixelRatio: 3, backgroundColor: '#ffffff' });
        } else {
          dataUrl = await toJpeg(posterRef.current!, { pixelRatio: 3, backgroundColor: '#ffffff', quality: 0.95 });
        }

        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '_');
        const filename = `profilixa_islamic_post_${dateStr}.${format}`;

        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();

        trackAction("Export Success", { method: format.toUpperCase() });
        setIsExportModalOpen(false);
      } catch (err) {
        console.error("Export failed:", err);
        trackAction("Export Failed", { error: String(err) });
      } finally {
        if (wasShowingGuides) setShowGuides(true);
        setIsDownloading(false);
      }
    }, 100);
  };

  const handleExportRequest = () => {
    trackAction("Export Request Initiated");
    // Show the full screen ad first
    setIsAdOpen(true);
  };

  const handleAdClose = () => {
    setIsAdOpen(false);
    // After ad is closed, show format selector
    setIsExportModalOpen(true);
  };

  return (
    <div style={{ '--poster-height': !isSidebarVisible ? '100vh' : '55vh' } as React.CSSProperties}>
      <Toaster position="top-right" />
      <InterstitialAd isOpen={isAdOpen} onClose={handleAdClose} />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={executeExport}
        isExporting={isDownloading}
      />

      {/* Main Content Area with Ads */}
      <main className="flex-1 flex flex-col h-full lg:ml-[450px] bg-gray-50 overflow-hidden">
        <h1 className="sr-only">Islamic Poster Maker - Online Urdu Quran and Hadith Post Designer</h1>
        <div className="flex-1 flex flex-col lg:flex-row overflow-visible lg:overflow-hidden min-h-0">
          {/* Left Ad */}
          <div className="w-[176px] flex-shrink-0 hidden xl:flex items-center justify-center p-2 bg-gray-50 border-r border-gray-100">
            <AdSlot
              slot="8558754709"
              width="160px" height="600px" label="Side Ad"
            />
          </div>

          {/* Center Preview */}
          <div className="flex-1 relative min-h-[50vh] lg:min-h-0">
            {/* Floating Mobile Download Button */}
            <div className={`lg:hidden fixed top-4 right-4 z-[100] transition-all duration-500`}>
              <button
                onClick={handleExportRequest}
                disabled={isDownloading}
                className="group relative bg-gradient-to-br from-gray-900 to-black text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] active:scale-95 transition-all border border-white/10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isDownloading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <div className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white group-hover:text-black transition-colors">
                      <Download className="w-3.5 h-3.5" />
                    </div>
                    <span>Export</span>
                  </>
                )}
              </button>
            </div>

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

        {/* Bottom Ad (Hidden on mobile to prevent UI overlap) */}
        <div className="h-[76px] flex-shrink-0 hidden md:flex items-center justify-center p-2 bg-white border-t border-gray-100">
          <AdSlot
            slot="7363881087"
            width="100%" height="60px" label="Bottom Banner Ad" className="max-w-4xl"
          />
        </div>
      </main>

      <Sidebar onExport={handleExportRequest} />

      <CornerModal />
    </div>
  );
}
