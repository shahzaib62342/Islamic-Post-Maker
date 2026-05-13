import { useRef } from 'react';
import { toPng } from 'html-to-image';
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
        const dataUrl = await toPng(posterRef.current!, {
          pixelRatio: 3,
          backgroundColor: '#ffffff'
        });

        const link = document.createElement('a');
        link.download = 'Islamic-Poster.png';
        link.href = dataUrl;
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
