import React, { useState } from 'react';
import { Image, Type, Layout, Settings, Download, Palette, Layers, ChevronDown, AlignLeft, AlignCenter, AlignRight, AlignJustify, Upload } from 'lucide-react';
import { usePosterStore } from '../store/usePosterStore';

interface SidebarProps {
    onDownload: () => void;
}

export default function Sidebar({ onDownload }: SidebarProps) {
    const [activeTab, setActiveTab] = useState<'text' | 'style' | 'bg'>('text');
    const { isDownloading, setIsModalOpen } = usePosterStore();

    return (
        <div className="controls">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-amber-600" />
                        Poster Designer
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Create beautiful Islamic posts</p>
                </div>
                <button 
                    onClick={() => { if (window.confirm('Reset everything to default?')) usePosterStore.getState().resetTemplate(); }}
                    className="text-[10px] uppercase font-bold text-red-500 hover:text-white hover:bg-red-500 border border-red-500 rounded px-2 py-1 transition-colors"
                >
                    Reset
                </button>
            </div>

            <div className="flex gap-2 mb-6">
                <button 
                    onClick={() => setActiveTab('text')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'text' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <Type className="w-4 h-4" /> Content
                </button>
                <button 
                    onClick={() => setActiveTab('style')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'style' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <Palette className="w-4 h-4" /> Styling
                </button>
                <button 
                    onClick={() => setActiveTab('bg')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'bg' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <Layout className="w-4 h-4" /> Layout
                </button>
            </div>

            <div className="overflow-y-auto pb-24 space-y-6">
                {activeTab === 'text' && <TextControls />}
                {activeTab === 'style' && <StyleControls />}
                {activeTab === 'bg' && <LayoutControls onOpenModal={() => setIsModalOpen(true)} />}
            </div>

            <div className="fixed bottom-0 left-0 w-full lg:w-[400px] bg-white border-t p-4 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <button 
                    onClick={onDownload} 
                    disabled={isDownloading} 
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl shadow-lg transition-transform transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <Download className="w-5 h-5" />
                    {isDownloading ? 'Generating High-Res Image...' : 'Download Image (PNG)'}
                </button>
            </div>
        </div>
    );
}

function TextControls() {
    const { 
        headerText, setHeaderText, 
        hadithText, setHadithText, 
        refText, setRefText,
        showGuides, setShowGuides
    } = usePosterStore();

    const [popover, setPopover] = useState<{ show: boolean, x: number, y: number, target: 'header' | 'hadith' | 'ref', start: number, end: number } | null>(null);
    const [popoverColor, setPopoverColor] = useState('#ff0000');

    const handleSelection = (e: React.MouseEvent<HTMLTextAreaElement>, target: 'header' | 'hadith' | 'ref') => {
        const textarea = e.currentTarget;
        const clientX = e.clientX;
        const clientY = e.clientY;
        setTimeout(() => {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            if (start !== end) {
                setPopover({ show: true, x: clientX, y: clientY, target, start, end });
            }
        }, 10);
    };

    const handleContextMenu = (e: React.MouseEvent<HTMLTextAreaElement>, target: 'header' | 'hadith' | 'ref') => {
        if (e.currentTarget.selectionStart !== e.currentTarget.selectionEnd) {
            e.preventDefault();
            handleSelection(e, target);
        }
    };

    const applyColor = () => {
        if (!popover) return;
        const { target, start, end } = popover;
        let text = '';
        let setter: ((v: string) => void) | null = null;
        
        if (target === 'header') { text = headerText; setter = setHeaderText; }
        if (target === 'hadith') { text = hadithText; setter = setHadithText; }
        if (target === 'ref') { text = refText; setter = setRefText; }
        
        if (setter) {
            const before = text.substring(0, start);
            const selected = text.substring(start, end);
            const after = text.substring(end);
            const newText = `${before}[c=${popoverColor}]${selected}[/c]${after}`;
            setter(newText);
        }
        setPopover(null);
    };

    return (
        <div className="space-y-5 animate-fadeIn">
            <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Top Header (Urdu)</label>
                <textarea 
                    rows={2} placeholder="Enter narrator text..." 
                    value={headerText} onChange={e => setHeaderText(e.target.value)} 
                    onContextMenu={e => handleContextMenu(e, 'header')}
                    onDoubleClick={e => handleSelection(e, 'header')}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none"
                    dir="rtl"
                />
            </div>

            <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider flex justify-between">
                    <span>Main Hadith (Urdu)</span>
                </label>
                <textarea 
                    rows={5} placeholder="Enter Hadith text..." 
                    value={hadithText} onChange={e => setHadithText(e.target.value)} 
                    onContextMenu={e => handleContextMenu(e, 'hadith')}
                    onDoubleClick={e => handleSelection(e, 'hadith')}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none"
                    dir="rtl"
                />
                <p className="text-[10px] text-gray-400 mt-1 bg-gray-50 p-2 rounded border border-gray-100">
                    💡 Tip: Select text and double-click or right-click to apply custom color. Use [r]text[/r] for standard red.
                </p>
            </div>

            <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Reference</label>
                <textarea 
                    rows={2} placeholder="Enter book reference..." 
                    value={refText} onChange={e => setRefText(e.target.value)} 
                    onContextMenu={e => handleContextMenu(e, 'ref')}
                    onDoubleClick={e => handleSelection(e, 'ref')}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none"
                    dir="rtl"
                />
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-gray-100 bg-amber-50 p-3 rounded-lg border border-amber-100">
                <input type="checkbox" id="toggle-guides" checked={showGuides} onChange={e => setShowGuides(e.target.checked)} className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                <label htmlFor="toggle-guides" className="text-[11px] font-bold text-amber-800 uppercase cursor-pointer select-none">Enable Drag & Drop Guides</label>
            </div>

            {popover && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setPopover(null)}></div>
                    <div 
                        className="fixed z-50 bg-white shadow-2xl rounded-xl p-4 border border-gray-100"
                        style={{ left: Math.min(popover.x, window.innerWidth - 220), top: Math.min(popover.y, window.innerHeight - 150), width: '200px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Color Selected Text</div>
                        <input type="color" value={popoverColor} onChange={e => setPopoverColor(e.target.value)} className="w-full h-10 cursor-pointer rounded-lg bg-transparent mb-4 border border-gray-200" />
                        <div className="flex gap-2">
                            <button onClick={applyColor} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 rounded-lg transition-colors">Apply</button>
                            <button onClick={() => setPopover(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg transition-colors">Cancel</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function StyleControls() {
    const { 
        headerSize, setHeaderSize,
        hadithSize, setHadithSize,
        refSize, setRefSize,
        textColor, setTextColor,
        fontFamily, setFontFamily,
        textAlign, setTextAlign,
        lineHeight, setLineHeight
    } = usePosterStore();

    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">Typography</label>
                <div className="relative mb-3">
                    <select 
                        value={fontFamily} 
                        onChange={e => setFontFamily(e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-200 rounded-lg p-3 text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none pr-10"
                    >
                        <option value="'Noto Nastaliq Urdu', serif">Noto Nastaliq (Classic Urdu)</option>
                        <option value="'Amiri', serif">Amiri (Classic Arabic)</option>
                        <option value="'Scheherazade New', serif">Scheherazade (Modern Arabic/Urdu)</option>
                        <option value="'Aref Ruqaa', serif">Aref Ruqaa (Calligraphy)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
                
                <div className="flex bg-gray-200 p-1 rounded-lg">
                    <button onClick={() => setTextAlign('right')} className={`flex-1 flex justify-center py-2 rounded-md transition-all ${textAlign === 'right' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}><AlignRight className="w-4 h-4" /></button>
                    <button onClick={() => setTextAlign('center')} className={`flex-1 flex justify-center py-2 rounded-md transition-all ${textAlign === 'center' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}><AlignCenter className="w-4 h-4" /></button>
                    <button onClick={() => setTextAlign('left')} className={`flex-1 flex justify-center py-2 rounded-md transition-all ${textAlign === 'left' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}><AlignLeft className="w-4 h-4" /></button>
                    <button onClick={() => setTextAlign('justify')} className={`flex-1 flex justify-center py-2 rounded-md transition-all ${textAlign === 'justify' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}><AlignJustify className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-5">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Font Sizes</label>
                <div>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-2"><span>Top Header</span><span className="bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{headerSize}px</span></div>
                    <input type="range" min="10" max="40" value={headerSize} onChange={e => setHeaderSize(Number(e.target.value))} className="w-full accent-amber-600" />
                </div>
                <div>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-2"><span>Main Hadith</span><span className="bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{hadithSize}px</span></div>
                    <input type="range" min="14" max="60" value={hadithSize} onChange={e => setHadithSize(Number(e.target.value))} className="w-full accent-amber-600" />
                </div>
                <div>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-2"><span>Reference</span><span className="bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{refSize}px</span></div>
                    <input type="range" min="8" max="30" value={refSize} onChange={e => setRefSize(Number(e.target.value))} className="w-full accent-amber-600" />
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-5">
                <div>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider"><span>Line Height</span><span className="bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{lineHeight}</span></div>
                    <input type="range" min="1" max="3" step="0.1" value={lineHeight} onChange={e => setLineHeight(Number(e.target.value))} className="w-full accent-amber-600" />
                </div>
                <div>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider items-center"><span>Base Text Color</span><span className="bg-white px-2 py-1 rounded shadow-sm border border-gray-100 uppercase text-[10px]">{textColor}</span></div>
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-10 cursor-pointer rounded-lg bg-transparent border border-gray-200" />
                </div>
            </div>
        </div>
    );
}

function LayoutControls({ onOpenModal }: { onOpenModal: () => void }) {
    const { 
        bgImage, setBgImage, setTextColor,
        aspectRatio, setAspectRatio,
        watermarkUrl, setWatermarkUrl, watermarkOpacity, setWatermarkOpacity
    } = usePosterStore();

    const backgrounds = [
        { id: '1', src: 'https://i.ibb.co/5hhKkrh6/Chat-GPT-Image-May-10-2026-11-25-48-AM.png', textColor: '#1a1a1a' },
        { id: '2', src: 'https://i.ibb.co/hxL6st4f/ded6bc86-b223-4870-bb7e-2273b773bf24.png', textColor: '#ffffff' },
        { id: '3', src: 'https://i.ibb.co/Rk9cfQRb/3ecd4330-6657-4376-8338-af6353463745.png', textColor: '#1a1a1a' },
    ];

    const handleBgChange = (bg: { src: string, textColor: string }) => {
        setBgImage(bg.src);
        setTextColor(bg.textColor);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) setter(event.target.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">Canvas Size</label>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setAspectRatio('portrait')}
                        className={`flex-1 text-[11px] font-bold py-2 rounded-md transition-all ${aspectRatio === 'portrait' ? 'bg-white shadow-sm text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >Portrait (2:3)</button>
                    <button 
                        onClick={() => setAspectRatio('square')}
                        className={`flex-1 text-[11px] font-bold py-2 rounded-md transition-all ${aspectRatio === 'square' ? 'bg-white shadow-sm text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >Square (1:1)</button>
                    <button 
                        onClick={() => setAspectRatio('story')}
                        className={`flex-1 text-[11px] font-bold py-2 rounded-md transition-all ${aspectRatio === 'story' ? 'bg-white shadow-sm text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >Story (9:16)</button>
                </div>
            </div>

            <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">Background Setup</label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                    {backgrounds.map((bg) => (
                        <div 
                            key={bg.id}
                            className={`relative rounded-xl overflow-hidden cursor-pointer transition-all ${bgImage === bg.src ? 'ring-2 ring-amber-500 ring-offset-2 scale-105' : 'hover:opacity-80'}`}
                            onClick={() => handleBgChange(bg)}
                        >
                            <img src={bg.src} alt={`Bg ${bg.id}`} className="w-full aspect-[2/3] object-cover" />
                        </div>
                    ))}
                </div>
                <label className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:border-amber-500 hover:text-amber-600 transition-colors cursor-pointer bg-gray-50">
                    <Image className="w-4 h-4" />
                    Upload Custom Background
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setBgImage)} />
                </label>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider flex justify-between">
                    <span>Watermark / Logo</span>
                    {watermarkUrl && <button onClick={() => setWatermarkUrl('')} className="text-red-500 hover:text-red-700 uppercase">Remove</button>}
                </label>
                <label className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:border-amber-500 hover:text-amber-600 transition-colors cursor-pointer bg-white mb-3">
                    <Upload className="w-4 h-4" />
                    {watermarkUrl ? 'Change Watermark' : 'Upload Watermark'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setWatermarkUrl)} />
                </label>
                {watermarkUrl && (
                    <div>
                        <div className="flex justify-between text-xs font-bold text-gray-700 mb-2"><span>Opacity</span><span className="bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{Math.round(watermarkOpacity * 100)}%</span></div>
                        <input type="range" min="0.1" max="1" step="0.1" value={watermarkOpacity} onChange={e => setWatermarkOpacity(Number(e.target.value))} className="w-full accent-amber-600" />
                    </div>
                )}
            </div>

            <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">Decorations</label>
                <button onClick={onOpenModal} className="w-full bg-white border-2 border-amber-500/30 text-amber-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-50 hover:border-amber-500 transition-all">
                    <Settings className="w-4 h-4" />
                    Configure Corner Art
                </button>
            </div>
        </div>
    );
}
