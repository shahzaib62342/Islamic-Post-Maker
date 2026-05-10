import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Position {
  x: number;
  y: number;
  width?: string | number;
  height?: string | number;
}

interface PosterState {
  // Content
  headerText: string;
  hadithText: string;
  refText: string;
  
  // Layout Positions
  headerPos: Position;
  hadithPos: Position;
  refPos: Position;
  watermarkPos: Position;

  // Typography
  headerSize: number;
  hadithSize: number;
  refSize: number;
  textColor: string;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  
  // Layout & Background
  showGuides: boolean;
  bgImage: string;
  aspectRatio: 'portrait' | 'square' | 'story';
  
  // Corner Decoration
  activeCorner: string;
  cornerSide: string;
  cornerVSide: string;
  cornerSize: number;
  
  // Watermark
  watermarkUrl: string;
  watermarkOpacity: number;
  
  // Transient App State (Ignored by persist)
  isDownloading: boolean;
  isModalOpen: boolean;

  // Actions
  setHeaderText: (text: string) => void;
  setHadithText: (text: string) => void;
  setRefText: (text: string) => void;
  
  setHeaderPos: (pos: Position) => void;
  setHadithPos: (pos: Position) => void;
  setRefPos: (pos: Position) => void;
  setWatermarkPos: (pos: Position) => void;

  setHeaderSize: (size: number) => void;
  setHadithSize: (size: number) => void;
  setRefSize: (size: number) => void;
  setTextColor: (color: string) => void;
  setFontFamily: (font: string) => void;
  setTextAlign: (align: 'left' | 'center' | 'right' | 'justify') => void;
  setLineHeight: (height: number) => void;
  
  setShowGuides: (show: boolean) => void;
  setBgImage: (url: string) => void;
  setAspectRatio: (ratio: 'portrait' | 'square' | 'story') => void;
  
  setActiveCorner: (url: string) => void;
  setCornerSide: (side: string) => void;
  setCornerVSide: (vSide: string) => void;
  setCornerSize: (size: number) => void;

  setWatermarkUrl: (url: string) => void;
  setWatermarkOpacity: (opacity: number) => void;
  setIsDownloading: (isDownloading: boolean) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  
  // Reset function
  resetTemplate: () => void;
}

const defaultState = {
  headerText: 'ابو یعلی ابوہُریرہ رضی اﷲ تعالٰی عنہ سے روایت کرتے ہیں کہ رسول اﷲ صلی اﷲ تعالٰی علیہ وسلم نے فرمایا',
  hadithText: 'جو [r]حج[/r] کے لیے نکلا اور مرگیا۔قیامت تک اُس کے لیے حج کرنے والے کا ثواب لکھا جائے گا اور جو [g]عمرہ[/g] کے لیے نکلا اور مرگیا اس کے لیے قیامت تک عمرہ کرنے والے کا ثواب لکھا جائے گا۔',
  refText: '( مسند أبي یعلی ، مسند أبي ھریرۃ رضی اللّٰہ عنہ ، الحدیث : ۶۳۲۷ )',
  
  headerPos: { x: 0, y: 10, width: '100%', height: 'auto' },
  hadithPos: { x: 0, y: 100, width: '100%', height: 'auto' },
  refPos: { x: 0, y: 525, width: '100%', height: 'auto' },
  watermarkPos: { x: 0, y: 0, width: 100, height: 100 },

  headerSize: 13,
  hadithSize: 18,
  refSize: 10,
  textColor: '#1a1a1a',
  fontFamily: "'Noto Nastaliq Urdu', serif",
  textAlign: 'center' as const,
  lineHeight: 1.8,
  
  showGuides: true,
  bgImage: 'https://i.ibb.co/5hhKkrh6/Chat-GPT-Image-May-10-2026-11-25-48-AM.png',
  aspectRatio: 'portrait' as const,
  
  activeCorner: '',
  cornerSide: 'left',
  cornerVSide: 'bottom',
  cornerSize: 120,

  watermarkUrl: '',
  watermarkOpacity: 1,

  isDownloading: false,
  isModalOpen: false,
};

export const usePosterStore = create<PosterState>()(
  persist(
    (set) => ({
      ...defaultState,

      setHeaderText: (text) => set({ headerText: text }),
      setHadithText: (text) => set({ hadithText: text }),
      setRefText: (text) => set({ refText: text }),
      
      setHeaderPos: (pos) => set((state) => ({ headerPos: { ...state.headerPos, ...pos } })),
      setHadithPos: (pos) => set((state) => ({ hadithPos: { ...state.hadithPos, ...pos } })),
      setRefPos: (pos) => set((state) => ({ refPos: { ...state.refPos, ...pos } })),
      setWatermarkPos: (pos) => set((state) => ({ watermarkPos: { ...state.watermarkPos, ...pos } })),

      setHeaderSize: (size) => set({ headerSize: size }),
      setHadithSize: (size) => set({ hadithSize: size }),
      setRefSize: (size) => set({ refSize: size }),
      setTextColor: (color) => set({ textColor: color }),
      setFontFamily: (font) => set({ fontFamily: font }),
      setTextAlign: (align) => set({ textAlign: align }),
      setLineHeight: (height) => set({ lineHeight: height }),
      
      setShowGuides: (show) => set({ showGuides: show }),
      setBgImage: (url) => set({ bgImage: url }),
      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
      
      setActiveCorner: (url) => set({ activeCorner: url }),
      setCornerSide: (side) => set({ cornerSide: side }),
      setCornerVSide: (vSide) => set({ cornerVSide: vSide }),
      setCornerSize: (size) => set({ cornerSize: size }),

      setWatermarkUrl: (url) => set({ watermarkUrl: url }),
      setWatermarkOpacity: (opacity) => set({ watermarkOpacity: opacity }),

      setIsDownloading: (isDownloading) => set({ isDownloading }),
      setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),

      resetTemplate: () => set({ ...defaultState }),
    }),
    {
      name: 'islamic-poster-storage',
      partialize: (state) => ({
        // We only persist the poster design, not the app state
        ...state,
        isDownloading: undefined,
        isModalOpen: undefined,
      }),
    }
  )
);
