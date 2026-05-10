import { useRef } from 'react';
import html2canvas from 'html2canvas';
import './index.css';

import Sidebar from './components/Sidebar';
import PosterPreview from './components/PosterPreview';
import CornerModal from './components/CornerModal';
import { usePosterStore } from './store/usePosterStore';

export default function App() {
  const posterRef = useRef<HTMLDivElement>(null);
  const { showGuides, setShowGuides, setIsDownloading } = usePosterStore();

  const downloadImage = async () => {
    if (!posterRef.current) return;
    
    setIsDownloading(true);
    const wasShowingGuides = showGuides;
    if (wasShowingGuides) setShowGuides(false);

    // Wait for state update (guides to hide)
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(posterRef.current!, {
          useCORS: true,
          scale: 3,
          backgroundColor: null,
          logging: false
        });

        const link = document.createElement('a');
        link.download = 'Islamic-Poster.png';
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      } catch (err) {
        console.error("Download failed:", err);
      } finally {
        if (wasShowingGuides) setShowGuides(true);
        setIsDownloading(false);
      }
    }, 100);
  };

  return (
    <>
      <Sidebar onDownload={downloadImage} />
      <PosterPreview posterRef={posterRef} />
      <CornerModal />
    </>
  );
}
