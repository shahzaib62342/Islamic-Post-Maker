import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Type, Layout, Settings, Download, ChevronDown, AlignLeft, AlignCenter, AlignRight, AlignJustify, Upload, Save, Library, RotateCcw, Layers, X } from 'lucide-react';
import { usePosterStore } from '../store/usePosterStore';
import { useTemplateStore } from '../store/useTemplateStore';
import { backgrounds } from '../data/backgrounds';
import { surahs } from '../data/surahs';
import { trackAction } from '../utils/analytics';
import AdSlot from './AdSlot';

const maxHadiths: Record<string, number> = {
    'bukhari': 7563,
    'muslim': 7453,
    'abudawud': 5274,
    'tirmidhi': 3956,
    'nasai': 5758,
    'ibnmajah': 4341
};

function SearchableSelect({
    options,
    value,
    onChange,
    placeholder,
    className = ""
}: {
    options: { value: any, label: string }[],
    value: any,
    onChange: (val: any) => void,
    placeholder: string,
    className?: string
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 100);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-white border transition-all duration-200 rounded-xl px-4 py-2.5 text-xs font-bold cursor-pointer flex justify-between items-center ${isOpen ? 'border-gray-900 shadow-lg ring-2 ring-gray-900/5' : 'border-gray-200 hover:border-gray-400'}`}
            >
                <span className={`truncate ${!selectedOption ? "text-gray-400" : "text-gray-900"}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-gray-900' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn origin-top">
                    <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Type to filter..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-gray-900 transition-all outline-none"
                            onClick={e => e.stopPropagation()}
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar py-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt.value}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition-all flex items-center justify-between ${value === opt.value ? 'bg-gray-900 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                                >
                                    <span>{opt.label}</span>
                                    {value === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-glow" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase text-center tracking-widest">
                                No matching results
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function Accordion({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    return (
        <div className={`border rounded-2xl overflow-hidden transition-all duration-300 mb-3 ${isOpen ? 'border-gray-200 shadow-md bg-white' : 'border-gray-100 shadow-sm bg-gray-50/30'}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex justify-between items-center p-4 transition-all duration-300 ${isOpen ? 'bg-white' : 'hover:bg-gray-50'}`}
            >
                <span className={`font-bold text-[11px] uppercase tracking-[0.1em] transition-colors ${isOpen ? 'text-gray-900' : 'text-gray-500'}`}>{title}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-gray-900' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 space-y-4 border-t border-gray-50 bg-white">{children}</div>
            </div>
        </div>
    );
}

interface SidebarProps {
    onExport: () => void;
}

export default function Sidebar({ onExport }: SidebarProps) {
    const [activeTab, setActiveTab] = useState<'text' | 'style' | 'bg' | 'gallery'>('text');
    const { isDownloading, setIsModalOpen, isSidebarVisible, setIsSidebarVisible } = usePosterStore();

    const onDownload = onExport;

    return (
        <aside
            className={`controls flex flex-col bg-white text-gray-900 font-sans transition-all duration-500 ease-in-out ${!isSidebarVisible ? 'minimized' : ''}`}
            aria-label="Poster Controls"
        >
            {/* Desktop Header */}
            <header className="hidden lg:block p-6 border-b border-gray-100 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img src="/logo-black.png" alt="Profilixa" className="w-10 h-10 object-contain" />
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight leading-tight">Profilixa</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Islamic Post Maker</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (window.confirm('Reset all changes?')) {
                                trackAction("Template Reset");
                                usePosterStore.getState().resetTemplate();
                            }
                        }}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                        title="Reset Designer"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex bg-gray-100/80 p-1 rounded-xl gap-1">
                    {[
                        { id: 'text', icon: Type, label: 'Text' },
                        { id: 'bg', icon: Layout, label: 'Background' },
                        { id: 'gallery', icon: Library, label: 'Saved' },
                        { id: 'style', icon: Settings, label: 'Style' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                trackAction("Tab Switch", { tab: tab.label });
                                setActiveTab(tab.id as any);
                                setIsSidebarVisible(true);
                            }}
                            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all duration-300 ${activeTab === tab.id ? 'bg-white shadow-md text-gray-900' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="text-[9px] font-bold uppercase tracking-tighter">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            {/* Mobile Header (Minimal) */}
            <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSidebarVisible(false)}
                        className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{activeTab} Controls</span>
                </div>
                <button
                    onClick={() => {
                        if (window.confirm('Reset all changes?')) {
                            trackAction("Template Reset");
                            usePosterStore.getState().resetTemplate();
                        }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-[1_1_0%] overflow-y-auto p-5 custom-scrollbar relative" style={{ minHeight: 0 }}>
                {activeTab === 'text' && <TextControls />}
                {activeTab === 'bg' && <LayoutControls onOpenModal={() => setIsModalOpen(true)} />}
                {activeTab === 'style' && <StyleControls />}
                {activeTab === 'gallery' && <GalleryControls />}
            </div>

            {/* Bottom Actions & Tabs */}
            <div className="shrink-0 bg-white border-t border-gray-100 lg:bg-gray-50/50">
                {/* Export Button - Hidden on mobile, sticky on desktop */}
                <div className="hidden lg:block p-4 lg:p-6 pb-2 lg:pb-6">
                    <button
                        onClick={onDownload}
                        disabled={isDownloading}
                        className="group relative w-full bg-gradient-to-br from-gray-900 to-black text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)] active:scale-95 disabled:opacity-50 overflow-hidden border border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        {isDownloading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white group-hover:text-black transition-colors">
                                    <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                </div>
                                <span className="hidden lg:inline">Export</span>
                                <span className="lg:hidden text-sm">Export</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Mobile Tabs Navigation */}
                <div className="lg:hidden flex border-t border-gray-50 p-2 pb-safe-area relative z-[60]">
                    {[
                        { id: 'text', icon: Type, label: 'Text' },
                        { id: 'bg', icon: Layout, label: 'Background' },
                        { id: 'gallery', icon: Library, label: 'Saved' },
                        { id: 'style', icon: Settings, label: 'Style' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                trackAction("Tab Switch", { tab: tab.label });
                                setActiveTab(tab.id as any);
                                setIsSidebarVisible(true);
                            }}
                            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-400'}`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
                            <span className={`text-[8px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-400'}`}>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </aside>
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
    const [ayahTo, setAyahTo] = useState<number>(1);
    const [isFetching, setIsFetching] = useState(false);

    const [hadithBook, setHadithBook] = useState<string>('bukhari');
    const [hadithNum, setHadithNum] = useState<number>(1);
    const [isFetchingHadith, setIsFetchingHadith] = useState(false);

    const fetchAyah = async (randomAyahNumber?: number) => {
        setIsFetching(true);
        trackAction("Fetch Quran Ayah", { surah, ayah, ayahTo });
        try {
            if (randomAyahNumber) {
                const url = `https://api.alquran.cloud/v1/ayah/${randomAyahNumber}/editions/quran-uthmani,ur.kanzuliman`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.code === 200 && data.data.length === 2) {
                    setHeaderText('قرآن کریم');
                    setHadithText(`${data.data[1].text} [ayah]${data.data[0].numberInSurah}[/ayah]`);
                    setRefText(`( القرآن الكريم ، سورة ${data.data[0].surah.name} ، آية ${data.data[0].numberInSurah} )`);
                    setSurah(data.data[0].surah.number);
                    setAyah(data.data[0].numberInSurah);
                    setAyahTo(data.data[0].numberInSurah);
                }
            } else if (ayah === ayahTo) {
                const url = `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-uthmani,ur.kanzuliman`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.code === 200 && data.data.length === 2) {
                    setHeaderText('قرآن کریم');
                    setHadithText(`${data.data[1].text} [ayah]${data.data[0].numberInSurah}[/ayah]`);
                    setRefText(`( القرآن الكريم ، سورة ${data.data[0].surah.name} ، آية ${data.data[0].numberInSurah} )`);
                }
            } else {
                // Fetch range
                const start = Math.min(ayah, ayahTo);
                const end = Math.max(ayah, ayahTo);
                const url = `https://api.alquran.cloud/v1/surah/${surah}/editions/quran-uthmani,ur.kanzuliman`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.code === 200 && data.data.length === 2) {
                    const urduAyahs = data.data[1].ayahs.slice(start - 1, end);
                    const concatenatedText = urduAyahs.map((a: any) => `${a.text} [ayah]${a.numberInSurah}[/ayah]`).join(' ');
                    setHeaderText('قرآن کریم');
                    setHadithText(concatenatedText);
                    setRefText(`( القرآن الكريم ، سورة ${data.data[0].name} ، آيات ${start} - ${end} )`);
                }
            }
        } catch (error) {
            toast.error("Error fetching Ayah.");
        }
        setIsFetching(false);
    };

    const fetchRandomAyah = () => {
        trackAction("AI Generate Quran");
        const randomAbsoluteAyah = Math.floor(Math.random() * 6236) + 1;
        fetchAyah(randomAbsoluteAyah);
    };

    const fetchHadith = async (numToFetch: number = hadithNum) => {
        setIsFetchingHadith(true);
        trackAction("Fetch Hadith", { book: hadithBook, number: hadithNum });
        try {
            const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-${hadithBook}/${numToFetch}.min.json`;
            const res = await fetch(url);

            if (!res.ok) throw new Error(`Hadith not found: ${res.status}`);

            const data = await res.json();
            if (!data.hadiths || data.hadiths.length === 0) throw new Error("Invalid data structure");

            const textUrd = data.hadiths[0].text;

            setHeaderText('رسول اللہ صلی اللہ علیہ وسلم نے فرمایا');
            setHadithText(textUrd);

            const bookNamesUrd: Record<string, string> = {
                'bukhari': 'صحیح البخاری',
                'muslim': 'صحیح مسلم',
                'abudawud': 'سنن ابی داود',
                'tirmidhi': 'جامع الترمذی',
                'nasai': 'سنن النسائی',
                'ibnmajah': 'سنن ابن ماجه'
            };
            setRefText(`( ${bookNamesUrd[hadithBook] || data.metadata.name} ، الحدیث : ${numToFetch} )`);

            if (numToFetch !== hadithNum) setHadithNum(numToFetch);

        } catch (error) {
            console.error("Hadith fetch error:", error);
            toast.error("Hadith not found or API error. Try a different number.");
        }
        setIsFetchingHadith(false);
    };

    const fetchRandomHadith = () => {
        trackAction("AI Generate Hadith");
        const max = maxHadiths[hadithBook] || 3000;
        const randomNum = Math.floor(Math.random() * max) + 1;
        fetchHadith(randomNum);
    };

    return (
        <div className="space-y-4 animate-fadeIn">
            {/* Quran Fetch */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Library className="w-3 h-3 text-gray-900" />
                    Quran Library
                </h3>
                <div className="space-y-3 mb-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Surah</label>
                        <SearchableSelect
                            options={surahs.map(s => ({ value: s.number, label: `${s.number}. ${s.name}` }))}
                            value={surah}
                            onChange={val => {
                                const newSurah = val;
                                setSurah(newSurah);
                                const newSurahData = surahs.find(s => s.number === newSurah);
                                if (newSurahData) {
                                    if (ayah > newSurahData.ayahs) setAyah(1);
                                    if (ayahTo > newSurahData.ayahs) setAyahTo(1);
                                }
                            }}
                            placeholder="Select Surah"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Ayah From</label>
                            <SearchableSelect
                                options={Array.from({ length: surahs.find(s => s.number === surah)?.ayahs || 0 }, (_, i) => ({ value: i + 1, label: String(i + 1) }))}
                                value={ayah}
                                onChange={val => setAyah(val)}
                                placeholder="From"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Ayah To</label>
                            <SearchableSelect
                                options={Array.from({ length: surahs.find(s => s.number === surah)?.ayahs || 0 }, (_, i) => ({ value: i + 1, label: String(i + 1) }))}
                                value={ayahTo}
                                onChange={val => setAyahTo(val)}
                                placeholder="To"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => fetchAyah()}
                        disabled={isFetching}
                        className="flex-[2] bg-gray-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {isFetching ? 'Fetching...' : 'Get Ayah'}
                    </button>
                    <button
                        onClick={fetchRandomAyah}
                        disabled={isFetching}
                        className="flex-1 bg-white hover:bg-gray-50 text-gray-800 text-[10px] font-black uppercase tracking-wider py-3 rounded-xl transition-all border border-gray-200 shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        Random
                    </button>
                </div>
            </div>

            {/* Hadith Fetch */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Library className="w-3 h-3 text-gray-900" />
                    Hadith Library
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="col-span-2 space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Book</label>
                        <SearchableSelect
                            options={[
                                { value: 'bukhari', label: 'Bukhari' },
                                { value: 'muslim', label: 'Muslim' },
                                { value: 'abudawud', label: 'Abu Dawud' },
                                { value: 'tirmidhi', label: 'Tirmidhi' },
                                { value: 'nasai', label: 'Nasa\'i' },
                                { value: 'ibnmajah', label: 'Ibn Majah' }
                            ]}
                            value={hadithBook}
                            onChange={val => {
                                setHadithBook(val);
                                if (hadithNum > maxHadiths[val]) {
                                    setHadithNum(1);
                                }
                            }}
                            placeholder="Select Book"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">No.</label>
                        <SearchableSelect
                            options={Array.from({ length: maxHadiths[hadithBook] }, (_, i) => ({ value: i + 1, label: String(i + 1) }))}
                            value={hadithNum}
                            onChange={val => setHadithNum(val)}
                            placeholder="Hadith No."
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => fetchHadith()}
                        disabled={isFetchingHadith}
                        className="flex-[2] bg-gray-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {isFetchingHadith ? 'Fetching...' : 'Get Hadith'}
                    </button>
                    <button
                        onClick={fetchRandomHadith}
                        disabled={isFetchingHadith}
                        className="flex-1 bg-white hover:bg-gray-50 text-gray-800 text-[10px] font-black uppercase tracking-wider py-3 rounded-xl transition-all border border-gray-200 shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        Random
                    </button>
                </div>
            </div>

            {/* Content Edits */}
            <div className="space-y-4 pt-2">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        <Type className="w-3 h-3 text-gray-900" />
                        Main Heading
                    </label>
                    <textarea
                        rows={1} placeholder="Heading..."
                        value={headerText} onChange={e => setHeaderText(e.target.value)}
                        onContextMenu={e => handleContextMenu(e, 'header')}
                        onDoubleClick={e => handleSelection(e, 'header')}
                        className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-gray-900 transition-all outline-none resize-none shadow-sm"
                        dir="rtl"
                    />
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        <AlignLeft className="w-3 h-3 text-gray-900" />
                        Body Content
                    </label>
                    <textarea
                        rows={4} placeholder="Main text..."
                        value={hadithText} onChange={e => setHadithText(e.target.value)}
                        onContextMenu={e => handleContextMenu(e, 'hadith')}
                        onDoubleClick={e => handleSelection(e, 'hadith')}
                        className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-gray-900 transition-all outline-none resize-none shadow-sm"
                        dir="rtl"
                    />
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        <Layers className="w-3 h-3 text-gray-900" />
                        Reference / Source
                    </label>
                    <textarea
                        rows={1} placeholder="Reference..."
                        value={refText} onChange={e => setRefText(e.target.value)}
                        onContextMenu={e => handleContextMenu(e, 'ref')}
                        onDoubleClick={e => handleSelection(e, 'ref')}
                        className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-gray-900 transition-all outline-none resize-none shadow-sm"
                        dir="rtl"
                    />
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Layout Guides</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Enable for precise positioning</p>
                    </div>
                    <button
                        onClick={() => setShowGuides(!showGuides)}
                        className={`w-12 h-6 rounded-full relative transition-colors ${showGuides ? 'bg-gray-900' : 'bg-gray-200'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all bg-white shadow-sm ${showGuides ? 'translate-x-6' : ''}`} />
                    </button>
                </div>
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
                            <button onClick={() => setPopover(null)} className="flex-1 bg-gray-50 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg transition-colors">Cancel</button>
                        </div>
                    </div>
                </>
            )}
            {/* Sidebar Ad Card - Only on Desktop */}
            <div className="mt-8 pt-6 border-t border-gray-100 hidden lg:block">
                <AdSlot slot="4567890123" height="180px" label="Promoted Content" />
            </div>
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
            <Accordion title="Typography & Font" defaultOpen={true}>
                <div className="space-y-4">
                    {[
                        { label: 'Header Font', value: headerFont, setter: setHeaderFont },
                        { label: 'Body Font', value: hadithFont, setter: setHadithFont },
                        { label: 'Source Font', value: refFont, setter: setRefFont }
                    ].map((font) => (
                        <div key={font.label} className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{font.label}</label>
                            <div className="relative group">
                                <select
                                    value={font.value}
                                    onChange={e => font.setter(e.target.value)}
                                    className="w-full appearance-none bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-gray-900 transition-all outline-none pr-10 hover:bg-white hover:border-gray-200"
                                >
                                    {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none group-hover:text-gray-900 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Text Alignment</label>
                    <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                        {[
                            { id: 'right', icon: AlignRight },
                            { id: 'center', icon: AlignCenter },
                            { id: 'left', icon: AlignLeft },
                            { id: 'justify', icon: AlignJustify }
                        ].map((align) => (
                            <button
                                key={align.id}
                                onClick={() => setTextAlign(align.id as any)}
                                className={`flex-1 flex justify-center py-2.5 rounded-lg transition-all ${textAlign === align.id ? 'bg-white shadow-md text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <align.icon className="w-4 h-4" />
                            </button>
                        ))}
                    </div>
                </div>
            </Accordion>

            <Accordion title="Precision Sizing" defaultOpen={true}>
                <div className="space-y-6 py-2">
                    {[
                        { label: 'Header Size', value: headerSize, setter: setHeaderSize, min: 10, max: 80 },
                        { label: 'Body Size', value: hadithSize, setter: setHadithSize, min: 10, max: 120 },
                        { label: 'Source Size', value: refSize, setter: setRefSize, min: 8, max: 60 }
                    ].map((size) => (
                        <div key={size.label} className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{size.label}</span>
                                <span className="bg-gray-900 text-white px-2 py-0.5 rounded-md text-[9px] font-bold shadow-sm">{size.value}px</span>
                            </div>
                            <input
                                type="range" min={size.min} max={size.max} value={size.value}
                                onChange={e => size.setter(Number(e.target.value))}
                                className="w-full accent-gray-900 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    ))}

                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Line Spacing</span>
                            <span className="bg-white border border-gray-100 px-2 py-0.5 rounded-md text-[9px] font-bold shadow-sm">{lineHeight}</span>
                        </div>
                        <input
                            type="range" min="1" max="3" step="0.1" value={lineHeight}
                            onChange={e => setLineHeight(Number(e.target.value))}
                            className="w-full accent-gray-900 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </Accordion>

            <Accordion title="Color & Atmosphere" defaultOpen={false}>
                <div className="space-y-6 py-2">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Content Background</label>
                        <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                            {[
                                { id: 'none', label: 'None' },
                                { id: 'solid', label: 'Solid' },
                                { id: 'glass', label: 'Glass' }
                            ].map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setTextBgStyle(style.id as any)}
                                    className={`flex-1 text-[10px] font-black uppercase tracking-tight py-2.5 rounded-lg transition-all ${textBgStyle === style.id ? 'bg-white shadow-md text-gray-900' : 'text-gray-400'}`}
                                >
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1 flex justify-between items-center">
                            Primary Color
                            <span className="text-[9px] font-bold text-gray-400 border border-gray-100 px-2 py-0.5 rounded uppercase">{textColor}</span>
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="color" value={textColor}
                                onChange={e => setTextColor(e.target.value)}
                                className="w-14 h-14 cursor-pointer rounded-2xl bg-transparent border-none p-0 overflow-hidden"
                            />
                            <div className="flex-1 grid grid-cols-5 gap-2">
                                {['#ffffff', '#000000', '#ffd700', '#2dd4bf', '#fb7185'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setTextColor(c)}
                                        className="w-full aspect-square rounded-lg border border-gray-100 shadow-sm transition-transform active:scale-90"
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Accordion>
            {/* Sidebar Ad Card - Only on Desktop */}
            <div className="mt-8 pt-6 border-t border-gray-100 hidden lg:block">
                <AdSlot slot="4567890123" height="180px" label="Promoted Content" />
            </div>
        </div>
    );
}

function LayoutControls({ onOpenModal }: { onOpenModal: () => void }) {
    const {
        bgImage, setBgImage,
        bgOverlayOpacity, setBgOverlayOpacity,
        bgOverlayColor, setBgOverlayColor,
        aspectRatio, setAspectRatio,
        watermarkUrl, setWatermarkUrl, watermarkOpacity, setWatermarkOpacity
    } = usePosterStore();

    const filteredBackgrounds = backgrounds.filter(bg => bg.type === aspectRatio);

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
        <div className="space-y-4 animate-fadeIn">
            <Accordion title="Background Size" defaultOpen={true}>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'square', label: 'Square', ratio: '1:1', icon: Layout, w: 'w-4', h: 'h-4' },
                        { id: 'portrait', label: 'Portrait', ratio: '4:5', icon: Layout, w: 'w-4', h: 'h-5' },
                        { id: 'story', label: 'Story', ratio: '9:16', icon: Layout, w: 'w-3.5', h: 'h-6' }
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => {
                                trackAction("Change Aspect Ratio", { ratio: opt.id });
                                setAspectRatio(opt.id as any);
                            }}
                            className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border-2 transition-all duration-300 ${aspectRatio === opt.id ? 'border-gray-900 bg-gray-900 text-white shadow-lg' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                        >
                            <div className={`rounded-sm border-2 flex items-center justify-center transition-colors ${aspectRatio === opt.id ? 'border-white/40' : 'border-gray-100'} ${opt.w} ${opt.h}`}>
                                <opt.icon className="w-2 h-2" />
                            </div>
                            <div className="text-center">
                                <p className="text-[9px] font-black uppercase tracking-tighter">{opt.label}</p>
                                <p className={`text-[7px] font-bold uppercase tracking-widest mt-0.5 ${aspectRatio === opt.id ? 'text-white/50' : 'text-gray-300'}`}>{opt.ratio}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </Accordion>

            <Accordion title="Visual Backgrounds" defaultOpen={true}>
                {filteredBackgrounds.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No assets available</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-3">
                        {filteredBackgrounds.map((bg) => (
                            <button
                                key={bg.name}
                                onClick={() => setBgImage(`/${bg.name}`)}
                                className={`group relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${bgImage === `/${bg.name}` ? 'border-gray-900 scale-[0.98] shadow-lg' : 'border-transparent hover:border-gray-200 shadow-sm'}`}
                            >
                                <img
                                    src={`/${bg.name}`}
                                    alt="Poster"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {bgImage === `/${bg.name}` && (
                                    <div className="absolute inset-0 bg-gray-900/10 flex items-center justify-center">
                                        <div className="bg-white rounded-full p-1 shadow-lg">
                                            <div className="w-2 h-2 bg-gray-900 rounded-full" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                <div className="mt-6">
                    <label className="group flex flex-col items-center justify-center gap-3 w-full py-8 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all cursor-pointer bg-gray-50/50 hover:bg-white hover:shadow-xl">
                        <div className="p-3 bg-white rounded-full shadow-sm group-hover:bg-gray-900 group-hover:text-white transition-colors">
                            <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Import Custom Asset</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setBgImage)} />
                    </label>
                </div>
            </Accordion>

            <Accordion title="Branding & Logo" defaultOpen={false}>
                <div className="space-y-4">
                    <label className="group flex flex-col items-center justify-center gap-3 w-full py-6 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all cursor-pointer bg-gray-50/50 hover:bg-white hover:shadow-xl">
                        {watermarkUrl ? (
                            <img src={watermarkUrl} className="h-10 w-auto object-contain mb-1" alt="Logo" />
                        ) : (
                            <div className="p-3 bg-white rounded-full shadow-sm group-hover:bg-gray-900 group-hover:text-white transition-colors">
                                <Upload className="w-4 h-4" />
                            </div>
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest">{watermarkUrl ? 'Replace Branding' : 'Add Brand Logo'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setWatermarkUrl)} />
                    </label>

                    {watermarkUrl && (
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Branding Opacity</span>
                                <span className="bg-white px-2 py-1 rounded-lg shadow-sm text-[9px] font-bold border border-gray-100">{Math.round(watermarkOpacity * 100)}%</span>
                            </div>
                            <input type="range" min="0.1" max="1" step="0.1" value={watermarkOpacity} onChange={e => setWatermarkOpacity(Number(e.target.value))} className="w-full accent-gray-900" />
                            <button onClick={() => setWatermarkUrl('')} className="w-full text-[9px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest transition-colors py-2">Remove Branding</button>
                        </div>
                    )}
                </div>
            </Accordion>

            <Accordion title="Image Filters" defaultOpen={true}>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs font-bold text-gray-700 mb-2"><span>Darken Opacity</span><span className="bg-gray-100 px-2 py-0.5 rounded shadow-sm text-[10px]">{Math.round(bgOverlayOpacity * 100)}%</span></div>
                        <input type="range" min="0" max="1" step="0.05" value={bgOverlayOpacity} onChange={e => setBgOverlayOpacity(Number(e.target.value))} className="w-full accent-gray-900" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider items-center"><span>Overlay Color</span></div>
                        <input type="color" value={bgOverlayColor} onChange={e => setBgOverlayColor(e.target.value)} className="w-full h-8 cursor-pointer rounded-lg bg-transparent border border-gray-200" />
                    </div>
                </div>
            </Accordion>

            <Accordion title="Watermark / Logo" defaultOpen={false}>
                <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider flex justify-between">
                    <span>Current Logo</span>
                    {watermarkUrl && <button onClick={() => setWatermarkUrl('')} className="text-red-500 hover:text-red-700 uppercase">Remove</button>}
                </label>
                <label className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer bg-white mb-3">
                    <Upload className="w-4 h-4" />
                    {watermarkUrl ? 'Change Watermark' : 'Upload Watermark'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setWatermarkUrl)} />
                </label>
                {watermarkUrl && (
                    <div>
                        <div className="flex justify-between text-xs font-bold text-gray-700 mb-2"><span>Opacity</span><span className="bg-gray-100 px-2 py-0.5 rounded shadow-sm text-[10px]">{Math.round(watermarkOpacity * 100)}%</span></div>
                        <input type="range" min="0.1" max="1" step="0.1" value={watermarkOpacity} onChange={e => setWatermarkOpacity(Number(e.target.value))} className="w-full accent-gray-900" />
                    </div>
                )}
            </Accordion>

            <Accordion title="Decorations" defaultOpen={false}>
                <button onClick={onOpenModal} className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                    <Settings className="w-4 h-4" />
                    Configure Corner Art
                </button>
            </Accordion>
            {/* Sidebar Ad Card - Only on Desktop */}
            <div className="mt-8 pt-6 border-t border-gray-100 hidden lg:block">
                <AdSlot slot="4567890123" height="180px" label="Promoted Content" />
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
        trackAction("Template Saved", { name: templateName.trim() });
        saveTemplate(templateName.trim(), currentState);
        setTemplateName('');
    };

    return (
        <div className="space-y-4 animate-fadeIn">
            <Accordion title="Project Management" defaultOpen={true}>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Template Name</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="e.g., Friday Jumu'ah Post"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-gray-900 transition-all outline-none"
                            />
                            <button
                                onClick={handleSave}
                                className="bg-gray-900 hover:bg-black text-white p-3 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center group"
                                title="Save Template"
                            >
                                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        Archive your design to reuse it as a base for future posters.
                    </p>
                </div>
            </Accordion>

            <Accordion title={`Archives (${templates.length})`} defaultOpen={true}>
                {templates.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-100 rounded-3xl">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-50">
                            <Library className="w-8 h-8 text-gray-200" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Saved Designs</p>
                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter mt-1 px-8 text-center">Save your creative work to access it anytime</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {templates.map(template => (
                            <div key={template.id} className="group relative bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between hover:border-gray-900 transition-all shadow-sm hover:shadow-xl">
                                <div className="flex-1 min-w-0 pr-4 text-left">
                                    <h4 className="text-[11px] font-black text-gray-900 uppercase truncate tracking-tight">{template.name}</h4>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{new Date(template.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Load this template? Current unsaved changes will be lost.')) {
                                                trackAction("Template Loaded", { name: template.name });
                                                currentState.loadTemplate(template.state);
                                            }
                                        }}
                                        className="text-[9px] font-black uppercase tracking-widest bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-all shadow-md active:scale-95"
                                    >
                                        Load
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Delete this template?')) {
                                                deleteTemplate(template.id);
                                            }
                                        }}
                                        className="text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-500 px-3 py-2 rounded-lg hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        Drop
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Accordion>
            {/* Sidebar Ad Card - Only on Desktop */}
            <div className="mt-8 pt-6 border-t border-gray-100 hidden lg:block">
                <AdSlot slot="4567890123" height="180px" label="Promoted Content" />
            </div>
        </div>
    );
}
