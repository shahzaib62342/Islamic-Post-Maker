import React, { useRef, useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { usePosterStore, type Position } from '../store/usePosterStore';

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
}

export default function PosterPreview({ posterRef }: PosterPreviewProps) {
  const {
    headerText, hadithText, refText,
    headerPos, hadithPos, refPos, watermarkPos,
    setHeaderPos, setHadithPos, setRefPos, setWatermarkPos,
    headerSize, hadithSize, refSize,
    textColor, headerFont, hadithFont, refFont, textAlign, lineHeight,
    textBgStyle,
    showGuides, bgImage, bgOverlayOpacity, bgOverlayColor, activeCorner,
    cornerSide, cornerVSide, cornerSize,
    aspectRatio, watermarkUrl, watermarkOpacity
  } = usePosterStore();

  const isDarkTheme = bgImage === 'https://i.ibb.co/hxL6st4f/ded6bc86-b223-4870-bb7e-2273b773bf24.png';

  // Calculate fixed logical height based on 450px width
  const logicalWidth = 450;
  const logicalHeight = aspectRatio === 'square' ? 450 : aspectRatio === 'story' ? 800 : 675;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [safeBgUrl, setSafeBgUrl] = useState<string>('');

  // Ensure background images are converted to local blobs so html2canvas doesn't fetch dynamic URLs twice
  useEffect(() => {
    if (!bgImage) {
      setSafeBgUrl('');
      return;
    }
    // If it's already a data URI or local blob, use it directly
    if (bgImage.startsWith('data:') || bgImage.startsWith('blob:')) {
      setSafeBgUrl(bgImage);
      return;
    }
    
    // Otherwise, fetch it and convert to a local blob to guarantee it never changes on download
    let active = true;
    fetch(bgImage)
      .then(res => res.blob())
      .then(blob => {
        if (!active) return;
        setSafeBgUrl(URL.createObjectURL(blob));
      })
      .catch(err => {
        console.warn("Failed to fetch bgImage as blob, falling back to direct URL", err);
        if (active) setSafeBgUrl(bgImage);
      });
      
    return () => { active = false; };
  }, [bgImage]);

  // Responsive scale observer
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.clientWidth;
        const parentHeight = containerRef.current.clientHeight;

        // 160px padding for visual breathing room so the poster isn't huge
        const scaleW = (parentWidth - 160) / logicalWidth;
        const scaleH = (parentHeight - 160) / logicalHeight;

        // Force a slightly smaller maximum scale (0.85) so it always looks clean and "short"
        setScale(Math.min(scaleW, scaleH, 0.85));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [logicalWidth, logicalHeight]);

  // Clean up bad persisted localstorage data (e.g. percentages or auto width)
  const sanitizePos = (pos: Position, defaultY: number): Position => {
    let y = pos.y;
    if (typeof y === 'string') {
      if (y === '0%') y = 10;
      else if (y === '25%') y = 100;
      else if (y === '80%') y = logicalHeight - 150;
      else y = defaultY;
    }

    let w = pos.width;
    if (w === 'auto') w = '100%'; // Force 100% instead of auto to prevent text overflow

    let x = typeof pos.x === 'string' ? 0 : pos.x;

    // Manually enforce bounds on load so it doesn't wait for a click to snap back
    const safeAreaWidth = 396; // 450 - 27px left padding - 27px right padding
    let widthNum = safeAreaWidth;
    if (typeof w === 'number') widthNum = w;
    else if (typeof w === 'string' && w.endsWith('px')) widthNum = parseInt(w, 10);

    if (x + widthNum > safeAreaWidth) {
      x = Math.max(0, safeAreaWidth - widthNum);
    }
    if (x < 0) x = 0;

    return { ...pos, x, y: y as number, width: w };
  };

  const cleanHeaderPos = sanitizePos(headerPos, 10);
  const cleanHadithPos = sanitizePos(hadithPos, 100);
  const cleanRefPos = sanitizePos(refPos, logicalHeight - 150);
  const cleanWatermarkPos = sanitizePos(watermarkPos, logicalHeight - 120);

  // Common RND props
  const getRndProps = (pos: Position, setter: (pos: Position) => void) => ({
    bounds: "parent",
    position: { x: pos.x, y: pos.y },
    size: { width: pos.width || '100%', height: pos.height || 'auto' },
    onDragStop: (_e: any, d: any) => setter({ ...pos, x: d.x, y: d.y }),
    onResizeStop: (_e: any, _direction: any, ref: any, _delta: any, position: any) => {
      setter({
        ...pos,
        width: ref.style.width,
        height: ref.style.height,
        ...position
      });
    },
    className: `${showGuides ? 'outline-guide' : ''} ${showGuides ? 'hover:ring-2 hover:ring-amber-500 hover:cursor-move' : ''}`,
    enableResizing: showGuides,
    disableDragging: !showGuides,
  });

  return (
    <div className="poster-container overflow-hidden w-full h-full flex items-center justify-center bg-gray-50" ref={containerRef}>

      {/* SCALING WRAPPER */}
      <div
        style={{
          width: logicalWidth,
          height: logicalHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }}
        className="relative flex-shrink-0 shadow-2xl transition-transform duration-200"
      >
        <div
          id="poster-canvas"
          ref={posterRef}
          className={`absolute inset-0 w-full h-full overflow-hidden bg-white ${isDarkTheme ? 'dark-theme' : ''}`}
        >
          {/* Render Background as an Image tag instead of CSS to fix html2canvas bugs */}
          {safeBgUrl && (
             <img 
               src={safeBgUrl} 
               alt="Background" 
               className="absolute inset-0 w-full h-full object-cover z-0" 
               crossOrigin="anonymous" 
             />
          )}

          {/* Background Darken Overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{ backgroundColor: bgOverlayColor, opacity: bgOverlayOpacity }}
          ></div>

          {/* Safe Area Container for Text (8% top/bottom, 6% left/right of 450px) */}
          <div className="absolute inset-0 z-10" style={{ padding: '36px 27px' }}>
            <div className="relative w-full h-full pointer-events-none">

              <Rnd {...getRndProps(cleanHeaderPos, setHeaderPos)} style={{ zIndex: 10, pointerEvents: 'auto' }}>
                <div
                  className={`header-text w-full h-full p-2 rounded-lg transition-colors ${textBgStyle === 'solid' ? 'bg-white/90 shadow-sm' : textBgStyle === 'glass' ? 'bg-white/30 backdrop-blur-md shadow-sm border border-white/20' : ''}`}
                  style={{ fontSize: `${headerSize}px`, color: textColor, textAlign, lineHeight, fontFamily: headerFont }}
                  dangerouslySetInnerHTML={formatText(headerText)}
                ></div>
              </Rnd>

              <Rnd {...getRndProps(cleanHadithPos, setHadithPos)} style={{ zIndex: 10, pointerEvents: 'auto' }}>
                <div
                  className={`main-hadith w-full h-full p-4 rounded-xl transition-colors ${textBgStyle === 'solid' ? 'bg-white/90 shadow-sm' : textBgStyle === 'glass' ? 'bg-white/30 backdrop-blur-md shadow-sm border border-white/20' : ''}`}
                  style={{ fontSize: `${hadithSize}px`, color: textColor, textAlign, lineHeight, fontFamily: hadithFont }}
                  dangerouslySetInnerHTML={formatText(hadithText)}
                ></div>
              </Rnd>

              <Rnd {...getRndProps(cleanRefPos, setRefPos)} style={{ zIndex: 10, pointerEvents: 'auto' }}>
                <div
                  className={`reference w-full h-full p-2 rounded-lg transition-colors ${textBgStyle === 'solid' ? 'bg-white/90 shadow-sm' : textBgStyle === 'glass' ? 'bg-white/30 backdrop-blur-md shadow-sm border border-white/20' : ''}`}
                  style={{ fontSize: `${refSize}px`, color: textColor, textAlign, lineHeight, fontFamily: refFont }}
                  dangerouslySetInnerHTML={formatText(refText)}
                ></div>
              </Rnd>
            </div>
          </div>

          {/* Watermark and Corners (Outside Safe Area) */}
          {watermarkUrl && (
            <Rnd {...getRndProps(cleanWatermarkPos, setWatermarkPos)} style={{ zIndex: 20 }}>
              <img
                src={watermarkUrl}
                alt="Watermark"
                className="w-full h-full object-contain"
                style={{ opacity: watermarkOpacity }}
              />
            </Rnd>
          )}

          {activeCorner && (
            <img
              className="corner-decoration absolute pointer-events-none"
              src={activeCorner}
              style={{
                width: `${cornerSize}px`,
                left: cornerSide === 'left' ? '0' : 'auto',
                right: cornerSide === 'right' ? '0' : 'auto',
                top: cornerVSide === 'top' ? '0' : 'auto',
                bottom: cornerVSide === 'bottom' ? '0' : 'auto',
                transform: `scale(${cornerSide === 'left' ? -1 : 1}, 1)`,
                zIndex: 5
              }}
              alt=""
            />
          )}
        </div>
      </div>
    </div>
  );
}
