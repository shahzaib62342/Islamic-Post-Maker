import { X, Image as ImageIcon, FileImage, Layers } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'png' | 'jpg' | 'jpeg') => void;
  isExporting: boolean;
}

export default function ExportModal({ isOpen, onClose, onExport, isExporting }: ExportModalProps) {
  if (!isOpen) return null;

  const formats = [
    { 
      id: 'png', 
      label: 'PNG Image', 
      desc: 'High quality, best for sharing', 
      icon: ImageIcon,
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      id: 'jpg', 
      label: 'JPG Image', 
      desc: 'Balanced quality and size', 
      icon: FileImage,
      color: 'bg-emerald-50 text-emerald-600'
    },
    { 
      id: 'jpeg', 
      label: 'JPEG Image', 
      desc: 'Standard photographic format', 
      icon: Layers,
      color: 'bg-amber-50 text-amber-600'
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={!isExporting ? onClose : undefined}
      />
      
      <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden animate-slideUp">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Export Post</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Select your preferred format</p>
            </div>
            <button 
              onClick={onClose}
              disabled={isExporting}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-0"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="space-y-3">
            {formats.map((format) => (
              <button
                key={format.id}
                onClick={() => onExport(format.id as any)}
                disabled={isExporting}
                className="w-full group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-900 hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <div className={`p-3 rounded-xl transition-colors ${format.color} group-hover:bg-gray-900 group-hover:text-white`}>
                  <format.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{format.label}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{format.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {isExporting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Processing</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Crafting your masterpiece...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
