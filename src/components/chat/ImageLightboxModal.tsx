import React from 'react';
import { X, Download, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { ImageAttachment } from '../../types';

interface ImageLightboxModalProps {
  image: ImageAttachment | null;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({ image, onClose }) => {
  if (!image) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = image.url;
    a.download = image.name || 'image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div 
        className="w-full max-w-5xl flex items-center justify-between text-xs text-slate-300 pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-white">{image.name}</span>
          {image.size && (
            <span className="text-slate-500 font-mono text-[11px]">
              ({Math.round(image.size / 1024)} KB)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Preview */}
      <div 
        className="flex-1 flex items-center justify-center max-w-5xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.url}
          alt={image.name}
          className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
        />
      </div>

      {/* Footer Info */}
      <div className="text-[11px] text-slate-500 pt-3">
        Click anywhere outside or press ESC to exit preview
      </div>
    </div>
  );
};
