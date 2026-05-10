import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import './index.css';

import Sidebar from './components/Sidebar';
import PosterPreview from './components/PosterPreview';
import CornerModal from './components/CornerModal';

export default function App() {
  const [headerText, setHeaderText] = useState('ابو یعلی ابوہُریرہ رضی اﷲ تعالٰی عنہ سے روایت کرتے ہیں کہ رسول اﷲ صلی اﷲ تعالٰی علیہ وسلم نے فرمایا');
  const [hadithText, setHadithText] = useState('جو [r]حج[/r] کے لیے نکلا اور مرگیا۔قیامت تک اُس کے لیے حج کرنے والے کا ثواب لکھا جائے گا اور جو [g]عمرہ[/g] کے لیے نکلا اور مرگیا اس کے لیے قیامت تک عمرہ کرنے والے کا ثواب لکھا جائے گا۔');
  const [refText, setRefText] = useState('( مسند أبي یعلی ، مسند أبي ھریرۃ رضی اللّٰہ عنہ ، الحدیث : ۶۳۲۷ )');

  const [headerSize, setHeaderSize] = useState(16);
  const [hadithSize, setHadithSize] = useState(22);
  const [refSize, setRefSize] = useState(12);
  const [showGuides, setShowGuides] = useState(true);
  const [bgImage, setBgImage] = useState('https://i.ibb.co/5hhKkrh6/Chat-GPT-Image-May-10-2026-11-25-48-AM.png');
  const [textColor, setTextColor] = useState('#1a1a1a');

  const handleBgChange = (newBg: string) => {
    setBgImage(newBg);
    if (newBg === 'https://i.ibb.co/hxL6st4f/ded6bc86-b223-4870-bb7e-2273b773bf24.png') {
      setTextColor('#ffffff');
    } else {
      setTextColor('#1a1a1a');
    }
  };

  // Main applied decoration
  const [activeCorner, setActiveCorner] = useState('');
  const [cornerSide, setCornerSide] = useState('left');
  const [cornerVSide, setCornerVSide] = useState('bottom');
  const [cornerSize, setCornerSize] = useState(120);

  // Modal temporary decoration
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSrc, setTempSrc] = useState('');
  const [tempSide, setTempSide] = useState('left');
  const [tempVSide, setTempVSide] = useState('bottom');
  const [tempSize, setTempSize] = useState(120);

  const [isDownloading, setIsDownloading] = useState(false);
  
  const posterRef = useRef<HTMLDivElement>(null);

  const openModal = () => {
    setTempSrc(activeCorner);
    setTempSide(cornerSide);
    setTempVSide(cornerVSide);
    setTempSize(cornerSize);
    setIsModalOpen(true);
  };

  const applyDecoration = () => {
    setActiveCorner(tempSrc);
    setCornerSide(tempSide);
    setCornerVSide(tempVSide);
    setCornerSize(tempSize);
    setIsModalOpen(false);
  };

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
        link.download = 'Islamic-Hadith-Poster.png';
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
      <Sidebar 
        headerText={headerText} setHeaderText={setHeaderText}
        hadithText={hadithText} setHadithText={setHadithText}
        refText={refText} setRefText={setRefText}
        headerSize={headerSize} setHeaderSize={setHeaderSize}
        hadithSize={hadithSize} setHadithSize={setHadithSize}
        refSize={refSize} setRefSize={setRefSize}
        showGuides={showGuides} setShowGuides={setShowGuides}
        bgImage={bgImage} setBgImage={handleBgChange}
        textColor={textColor} setTextColor={setTextColor}
        onOpenModal={openModal}
        onDownload={downloadImage}
        isDownloading={isDownloading}
      />

      <PosterPreview 
        posterRef={posterRef}
        headerText={headerText}
        hadithText={hadithText}
        refText={refText}
        headerSize={headerSize}
        hadithSize={hadithSize}
        refSize={refSize}
        showGuides={showGuides}
        bgImage={bgImage}
        textColor={textColor}
        activeCorner={activeCorner}
        cornerSide={cornerSide}
        cornerVSide={cornerVSide}
        cornerSize={cornerSize}
      />

      <CornerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tempSrc={tempSrc} setTempSrc={setTempSrc}
        tempSide={tempSide} setTempSide={setTempSide}
        tempVSide={tempVSide} setTempVSide={setTempVSide}
        tempSize={tempSize} setTempSize={setTempSize}
        onApply={applyDecoration}
      />
    </>
  );
}
