import React, { useState } from 'react';
import { Image as ImageIcon, Type, Layout, Settings, Download, Palette, Layers, ChevronDown, AlignLeft, AlignCenter, AlignRight, AlignJustify, Upload, Save, Library, Wand2 } from 'lucide-react';
import { usePosterStore } from '../store/usePosterStore';
import { useTemplateStore } from '../store/useTemplateStore';

interface SidebarProps {
    onDownload: () => void;
}

export default function Sidebar({ onDownload }: SidebarProps) {
    const [activeTab, setActiveTab] = useState<'text' | 'style' | 'bg' | 'gallery'>('text');
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
                <button
                    onClick={() => setActiveTab('gallery')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'gallery' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <Library className="w-4 h-4" /> Gallery
                </button>
            </div>

            <div className="overflow-y-auto pb-24 space-y-6">
                {activeTab === 'text' && <TextControls />}
                {activeTab === 'style' && <StyleControls />}
                {activeTab === 'bg' && <LayoutControls onOpenModal={() => setIsModalOpen(true)} />}
                {activeTab === 'gallery' && <GalleryControls />}
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

    const [surah, setSurah] = useState<number>(1);
    const [ayah, setAyah] = useState<number>(1);
    const [isFetching, setIsFetching] = useState(false);

    const [hadithBook, setHadithBook] = useState<string>('bukhari');
    const [hadithNum, setHadithNum] = useState<number>(1);
    const [isFetchingHadith, setIsFetchingHadith] = useState(false);

    const fetchAyah = async (randomAyahNumber?: number) => {
        setIsFetching(true);
        try {
            const url = randomAyahNumber
                ? `https://api.alquran.cloud/v1/ayah/${randomAyahNumber}/editions/quran-uthmani,ur.jalandhry`
                : `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-uthmani,ur.jalandhry`;

            const res = await fetch(url);
            const data = await res.json();
            if (data.code === 200 && data.data.length === 2) {
                setHeaderText('قرآن کریم'); // Quran Kareem in Urdu
                setHadithText(data.data[1].text); // Urdu Only
                setRefText(`( القرآن الكريم ، سورة ${data.data[0].surah.name} ، آية ${data.data[0].numberInSurah} )`);

                if (randomAyahNumber) {
                    setSurah(data.data[0].surah.number);
                    setAyah(data.data[0].numberInSurah);
                }
            } else {
                alert("Ayah not found. Please check Surah and Ayah numbers.");
            }
        } catch (error) {
            alert("Error fetching Ayah.");
        }
        setIsFetching(false);
    };

    const fetchRandomAyah = () => {
        const randomAbsoluteAyah = Math.floor(Math.random() * 6236) + 1;
        fetchAyah(randomAbsoluteAyah);
    };

    const fetchHadith = async (numToFetch: number = hadithNum) => {
        setIsFetchingHadith(true);
        try {
            const [resAra, resUrd] = await Promise.all([
                fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${hadithBook}/${numToFetch}.json`),
                fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-${hadithBook}/${numToFetch}.json`)
            ]);

            if (!resAra.ok || !resUrd.ok) throw new Error("Not found");

            const dataAra = await resAra.json();
            const dataUrd = await resUrd.json();

            const textAra = dataAra.hadiths[0].text;
            const textUrd = dataUrd.hadiths[0].text;

            setHeaderText('رسول اللہ صلی اللہ علیہ وسلم نے فرمایا'); // Prophet said
            setHadithText(textUrd); // Urdu Only

            const bookNamesUrd: Record<string, string> = {
                'bukhari': 'صحيح البخاري',
                'muslim': 'صحيح مسلم',
                'abudawud': 'سنن أبي داود',
                'tirmidhi': 'جامع الترمذي',
                'nasai': 'سنن النسائي',
                'ibnmajah': 'سنن ابن ماجه'
            };
            setRefText(`( ${bookNamesUrd[hadithBook] || dataUrd.metadata.name} ، الحدیث : ${numToFetch} )`);

            if (numToFetch !== hadithNum) setHadithNum(numToFetch);

        } catch (error) {
            alert("Hadith not found. Try a different number.");
        }
        setIsFetchingHadith(false);
    };

    const fetchRandomHadith = () => {
        const maxHadiths: Record<string, number> = {
            'bukhari': 7563, 'muslim': 7453, 'abudawud': 5274,
            'tirmidhi': 3956, 'nasai': 5758, 'ibnmajah': 4341
        };
        const max = maxHadiths[hadithBook] || 3000;
        const randomNum = Math.floor(Math.random() * max) + 1;
        fetchHadith(randomNum);
    };

    return (
        <div className="space-y-5 animate-fadeIn">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-4">
                <label className="block text-[11px] font-bold text-emerald-800 mb-2 uppercase tracking-wider">Auto-Fetch Quranic Ayah</label>
                <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                        <span className="text-[10px] text-emerald-700">Surah (1-114)</span>
                        <input type="number" min="1" max="114" value={surah} onChange={e => setSurah(Number(e.target.value))} className="w-full border border-emerald-200 rounded p-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                    <div className="flex-1">
                        <span className="text-[10px] text-emerald-700">Ayah</span>
                        <input type="number" min="1" value={ayah} onChange={e => setAyah(Number(e.target.value))} className="w-full border border-emerald-200 rounded p-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => fetchAyah()} disabled={isFetching} className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg transition-colors disabled:opacity-50">
                        {isFetching ? 'Fetching...' : 'Fetch Arabic & Translation'}
                    </button>
                    <button onClick={fetchRandomAyah} disabled={isFetching} className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold py-2 rounded-lg transition-colors disabled:opacity-50 border border-emerald-300">
                        🎲 Random
                    </button>
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                <label className="block text-[11px] font-bold text-blue-800 mb-2 uppercase tracking-wider">Auto-Fetch Hadith</label>
                <div className="flex gap-2 mb-2">
                    <div className="flex-[2]">
                        <span className="text-[10px] text-blue-700">Book</span>
                        <select value={hadithBook} onChange={e => setHadithBook(e.target.value)} className="w-full border border-blue-200 rounded p-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20">
                            <option value="bukhari">Sahih Bukhari</option>
                            <option value="muslim">Sahih Muslim</option>
                            <option value="abudawud">Sunan Abu Dawud</option>
                            <option value="tirmidhi">Jami' al-Tirmidhi</option>
                            <option value="nasai">Sunan an-Nasa'i</option>
                            <option value="ibnmajah">Sunan Ibn Majah</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <span className="text-[10px] text-blue-700">No.</span>
                        <input type="number" min="1" value={hadithNum} onChange={e => setHadithNum(Number(e.target.value))} className="w-full border border-blue-200 rounded p-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => fetchHadith()} disabled={isFetchingHadith} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors disabled:opacity-50">
                        {isFetchingHadith ? 'Fetching...' : 'Fetch Arabic & Translation'}
                    </button>
                    <button onClick={fetchRandomHadith} disabled={isFetchingHadith} className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold py-2 rounded-lg transition-colors disabled:opacity-50 border border-blue-300">
                        🎲 Random
                    </button>
                </div>
            </div>

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
        headerFont, setHeaderFont,
        hadithFont, setHadithFont,
        refFont, setRefFont,
        textAlign, setTextAlign,
        lineHeight, setLineHeight,
        textBgStyle, setTextBgStyle
    } = usePosterStore();

    const fonts = [
        { name: "Noto Nastaliq (Classic Urdu)", value: "'Noto Nastaliq Urdu', serif" },
        { name: "Amiri (Classic Arabic)", value: "'Amiri', serif" },
        { name: "Scheherazade (Modern Arabic/Urdu)", value: "'Scheherazade New', serif" },
        { name: "Aref Ruqaa (Calligraphy)", value: "'Aref Ruqaa', serif" }
    ];

    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">Typography & Alignment</label>

                <div className="space-y-3 mb-4">
                    <div className="relative">
                        <span className="text-[10px] text-gray-500 block mb-1">Header Font</span>
                        <select value={headerFont} onChange={e => setHeaderFont(e.target.value)} className="w-full appearance-none bg-white border border-gray-200 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 outline-none pr-8">
                            {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                        </select>
                        <ChevronDown className="w-3 h-3 text-gray-400 absolute right-3 top-7 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <span className="text-[10px] text-gray-500 block mb-1">Main Text Font</span>
                        <select value={hadithFont} onChange={e => setHadithFont(e.target.value)} className="w-full appearance-none bg-white border border-gray-200 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 outline-none pr-8">
                            {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                        </select>
                        <ChevronDown className="w-3 h-3 text-gray-400 absolute right-3 top-7 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <span className="text-[10px] text-gray-500 block mb-1">Reference Font</span>
                        <select value={refFont} onChange={e => setRefFont(e.target.value)} className="w-full appearance-none bg-white border border-gray-200 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 outline-none pr-8">
                            {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                        </select>
                        <ChevronDown className="w-3 h-3 text-gray-400 absolute right-3 top-7 pointer-events-none" />
                    </div>
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
                    <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">Text Background Style</label>
                    <div className="flex bg-gray-200 p-1 rounded-lg">
                        <button onClick={() => setTextBgStyle('none')} className={`flex-1 text-[11px] font-bold py-2 rounded-md transition-all ${textBgStyle === 'none' ? 'bg-white shadow-sm text-amber-700' : 'text-gray-500'}`}>None</button>
                        <button onClick={() => setTextBgStyle('solid')} className={`flex-1 text-[11px] font-bold py-2 rounded-md transition-all ${textBgStyle === 'solid' ? 'bg-white shadow-sm text-amber-700' : 'text-gray-500'}`}>Solid</button>
                        <button onClick={() => setTextBgStyle('glass')} className={`flex-1 text-[11px] font-bold py-2 rounded-md transition-all ${textBgStyle === 'glass' ? 'bg-white shadow-sm text-amber-700' : 'text-gray-500'}`}>Glassmorphism</button>
                    </div>
                </div>
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
        bgOverlayOpacity, setBgOverlayOpacity,
        bgOverlayColor, setBgOverlayColor,
        aspectRatio, setAspectRatio,
        watermarkUrl, setWatermarkUrl, watermarkOpacity, setWatermarkOpacity
    } = usePosterStore();

    const [aiPrompt, setAiPrompt] = useState('Beautiful islamic mosque geometry');
    const [isGenerating, setIsGenerating] = useState(false);

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

    const generateAiBackground = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        
        const primaryUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiPrompt)}?width=1080&height=1080&nologo=true&model=turbo&seed=${Math.floor(Math.random() * 100000)}`;
        const fallbackUrl = `https://loremflickr.com/1080/1080/${encodeURIComponent(aiPrompt.split(' ')[0] || 'mosque')}?random=${Date.now()}`;
        
        const loadAsBase64 = (url: string): Promise<string> => {
            return new Promise((resolve, reject) => {
                const img = new window.Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        resolve(canvas.toDataURL('image/jpeg', 0.8)); // Compress to 80% JPEG
                    } else {
                        reject('No canvas context');
                    }
                };
                img.onerror = reject;
                img.src = url;
            });
        };

        try {
            const base64 = await loadAsBase64(primaryUrl);
            setBgImage(base64);
        } catch (e) {
            console.error("Primary AI generator failed, trying fallback...");
            try {
                const base64Fallback = await loadAsBase64(fallbackUrl);
                setBgImage(base64Fallback);
            } catch (err) {
                alert('Both AI generators failed. Please try again later.');
            }
        }
        setIsGenerating(false);
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
                
                <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 mb-3">
                    <label className="block text-[10px] font-bold text-purple-800 mb-2 uppercase tracking-wider flex items-center gap-1">
                        <Wand2 className="w-3 h-3" /> AI Background Generator
                    </label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g. Mosque at sunset"
                            className="flex-1 border border-purple-200 rounded p-2 text-xs focus:ring-2 focus:ring-purple-500/20 outline-none"
                        />
                        <button 
                            onClick={generateAiBackground}
                            disabled={isGenerating}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 rounded text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            {isGenerating ? 'Wait...' : 'Generate'}
                        </button>
                    </div>
                </div>

                <label className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:border-amber-500 hover:text-amber-600 transition-colors cursor-pointer bg-gray-50">
                    <ImageIcon className="w-4 h-4" />
                    Upload Custom Background
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setBgImage)} />
                </label>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">Darken / Overlay Filter</label>
                    <div className="mb-3">
                        <div className="flex justify-between text-xs font-bold text-gray-700 mb-2"><span>Opacity</span><span className="bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{Math.round(bgOverlayOpacity * 100)}%</span></div>
                        <input type="range" min="0" max="1" step="0.05" value={bgOverlayOpacity} onChange={e => setBgOverlayOpacity(Number(e.target.value))} className="w-full accent-amber-600" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider items-center"><span>Overlay Color</span></div>
                        <input type="color" value={bgOverlayColor} onChange={e => setBgOverlayColor(e.target.value)} className="w-full h-8 cursor-pointer rounded-lg bg-transparent border border-gray-200" />
                    </div>
                </div>
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

function GalleryControls() {
    const { templates, saveTemplate, deleteTemplate } = useTemplateStore();
    const currentState = usePosterStore();
    const [templateName, setTemplateName] = useState('');

    const handleSave = () => {
        if (!templateName.trim()) return alert("Please enter a template name");
        saveTemplate(templateName.trim(), currentState);
        setTemplateName('');
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <label className="block text-[11px] font-bold text-amber-800 mb-3 uppercase tracking-wider">Save Current Design</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Template Name (e.g., Friday Post)" 
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="flex-1 border border-amber-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-amber-500/20 outline-none"
                    />
                    <button 
                        onClick={handleSave}
                        className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                        title="Save Template"
                    >
                        <Save className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider flex justify-between">
                    <span>Saved Templates ({templates.length})</span>
                </label>
                
                {templates.length === 0 ? (
                    <div className="text-center p-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                        <Library className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">No templates saved yet.</p>
                        <p className="text-[10px] text-gray-400 mt-1">Design a poster and save it here to reuse later.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {templates.map(template => (
                            <div key={template.id} className="bg-white border border-gray-200 p-3 rounded-xl flex items-center justify-between hover:border-amber-500 transition-colors group">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-800 truncate">{template.name}</h4>
                                    <p className="text-[10px] text-gray-400">{new Date(template.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            if(window.confirm('Load this template? Current unsaved changes will be lost.')) {
                                                currentState.loadTemplate(template.state);
                                            }
                                        }}
                                        className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded hover:bg-amber-200 transition-colors"
                                    >
                                        Load
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if(window.confirm('Delete this template?')) {
                                                deleteTemplate(template.id);
                                            }
                                        }}
                                        className="text-xs font-bold bg-red-50 text-red-600 px-2 py-1.5 rounded hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
