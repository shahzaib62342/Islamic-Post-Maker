import React from 'react';

interface CornerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempSrc: string;
  setTempSrc: (src: string) => void;
  tempSide: string;
  setTempSide: (side: string) => void;
  tempVSide: string;
  setTempVSide: (vSide: string) => void;
  tempSize: number;
  setTempSize: (size: number) => void;
  onApply: () => void;
}

export default function CornerModal({
  isOpen,
  onClose,
  tempSrc, setTempSrc,
  tempSide, setTempSide,
  tempVSide, setTempVSide,
  tempSize, setTempSize,
  onApply
}: CornerModalProps) {
  const corners = [
    { id: 'none', src: '' },
    { id: '1', src: 'https://i.ibb.co/60S8xsJq/1.png' },
    { id: '2', src: 'https://i.ibb.co/YTVYn0FT/2.png' },
    { id: '3', src: 'https://i.ibb.co/cSD5cQkV/3.png' },
    { id: '4', src: 'https://i.ibb.co/LzS4XWmf/4.png' },
    { id: '5', src: 'https://i.ibb.co/7xh262gK/5.png' },
  ];

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`}>
      <div className="modal-content">
          <div className="modal-header">
              <div>
                  <h3 className="text-lg font-bold text-gray-800">Corner Designer</h3>
                  <p className="text-xs text-gray-500">Customize your poster decoration</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">Choose Style</label>
                  <div className="corner-grid">
                    {corners.map((corner) => (
                      <div 
                        key={corner.id} 
                        className={`corner-thumb ${tempSrc === corner.src ? 'active' : ''}`}
                        onClick={() => setTempSrc(corner.src)}
                      >
                        {corner.src ? <img src={corner.src} alt={corner.id} /> : <span className="none-thumb">None</span>}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-4">
                      <div>
                          <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Horizontal Position</label>
                          <div className="flex space-x-2" style={{ direction: 'ltr' }}>
                              <button onClick={() => setTempSide('left')} className={`side-btn ${tempSide === 'left' ? 'active' : ''}`}>Left</button>
                              <button onClick={() => setTempSide('right')} className={`side-btn ${tempSide === 'right' ? 'active' : ''}`}>Right</button>
                          </div>
                      </div>
                      <div>
                          <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Vertical Position</label>
                          <div className="flex space-x-2" style={{ direction: 'ltr' }}>
                              <button onClick={() => setTempVSide('top')} className={`side-btn ${tempVSide === 'top' ? 'active' : ''}`}>Top</button>
                              <button onClick={() => setTempVSide('bottom')} className={`side-btn ${tempVSide === 'bottom' ? 'active' : ''}`}>Bottom</button>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="space-y-4" style={{ direction: 'ltr' }}>
                  <div className="modal-preview-area">
                      <span className="modal-preview-label">Live Preview</span>
                      <div className="text-xs text-gray-300 italic">Poster Corner Area</div>
                      {tempSrc && (
                        <img 
                          className="modal-corner-preview" 
                          src={tempSrc} 
                          style={{
                            display: 'block',
                            width: `${tempSize * 0.8}px`,
                            left: tempSide === 'left' ? '0' : 'auto',
                            right: tempSide === 'right' ? '0' : 'auto',
                            top: tempVSide === 'top' ? '0' : 'auto',
                            bottom: tempVSide === 'bottom' ? '0' : 'auto',
                            transform: `scale(${tempSide === 'left' ? -1 : 1}, 1)`
                          }} 
                          alt="" 
                        />
                      )}
                  </div>

                  <div className="size-control bg-gray-50 p-4 rounded-xl">
                      <div className="flex justify-between text-xs font-bold text-gray-600 mb-2">
                          <span>Relative Size</span>
                          <span className="text-amber-600">{tempSize}px</span>
                      </div>
                      <input type="range" min="50" max="250" value={tempSize} onChange={e => setTempSize(Number(e.target.value))} />
                  </div>

                  <button onClick={onApply} className="btn-apply">
                      Save & Apply Changes
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
}
