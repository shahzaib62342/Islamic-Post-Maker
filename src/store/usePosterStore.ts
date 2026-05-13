import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Position {
  x: number;
  y: number;
  width?: string | number;
  height?: string | number;
}

export interface PosterState {
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
  
  headerFont: string;
  hadithFont: string;
  refFont: string;
  
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  
  // Text Box Style
  textBgStyle: 'none' | 'solid' | 'glass';
  
  // Layout & Background
  showGuides: boolean;
  bgImage: string;
  bgOverlayOpacity: number;
  bgOverlayColor: string;
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
  
  setHeaderFont: (font: string) => void;
  setHadithFont: (font: string) => void;
  setRefFont: (font: string) => void;
  
  setTextAlign: (align: 'left' | 'center' | 'right' | 'justify') => void;
  setLineHeight: (height: number) => void;
  
  setTextBgStyle: (style: 'none' | 'solid' | 'glass') => void;
  
  setShowGuides: (show: boolean) => void;
  setBgImage: (url: string) => void;
  setBgOverlayOpacity: (opacity: number) => void;
  setBgOverlayColor: (color: string) => void;
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
  loadTemplate: (state: Partial<PosterState>) => void;
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
  
  headerFont: "'Amiri', serif",
  hadithFont: "'Noto Nastaliq Urdu', serif",
  refFont: "'Noto Nastaliq Urdu', serif",
  
  textAlign: 'center' as const,
  lineHeight: 1.8,
  
  textBgStyle: 'none' as const,
  
  showGuides: true,
  bgImage: '/bg-islamic.png',
  bgOverlayOpacity: 0,
  bgOverlayColor: '#000000',
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
      
      setHeaderFont: (font) => set({ headerFont: font }),
      setHadithFont: (font) => set({ hadithFont: font }),
      setRefFont: (font) => set({ refFont: font }),
      
      setTextAlign: (align) => set({ textAlign: align }),
      setLineHeight: (height) => set({ lineHeight: height }),
      
      setTextBgStyle: (style) => set({ textBgStyle: style }),
      
      setShowGuides: (show) => set({ showGuides: show }),
      setBgImage: (url) => set({ bgImage: url }),
      setBgOverlayOpacity: (opacity) => set({ bgOverlayOpacity: opacity }),
      setBgOverlayColor: (color) => set({ bgOverlayColor: color }),
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
      loadTemplate: (newState) => set((state) => ({ ...state, ...newState })),
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
