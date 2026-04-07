import React from 'react';

interface ImagePreviewProps {
  url: string;
  onClose?: () => void;
  filename?: string;
}

export default function ImagePreview({ url, onClose, filename }: ImagePreviewProps) {
  if (!url) return null;

  return (
    <div className="relative inline-block rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
      <img
        src={url}
        alt={filename || '미리보기'}
        className="max-h-48 max-w-full object-contain block"
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
      {filename && (
        <div className="px-3 py-1 bg-white/90 text-xs text-gray-500 truncate max-w-xs border-t border-gray-100">
          {filename}
        </div>
      )}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          title="제거"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
