import React, { useRef, useState } from 'react';

interface DropZoneProps {
  onFile: (file: File) => void;
  accept?: string;
  label?: string;
  multiple?: boolean;
}

export default function DropZone({ onFile, accept = 'image/*', label = '이미지를 드래그하거나 클릭하여 업로드', multiple = false }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleClick = () => inputRef.current?.click();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files) as File[];
    for (const f of files) onFile(f);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    for (const f of files) onFile(f);
    e.target.value = '';
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all select-none ${
        dragging
          ? 'border-orange-400 bg-orange-50'
          : 'border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/40'
      }`}
    >
      <svg className={`w-8 h-8 ${dragging ? 'text-orange-400' : 'text-gray-300'} transition-colors`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <p className="text-sm text-gray-500 text-center">{label}</p>
      <p className="text-xs text-gray-400">{multiple ? '여러 파일 선택 가능 · 드래그앤드롭' : '클릭 또는 드래그앤드롭'}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
