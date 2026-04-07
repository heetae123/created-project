import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { QUILL_MODULES, QUILL_FORMATS } from '../../lib/quill-config';
import { adminGetSettings, adminSaveSettings, uploadToCloudinary } from '../../lib/admin-api';
import { useToast } from './shared/Toast';


interface TextBlock {
  type: 'text';
  id: string;
  html: string;
}

interface ImageBlock {
  type: 'image';
  id: string;
  url: string;
  caption: string;
}

type Block = TextBlock | ImageBlock;

interface GreetingData {
  title: string;
  highlight: string;
  suffix: string;
  signoff: string;
  blocks: Block[];
  titleSize?: number;
  titleColor?: string;
  highlightColor?: string;
  bodySize?: number;
  bodyColor?: string;
}

interface AboutStyles {
  sectionTitleSize: number;
  sectionTitleColor: string;
  bodySize: number;
  bodyColor: string;
  accentColor: string;
}

const DEFAULT_ABOUT_STYLES: AboutStyles = {
  sectionTitleSize: 48,
  sectionTitleColor: '#18181B',
  bodySize: 18,
  bodyColor: '#525252',
  accentColor: '#F97316',
};

const DEFAULT: GreetingData = {
  title: '마음을 기획하는 사람들,',
  highlight: '마이파트너스',
  suffix: '입니다.',
  signoff: '마이파트너스 대표이사',
  blocks: [],
  titleSize: 48,
  titleColor: '#18181B',
  highlightColor: '#F97316',
  bodySize: 18,
  bodyColor: '#525252',
};

function genId() {
  return Math.random().toString(36).slice(2, 10);
}


function BlockItem({
  block,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  block: Block;
  key?: React.Key;
  index: number;
  total: number;
  onChange: (id: string, patch: Partial<Block>) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'mai-greeting');
      onChange(block.id, { url } as Partial<ImageBlock>);
    } catch {
      // silently fail - user can enter URL manually
    } finally {
      setUploading(false);
    }
  }, [block.id, onChange]);

  return (
    <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white">
      {/* Block header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#F9FAFB] border-b border-[#E5E7EB]">
        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
          {block.type === 'text' ? '텍스트 블록' : '이미지 블록'} #{index + 1}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMoveUp(block.id)}
            disabled={index === 0}
            className="p-1.5 rounded text-gray-400 hover:text-[#111827] hover:bg-gray-200 transition-colors disabled:opacity-30"
            title="위로"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </button>
          <button
            onClick={() => onMoveDown(block.id)}
            disabled={index === total - 1}
            className="p-1.5 rounded text-gray-400 hover:text-[#111827] hover:bg-gray-200 transition-colors disabled:opacity-30"
            title="아래로"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="삭제"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Block body */}
      <div className="p-4">
        {block.type === 'text' ? (
          <div className="min-h-[160px]">
            <ReactQuill
              value={block.html}
              onChange={(html, _delta, source) => { if (source === 'api') return; onChange(block.id, { html } as Partial<TextBlock>); }}
              modules={QUILL_MODULES}
              formats={QUILL_FORMATS}
              theme="snow"
              placeholder="텍스트를 입력하세요..."
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-[7px]">이미지 URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={(block as ImageBlock).url}
                  onChange={e => onChange(block.id, { url: e.target.value } as Partial<ImageBlock>)}
                  placeholder="https://..."
                  className="flex-1 px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#111827] transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  {uploading ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeOpacity=".2"/>
                      <path d="M21 12a9 9 0 0 1-9 9"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  )}
                  업로드
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>
            {(block as ImageBlock).url && (
              <div className="rounded-lg overflow-hidden border border-[#E5E7EB] bg-gray-50">
                <img
                  src={(block as ImageBlock).url}
                  alt="preview"
                  className="w-full max-h-60 object-cover block"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-[7px]">캡션 (선택)</label>
              <input
                type="text"
                value={(block as ImageBlock).caption}
                onChange={e => onChange(block.id, { caption: e.target.value } as Partial<ImageBlock>)}
                placeholder="이미지 설명을 입력하세요"
                className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminGreeting() {
  const { showToast } = useToast();
  const [data, setData] = useState<GreetingData>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aboutStyles, setAboutStyles] = useState<AboutStyles>(DEFAULT_ABOUT_STYLES);

  useEffect(() => {
    adminGetSettings('greeting')
      .then((d: GreetingData | null) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
    adminGetSettings('mai_about_styles')
      .then((d: AboutStyles | null) => {
        if (d && typeof d === 'object') setAboutStyles({ ...DEFAULT_ABOUT_STYLES, ...d });
      })
      .catch(() => {});
  }, []);

  const setHeader = (patch: Partial<GreetingData>) => setData(prev => ({ ...prev, ...patch }));

  const addBlock = (type: 'text' | 'image') => {
    const block: Block = type === 'text'
      ? { type: 'text', id: genId(), html: '' }
      : { type: 'image', id: genId(), url: '', caption: '' };
    setData(prev => ({ ...prev, blocks: [...prev.blocks, block] }));
  };

  const updateBlock = (id: string, patch: Partial<Block>) => {
    setData(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === id ? { ...b, ...patch } as Block : b),
    }));
  };

  const deleteBlock = (id: string) => {
    setData(prev => ({ ...prev, blocks: prev.blocks.filter(b => b.id !== id) }));
  };

  const moveBlock = (id: string, dir: 'up' | 'down') => {
    setData(prev => {
      const arr = [...prev.blocks];
      const idx = arr.findIndex(b => b.id === id);
      if (idx < 0) return prev;
      const target = dir === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= arr.length) return prev;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return { ...prev, blocks: arr };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        adminSaveSettings('greeting', data),
        adminSaveSettings('mai_about_styles', aboutStyles),
      ]);
      showToast('저장되었습니다.', 'success');
    } catch {
      showToast('저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeOpacity=".2"/>
          <path d="M21 12a9 9 0 0 1-9 9"/>
        </svg>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1 text-[#111827]">인사말 관리</h2>
      <p className="text-sm text-[#6B7280] mb-6">대표 인사말 페이지의 내용을 블로그 형식으로 편집합니다.</p>

      {/* Header fields */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <span className="inline-block w-1 h-[18px] bg-[#F97316] rounded-[2px]" />
          헤더
        </div>
        <div className="mb-[18px]">
          <label className="block text-sm font-semibold text-[#111827] mb-[7px]">메인 타이틀</label>
          <input
            type="text"
            value={data.title}
            onChange={e => setHeader({ title: e.target.value })}
            placeholder="마음을 기획하는 사람들,"
            className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-[18px]">
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-[7px]">강조 텍스트 (주황색)</label>
            <input
              type="text"
              value={data.highlight}
              onChange={e => setHeader({ highlight: e.target.value })}
              placeholder="마이파트너스"
              className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-[7px]">접미사</label>
            <input
              type="text"
              value={data.suffix}
              onChange={e => setHeader({ suffix: e.target.value })}
              placeholder="입니다."
              className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#111827] mb-[7px]">서명</label>
          <input
            type="text"
            value={data.signoff}
            onChange={e => setHeader({ signoff: e.target.value })}
            placeholder="마이파트너스 대표이사"
            className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
          />
        </div>

        {/* Title font size */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-[#374151] w-40 shrink-0">제목 글자 크기</label>
          <input
            type="range"
            min={24}
            max={72}
            value={data.titleSize ?? 48}
            onChange={e => setHeader({ titleSize: Number(e.target.value) })}
            className="flex-1 accent-[#F97316]"
          />
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number"
              min={24}
              max={72}
              value={data.titleSize ?? 48}
              onChange={e => setHeader({ titleSize: Number(e.target.value) || 24 })}
              className="w-16 px-2 py-1 border border-[#E5E7EB] rounded-lg text-sm text-center text-[#111827] focus:outline-none focus:border-[#F97316]"
            />
            <span className="text-xs text-[#6B7280]">px</span>
          </div>
        </div>

        {/* Title color */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-[#374151] w-40 shrink-0">제목 색상</label>
          <input
            type="color"
            value={data.titleColor ?? '#18181B'}
            onChange={e => setHeader({ titleColor: e.target.value })}
            className="w-10 h-10 rounded-lg border border-[#E5E7EB] cursor-pointer"
          />
          <input
            type="text"
            value={data.titleColor ?? '#18181B'}
            onChange={e => setHeader({ titleColor: e.target.value })}
            className="w-24 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] font-mono"
          />
        </div>

        {/* Highlight color */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-[#374151] w-40 shrink-0">강조 색상</label>
          <input
            type="color"
            value={data.highlightColor ?? '#F97316'}
            onChange={e => setHeader({ highlightColor: e.target.value })}
            className="w-10 h-10 rounded-lg border border-[#E5E7EB] cursor-pointer"
          />
          <input
            type="text"
            value={data.highlightColor ?? '#F97316'}
            onChange={e => setHeader({ highlightColor: e.target.value })}
            className="w-24 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] font-mono"
          />
        </div>

        {/* Body font size */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-[#374151] w-40 shrink-0">본문 글자 크기</label>
          <input
            type="range"
            min={14}
            max={24}
            value={data.bodySize ?? 18}
            onChange={e => setHeader({ bodySize: Number(e.target.value) })}
            className="flex-1 accent-[#F97316]"
          />
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number"
              min={14}
              max={24}
              value={data.bodySize ?? 18}
              onChange={e => setHeader({ bodySize: Number(e.target.value) || 14 })}
              className="w-16 px-2 py-1 border border-[#E5E7EB] rounded-lg text-sm text-center text-[#111827] focus:outline-none focus:border-[#F97316]"
            />
            <span className="text-xs text-[#6B7280]">px</span>
          </div>
        </div>

        {/* Body color */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-[#374151] w-40 shrink-0">본문 텍스트 색상</label>
          <input
            type="color"
            value={data.bodyColor ?? '#525252'}
            onChange={e => setHeader({ bodyColor: e.target.value })}
            className="w-10 h-10 rounded-lg border border-[#E5E7EB] cursor-pointer"
          />
          <input
            type="text"
            value={data.bodyColor ?? '#525252'}
            onChange={e => setHeader({ bodyColor: e.target.value })}
            className="w-24 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] font-mono"
          />
        </div>
      </div>

      {/* Content blocks */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-base font-semibold text-[#111827] flex items-center gap-2">
            <span className="inline-block w-1 h-[18px] bg-[#F97316] rounded-[2px]" />
            본문 블록
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => addBlock('text')}
              className="inline-flex items-center gap-1.5 px-3 py-[6px] bg-gray-100 hover:bg-gray-200 border border-[#E5E7EB] rounded-lg text-xs font-semibold text-[#111827] transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/>
                <line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>
              </svg>
              텍스트 추가
            </button>
            <button
              onClick={() => addBlock('image')}
              className="inline-flex items-center gap-1.5 px-3 py-[6px] bg-gray-100 hover:bg-gray-200 border border-[#E5E7EB] rounded-lg text-xs font-semibold text-[#111827] transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              이미지 추가
            </button>
          </div>
        </div>

        {data.blocks.length === 0 ? (
          <div className="text-center py-8 text-[#6B7280] border-2 border-dashed border-[#E5E7EB] rounded-xl">
            <p className="text-sm">블록을 추가하여 인사말 본문을 구성하세요.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data.blocks.map((block, idx) => (
              <BlockItem
                key={block.id}
                block={block}
                index={idx}
                total={data.blocks.length}
                onChange={updateBlock}
                onMoveUp={id => moveBlock(id, 'up')}
                onMoveDown={id => moveBlock(id, 'down')}
                onDelete={deleteBlock}
              />
            ))}
          </div>
        )}
      </div>

      {/* About 페이지 스타일 */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <span className="inline-block w-1 h-[18px] bg-[#F97316] rounded-[2px]" />
          About 페이지 스타일
        </div>
        <div className="space-y-4">
          {/* 섹션 제목 크기 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[#374151] w-40 shrink-0">섹션 제목 크기</label>
            <input
              type="range"
              min={24}
              max={64}
              value={aboutStyles.sectionTitleSize}
              onChange={e => setAboutStyles(prev => ({ ...prev, sectionTitleSize: Number(e.target.value) }))}
              className="flex-1 accent-[#F97316]"
            />
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                min={24}
                max={64}
                value={aboutStyles.sectionTitleSize}
                onChange={e => setAboutStyles(prev => ({ ...prev, sectionTitleSize: Number(e.target.value) || 24 }))}
                className="w-16 px-2 py-1 border border-[#E5E7EB] rounded-lg text-sm text-center text-[#111827] focus:outline-none focus:border-[#F97316]"
              />
              <span className="text-xs text-[#6B7280]">px</span>
            </div>
          </div>
          {/* 섹션 제목 색상 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[#374151] w-40 shrink-0">섹션 제목 색상</label>
            <input
              type="color"
              value={aboutStyles.sectionTitleColor}
              onChange={e => setAboutStyles(prev => ({ ...prev, sectionTitleColor: e.target.value }))}
              className="w-10 h-10 rounded-lg border border-[#E5E7EB] cursor-pointer"
            />
            <input
              type="text"
              value={aboutStyles.sectionTitleColor}
              onChange={e => setAboutStyles(prev => ({ ...prev, sectionTitleColor: e.target.value }))}
              className="w-24 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] font-mono"
            />
          </div>
          {/* 본문 크기 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[#374151] w-40 shrink-0">본문 크기</label>
            <input
              type="range"
              min={14}
              max={24}
              value={aboutStyles.bodySize}
              onChange={e => setAboutStyles(prev => ({ ...prev, bodySize: Number(e.target.value) }))}
              className="flex-1 accent-[#F97316]"
            />
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                min={14}
                max={24}
                value={aboutStyles.bodySize}
                onChange={e => setAboutStyles(prev => ({ ...prev, bodySize: Number(e.target.value) || 14 }))}
                className="w-16 px-2 py-1 border border-[#E5E7EB] rounded-lg text-sm text-center text-[#111827] focus:outline-none focus:border-[#F97316]"
              />
              <span className="text-xs text-[#6B7280]">px</span>
            </div>
          </div>
          {/* 본문 색상 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[#374151] w-40 shrink-0">본문 색상</label>
            <input
              type="color"
              value={aboutStyles.bodyColor}
              onChange={e => setAboutStyles(prev => ({ ...prev, bodyColor: e.target.value }))}
              className="w-10 h-10 rounded-lg border border-[#E5E7EB] cursor-pointer"
            />
            <input
              type="text"
              value={aboutStyles.bodyColor}
              onChange={e => setAboutStyles(prev => ({ ...prev, bodyColor: e.target.value }))}
              className="w-24 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] font-mono"
            />
          </div>
          {/* 강조 색상 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[#374151] w-40 shrink-0">강조 색상</label>
            <input
              type="color"
              value={aboutStyles.accentColor}
              onChange={e => setAboutStyles(prev => ({ ...prev, accentColor: e.target.value }))}
              className="w-10 h-10 rounded-lg border border-[#E5E7EB] cursor-pointer"
            />
            <input
              type="text"
              value={aboutStyles.accentColor}
              onChange={e => setAboutStyles(prev => ({ ...prev, accentColor: e.target.value }))}
              className="w-24 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] font-mono"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-[18px] py-[9px] bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 mb-5"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
        </svg>
        {saving ? '저장 중...' : '저장하기'}
      </button>

      {/* Live preview */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04]">
        <div className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <span className="inline-block w-1 h-[18px] bg-[#F97316] rounded-[2px]" />
          미리보기
        </div>
        <div className="bg-[#f9fafb] rounded-xl p-6 border border-[#E5E7EB]">
          <p className="text-xl font-bold text-[#111827] mb-4 leading-snug">
            {data.title}<br />
            <span className="text-[#F97316]">{data.highlight}</span>{data.suffix}
          </p>
          <div className="ql-editor space-y-4" style={{ padding: 0 }}>
            {data.blocks.map(block => (
              <div key={block.id}>
                {block.type === 'text' ? (
                  <div
                    className="text-sm text-[#374151] leading-[1.7]"
                    style={{ minHeight: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: block.html }}
                  />
                ) : (
                  <div>
                    {(block as ImageBlock).url && (
                      <img
                        src={(block as ImageBlock).url}
                        alt={(block as ImageBlock).caption || ''}
                        className="w-full max-h-72 object-cover rounded-lg"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    {(block as ImageBlock).caption && (
                      <p className="text-xs text-[#6B7280] mt-1 text-center">{(block as ImageBlock).caption}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {data.signoff && (
            <div className="pt-4 mt-4 border-t border-[#E5E7EB]">
              <p className="text-right text-sm font-semibold text-[#6B7280]">{data.signoff}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
