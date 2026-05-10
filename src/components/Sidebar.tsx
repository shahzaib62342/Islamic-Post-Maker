import React, { useState } from 'react';

interface SidebarProps {
    headerText: string; setHeaderText: (v: string) => void;
    hadithText: string; setHadithText: (v: string) => void;
    refText: string; setRefText: (v: string) => void;
    headerSize: number; setHeaderSize: (v: number) => void;
    hadithSize: number; setHadithSize: (v: number) => void;
    refSize: number; setRefSize: (v: number) => void;
    showGuides: boolean; setShowGuides: (v: boolean) => void;
    bgImage: string; setBgImage: (v: string) => void;
    textColor: string; setTextColor: (v: string) => void;
    onOpenModal: () => void;
    onDownload: () => void;
    isDownloading: boolean;
}

export default function Sidebar({
    headerText, setHeaderText,
    hadithText, setHadithText,
    refText, setRefText,
    headerSize, setHeaderSize,
    hadithSize, setHadithSize,
    refSize, setRefSize,
    showGuides, setShowGuides,
    bgImage, setBgImage,
    textColor, setTextColor,
    onOpenModal,
    onDownload,
    isDownloading
}: SidebarProps) {
    const backgrounds = [
        { id: '1', src: 'https://i.ibb.co/5hhKkrh6/Chat-GPT-Image-May-10-2026-11-25-48-AM.png' },
        { id: '2', src: 'https://i.ibb.co/hxL6st4f/ded6bc86-b223-4870-bb7e-2273b773bf24.png' },
        { id: '3', src: 'https://i.ibb.co/Rk9cfQRb/3ecd4330-6657-4376-8338-af6353463745.png' },
    ];

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

    const handleDoubleClick = (e: React.MouseEvent<HTMLTextAreaElement>, target: 'header' | 'hadith' | 'ref') => {
        handleSelection(e, target);
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
        <div className="controls">
            <div className="flex items-center justify-between mb-6 border-b pb-2">
                <h2 className="text-xl font-bold text-gray-800">Poster Designer</h2>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Top Header (Urdu)</label>
                    <textarea 
                        rows={2} 
                        placeholder="Enter narrator text..." 
                        value={headerText} 
                        onChange={e => setHeaderText(e.target.value)} 
                        onContextMenu={e => handleContextMenu(e, 'header')}
                        onDoubleClick={e => handleDoubleClick(e, 'header')}
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Main Hadith (Urdu)</label>
                    <textarea 
                        rows={5} 
                        placeholder="Enter Hadith text..." 
                        value={hadithText} 
                        onChange={e => setHadithText(e.target.value)} 
                        onContextMenu={e => handleContextMenu(e, 'hadith')}
                        onDoubleClick={e => handleDoubleClick(e, 'hadith')}
                    />
                    <p className="text-[10px] text-gray-400 italic">Formatting: [r]Red Text[/r] or [c=#hex]Colored[/c] (Right click/Double click to color)</p>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Reference (Urdu)</label>
                    <textarea 
                        rows={2} 
                        placeholder="Enter book reference..." 
                        value={refText} 
                        onChange={e => setRefText(e.target.value)} 
                        onContextMenu={e => handleContextMenu(e, 'ref')}
                        onDoubleClick={e => handleDoubleClick(e, 'ref')}
                    />
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-dashed border-gray-200">
                    <input type="checkbox" id="toggle-guides" checked={showGuides} onChange={e => setShowGuides(e.target.checked)} className="w-4 h-4 accent-amber-600 cursor-pointer" />
                    <label htmlFor="toggle-guides" className="text-[11px] font-bold text-gray-500 uppercase cursor-pointer">Show Text Outline Boxes</label>
                </div>
            </div>

            <div className="mt-6 space-y-2">
                <div className="size-control">
                    <div className="flex justify-between text-xs font-bold text-gray-600 mb-2">
                        <span>Header Size</span>
                        <span className="text-amber-600">{headerSize}px</span>
                    </div>
                    <input type="range" min="10" max="25" value={headerSize} onChange={e => setHeaderSize(Number(e.target.value))} />
                </div>

                <div className="size-control">
                    <div className="flex justify-between text-xs font-bold text-gray-600 mb-2">
                        <span>Main Font Size</span>
                        <span className="text-amber-600">{hadithSize}px</span>
                    </div>
                    <input type="range" min="14" max="36" value={hadithSize} onChange={e => setHadithSize(Number(e.target.value))} />
                </div>

                <div className="size-control">
                    <div className="flex justify-between text-xs font-bold text-gray-600 mb-2">
                        <span>Ref Font Size</span>
                        <span className="text-amber-600">{refSize}px</span>
                    </div>
                    <input type="range" min="8" max="18" value={refSize} onChange={e => setRefSize(Number(e.target.value))} />
                </div>

                <div className="size-control">
                    <div className="flex justify-between text-xs font-bold text-gray-600 mb-2">
                        <span>Text Color</span>
                        <span className="text-amber-600 uppercase">{textColor}</span>
                    </div>
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-8 cursor-pointer rounded bg-transparent" />
                </div>
            </div>

            <div className="mt-6 border-t pt-6 space-y-6">
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">Background Selection</label>
                    <div className="grid grid-cols-3 gap-2">
                        {backgrounds.map((bg) => (
                            <div 
                                key={bg.id}
                                className={`corner-thumb ${bgImage === bg.src ? 'active' : ''}`}
                                onClick={() => setBgImage(bg.src)}
                            >
                                <img src={bg.src} alt={`Bg ${bg.id}`} className="rounded-sm w-full h-auto aspect-[500/750] object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={onOpenModal} className="btn-open-modal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                    Select Corner Decoration
                </button>
            </div>

            <button onClick={onDownload} disabled={isDownloading} className="btn-download mt-6" style={{ opacity: isDownloading ? 0.7 : 1 }}>
                {isDownloading ? 'Generating...' : 'Download Image (PNG)'}
            </button>

            <p className="text-center text-[10px] text-gray-400 mt-4">Optimized for high-quality sharing</p>

            {popover && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setPopover(null)}></div>
                    <div 
                        className="fixed z-50 bg-white shadow-2xl rounded-xl p-4 border border-gray-100"
                        style={{ left: Math.min(popover.x, window.innerWidth - 220), top: Math.min(popover.y, window.innerHeight - 150), width: '200px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Color Selected Text</div>
                        <input 
                            type="color" 
                            value={popoverColor} 
                            onChange={e => setPopoverColor(e.target.value)} 
                            className="w-full h-10 cursor-pointer rounded-lg bg-transparent mb-4 border border-gray-200"
                        />
                        <div className="flex space-x-2">
                            <button 
                                onClick={applyColor}
                                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                            >Apply</button>
                            <button 
                                onClick={() => setPopover(null)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg transition-colors"
                            >Cancel</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
