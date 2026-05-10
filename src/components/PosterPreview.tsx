import React from 'react';

const formatText = (str: string) => {
  if (!str) return { __html: "" };
  const html = str
    .replace(/\[r\](.*?)\[\/r\]/gi, '<span class="red-text">$1</span>')
    .replace(/\[g\](.*?)\[\/g\]/gi, '<span class="green-text">$1</span>')
    .replace(/\[c=(#[0-9a-fA-F]{3,6})\](.*?)\[\/c\]/gi, '<span style="color:$1">$2</span>');
  return { __html: html };
};

interface PosterPreviewProps {
  posterRef: React.RefObject<HTMLDivElement | null>;
  headerText: string;
  hadithText: string;
  refText: string;
  headerSize: number;
  hadithSize: number;
  refSize: number;
  showGuides: boolean;
  bgImage: string;
  textColor: string;
  activeCorner: string;
  cornerSide: string;
  cornerVSide: string;
  cornerSize: number;
}

export default function PosterPreview({
  posterRef,
  headerText,
  hadithText,
  refText,
  headerSize,
  hadithSize,
  refSize,
  showGuides,
  bgImage,
  textColor,
  activeCorner,
  cornerSide,
  cornerVSide,
  cornerSize
}: PosterPreviewProps) {
  const isDarkTheme = bgImage === 'https://i.ibb.co/hxL6st4f/ded6bc86-b223-4870-bb7e-2273b773bf24.png';

  return (
    <div className="poster-container">
        <div id="poster-canvas" ref={posterRef} style={{ backgroundImage: `url('${bgImage}')` }}>
            <div className={`text-container ${showGuides ? 'show-guides' : ''} ${isDarkTheme ? 'dark-theme' : ''}`}>
                <div className="header-text" style={{ fontSize: `${headerSize}px`, color: textColor }} dangerouslySetInnerHTML={formatText(headerText)}></div>
                <div className="main-hadith" style={{ fontSize: `${hadithSize}px`, color: textColor }}><span dangerouslySetInnerHTML={formatText(hadithText)}></span></div>
                <div className="reference" style={{ fontSize: `${refSize}px`, color: textColor }} dangerouslySetInnerHTML={formatText(refText)}></div>
            </div>
            {activeCorner && (
              <img 
                className="corner-decoration" 
                src={activeCorner} 
                style={{
                  display: 'block',
                  width: `${cornerSize}px`,
                  left: cornerSide === 'left' ? '0' : 'auto',
                  right: cornerSide === 'right' ? '0' : 'auto',
                  top: cornerVSide === 'top' ? '0' : 'auto',
                  bottom: cornerVSide === 'bottom' ? '0' : 'auto',
                  transform: `scale(${cornerSide === 'left' ? -1 : 1}, 1)`
                }} 
                alt="" 
              />
            )}
        </div>
    </div>
  );
}
