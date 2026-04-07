import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { QUILL_MODULES } from '../../lib/quill-config';
import { adminGetSettings, uploadToCloudinary } from '../../lib/admin-api';
import { getPortfolioList, savePortfolioItem, deletePortfolioItem, generateSlug, updatePortfolioOrder } from '../../lib/api';
import DropZone from './shared/DropZone';
import ImagePreview from './shared/ImagePreview';
import { useToast } from './shared/Toast';
import { useConfirm } from './shared/ConfirmModal';


// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface TextBlock {
  type: 'text';
  content: string;
}
interface ImageBlock {
  type: 'image';
  url: string;
  caption: string;
}
interface VideoBlock {
  type: 'video';
  url: string;
  caption: string;
}
type ContentBlock = TextBlock | ImageBlock | VideoBlock;

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  thumbnail: string;
  image: string;
  featured: boolean;
  blocks: ContentBlock[];
}

type CategoryFilter = '전체' | '행사스케치' | '아이디어 노트' | '행사프로그램';

const CATEGORY_FILTERS: CategoryFilter[] = ['전체', '행사스케치', '아이디어 노트', '행사프로그램'];
const MAIN_CATEGORIES = ['행사스케치', '아이디어 노트', '행사프로그램'];
const SUBCATEGORIES = [
  '기념행사', '프로모션', 'Sports', 'VIP 행사', '국제행사',
  '컨퍼런스', '컨테스트', '공연 축제', '디자인', '시스템 협업', '인재협업',
];

function emptyForm() {
  return {
    title: '',
    category: '행사스케치',
    subcategory: '기념행사',
    thumbnail: '',
    featured: false,
  };
}

// ─────────────────────────────────────────────
// Video embed helper
// ─────────────────────────────────────────────
function getVideoEmbedUrl(url: string): string {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  if (/\.(mp4|webm|ogg)$/i.test(url)) return url;
  return '';
}

// ─────────────────────────────────────────────
// Block editor sub-component
// ─────────────────────────────────────────────
function BlockEditor({
  blocks,
  onChange,
  onError,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  onError: (msg: string) => void;
}) {
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  function addBlock(type: 'text' | 'image' | 'video') {
    const next = [...blocks];
    if (type === 'text') next.push({ type: 'text', content: '' });
    else if (type === 'video') next.push({ type: 'video', url: '', caption: '' });
    else next.push({ type: 'image', url: '', caption: '' });
    onChange(next);
  }

  function removeBlock(idx: number) {
    onChange(blocks.filter((_, i) => i !== idx));
  }

  function moveBlock(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  }

  function updateBlock(idx: number, patch: Partial<ContentBlock>) {
    onChange(blocks.map((b, i) => i === idx ? { ...b, ...patch } as ContentBlock : b));
  }

  // Upload single image block → Cloudinary (not base64)
  async function handleBlockFile(idx: number, file: File) {
    setUploadingIdx(idx);
    try {
      const url = await uploadToCloudinary(file, 'mai-portfolio');
      updateBlock(idx, { url } as Partial<ContentBlock>);
    } catch {
      onError('이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingIdx(null);
    }
  }

  // Bulk upload: create image blocks for each file sequentially
  async function handleBulkImages(files: File[]) {
    if (!files.length) return;
    setBulkProgress({ current: 0, total: files.length });
    const newBlocks: ContentBlock[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadToCloudinary(files[i], 'mai-portfolio');
        newBlocks.push({ type: 'image', url, caption: '' });
      } catch {
        onError(`${files[i].name} 업로드 실패`);
      }
      setBulkProgress({ current: i + 1, total: files.length });
    }
    setBulkProgress(null);
    if (newBlocks.length > 0) onChange([...blocks, ...newBlocks]);
  }

  const typeNames: Record<string, string> = { text: '텍스트', image: '이미지', video: '동영상' };

  return (
    <div>
      {blocks.length === 0 ? (
        <div className="py-4 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg mb-2.5">
          블록을 추가하여 콘텐츠를 작성하세요
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 mb-2.5">
          {blocks.map((block, idx) => (
            <div
              key={idx}
              className="bg-gray-50 border border-gray-200 rounded-xl p-2.5"
            >
              {/* Block toolbar */}
              <div className="flex items-center gap-1 mb-1.5">
                <span className="flex-1 text-[0.75rem] font-semibold text-gray-500">
                  {typeNames[block.type] || block.type} #{idx + 1}
                </span>
                {idx > 0 && (
                  <button
                    type="button"
                    title="위로"
                    onClick={() => moveBlock(idx, -1)}
                    className="px-2 py-1 text-xs border border-gray-200 rounded text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    ▲
                  </button>
                )}
                {idx < blocks.length - 1 && (
                  <button
                    type="button"
                    title="아래로"
                    onClick={() => moveBlock(idx, 1)}
                    className="px-2 py-1 text-xs border border-gray-200 rounded text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    ▼
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeBlock(idx)}
                  className="px-2 py-1 text-[0.7rem] font-semibold bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                >
                  삭제
                </button>
              </div>

              {/* Block content */}
              {block.type === 'text' && (
                <div className="min-h-[160px]">
                  <ReactQuill
                    value={block.content}
                    onChange={(val, _delta, source) => {
                      if (source === 'api') return;
                      updateBlock(idx, { content: val });
                    }}
                    modules={QUILL_MODULES}
                    theme="snow"
                    placeholder="텍스트를 입력하세요..."
                  />
                </div>
              )}

              {block.type === 'video' && (
                <>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-orange-500 mb-1.5"
                    placeholder="YouTube 또는 동영상 URL 입력"
                    value={block.url}
                    onChange={e => updateBlock(idx, { url: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-orange-500"
                    placeholder="캡션 (선택)"
                    value={block.caption}
                    onChange={e => updateBlock(idx, { caption: e.target.value })}
                  />
                  {block.url && (
                    <iframe
                      src={getVideoEmbedUrl(block.url)}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="w-full mt-1.5 rounded-lg border-none"
                      style={{ aspectRatio: '16/9' }}
                    />
                  )}
                </>
              )}

              {block.type === 'image' && (
                <>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-orange-500 mb-1.5"
                    placeholder="이미지 URL 입력"
                    value={block.url}
                    onChange={e => updateBlock(idx, { url: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-orange-500"
                    placeholder="캡션 (선택)"
                    value={block.caption}
                    onChange={e => updateBlock(idx, { caption: e.target.value })}
                  />
                  {block.url && (
                    <img
                      src={block.url}
                      className="mt-1.5 max-h-[120px] rounded-lg"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      alt=""
                    />
                  )}
                  <div className="mt-1.5">
                    <DropZone
                      onFile={file => handleBlockFile(idx, file)}
                      label="클릭 또는 드래그하여 이미지 업로드"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bulk progress indicator */}
      {bulkProgress && (
        <div className="mb-2.5 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
          <svg className="w-4 h-4 text-orange-500 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 00-10 10h4z" />
          </svg>
          <span className="text-sm font-semibold text-orange-600">
            사진 업로드 중... {bulkProgress.current} / {bulkProgress.total}
          </span>
          <div className="flex-1 h-1.5 bg-orange-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Add block buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => addBlock('text')}
          className="px-3 py-1.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 transition-colors"
        >
          + 텍스트 추가
        </button>
        <button
          type="button"
          onClick={() => addBlock('image')}
          className="px-3 py-1.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 transition-colors"
        >
          + 이미지 추가
        </button>
        <button
          type="button"
          onClick={() => addBlock('video')}
          className="px-3 py-1.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 transition-colors"
        >
          + 동영상 추가
        </button>
        <button
          type="button"
          disabled={!!bulkProgress}
          onClick={() => bulkInputRef.current?.click()}
          className="px-3 py-1.5 text-sm font-semibold bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          사진 여러장 한번에 추가
        </button>
      </div>

      {/* Hidden bulk file input */}
      <input
        ref={bulkInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files || []) as File[];
          e.target.value = '';
          if (files.length > 0) handleBulkImages(files);
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function AdminPortfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [filterCat, setFilterCat] = useState<CategoryFilter>('전체');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();

  // ── Load ─────────────────────────────────
  useEffect(() => {
    getPortfolioList()
      .then(snapshot => setItems(snapshot))
      .catch(err => console.error('Portfolio load error:', err));
  }, []);

  // ── Persist ───────────────────────────────
  async function persistItem(item: PortfolioItem) {
    await savePortfolioItem(item.id, item);
  }

  // ── Filtered ──────────────────────────────
  const filtered =
    filterCat === '전체' ? items : items.filter(i => i.category === filterCat);

  // ── Open add ──────────────────────────────
  function openAdd() {
    setEditId(null);
    setForm(emptyForm());
    setBlocks([]);
    setShowForm(prev => !prev);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  // ── Open edit ─────────────────────────────
  function openEdit(id: string) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setEditId(id);
    setForm({
      title: item.title,
      category: item.category,
      subcategory: item.subcategory || '기념행사',
      thumbnail: item.thumbnail || item.image || '',
      featured: item.featured,
    });
    setBlocks(JSON.parse(JSON.stringify(item.blocks || [])));
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  // ── File upload (thumbnail) ───────────────
  async function handleFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'mai-portfolio');
      setForm(prev => ({ ...prev, thumbnail: url }));
      showToast('이미지가 업로드되었습니다.', 'success');
    } catch {
      showToast('업로드에 실패했습니다.', 'error');
    } finally {
      setUploading(false);
    }
  }

  // ── Save ──────────────────────────────────
  async function handleSave() {
    if (!form.title.trim()) {
      showToast('제목을 입력하세요.', 'error');
      return;
    }
    const subcategory = form.category === '행사스케치' ? form.subcategory : '';
    setSaving(true);
    try {
      if (editId !== null) {
        const existing = items.find(i => i.id === editId);
        const updatedItem = {
          id: editId,
          ...form,
          subcategory,
          image: form.thumbnail,
          blocks,
          sortOrder: (existing as any)?.sortOrder || Date.now(),
        };
        await savePortfolioItem(editId, updatedItem);
        setItems(prev => prev.map(i => i.id === editId ? updatedItem : i));
        showToast('항목이 수정되었습니다.', 'success');
      } else {
        const baseSlug = generateSlug(form.title) || String(Date.now());
        const suffix = String(Date.now()).slice(-6);
        const newId = `${baseSlug}-${suffix}`;
        const newItem = {
          id: newId,
          title: form.title,
          category: form.category,
          subcategory,
          thumbnail: form.thumbnail,
          image: form.thumbnail,
          featured: form.featured,
          blocks,
          sortOrder: Date.now(),
        };
        await savePortfolioItem(newId, newItem);
        setItems(prev => [newItem, ...prev]);
        showToast('항목이 추가되었습니다.', 'success');
      }
      setShowForm(false);
    } catch {
      showToast('저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  }


  // ── Move (로컬만 변경, 저장은 별도) ──────
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  function handleMove(id: string, dir: -1 | 1) {
    const list = [...items];
    const idx = list.findIndex(i => i.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    [list[idx], list[swapIdx]] = [list[swapIdx], list[idx]];
    setItems(list);
    setOrderChanged(true);
  }

  async function handleSaveOrder() {
    setSavingOrder(true);
    try {
      const total = items.length;
      const updates = items.map((item, i) =>
        updatePortfolioOrder(item.id, (total - i) * 1000)
      );
      await Promise.all(updates);
      setItems(prev => prev.map((item, i) => ({ ...item, sortOrder: (total - i) * 1000 })));
      setOrderChanged(false);
      showToast('순서가 저장되었습니다.', 'success');
    } catch {
      showToast('순서 저장에 실패했습니다.', 'error');
    } finally {
      setSavingOrder(false);
    }
  }

  // ── Delete ────────────────────────────────
  async function handleDelete(id: string) {
    const ok = await showConfirm('항목 삭제', '이 포트폴리오 항목을 삭제하시겠습니까?');
    if (!ok) return;
    try {
      await deletePortfolioItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
      showToast('항목이 삭제되었습니다.', 'info');
    } catch {
      showToast('삭제에 실패했습니다.', 'error');
    }
  }

  // ─────────────────────────────────────────
  return (
    <div>
      <h2 className="text-2xl font-bold mb-1 text-gray-900">포트폴리오 관리</h2>
      <p className="text-sm text-gray-500 mb-6">포트폴리오 항목을 추가, 수정, 삭제합니다.</p>

      {/* ── Add/Edit form ── */}
      {showForm && (
        <div
          ref={formRef}
          className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-5 mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-[18px] bg-orange-500 rounded-sm inline-block" />
            <span className="font-semibold text-gray-900">
              {editId !== null ? '항목 수정' : '항목 추가'}
            </span>
          </div>

          {/* Title + Category row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">제목</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-white"
                placeholder="글로벌 테크 컨퍼런스 현장"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">카테고리</label>
              <select
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500 bg-white cursor-pointer"
                value={form.category}
                onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
              >
                {MAIN_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {/* Subcategory — only shown when category === '행사스케치' */}
            {form.category === '행사스케치' && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">세부 카테고리</label>
                <select
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500 bg-white cursor-pointer"
                  value={form.subcategory}
                  onChange={e => setForm(prev => ({ ...prev, subcategory: e.target.value }))}
                >
                  {SUBCATEGORIES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Thumbnail URL */}
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">대표 이미지 (썸네일)</label>
            <input
              type="text"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-white"
              placeholder="https://..."
              value={form.thumbnail}
              onChange={e => setForm(prev => ({ ...prev, thumbnail: e.target.value }))}
            />
          </div>

          {/* Drop zone */}
          <div className="mb-3">
            {uploading ? (
              <div className="border-2 border-dashed border-orange-300 rounded-xl p-5 text-center text-sm text-orange-500 font-semibold bg-orange-50">
                업로드 중...
              </div>
            ) : (
              <DropZone onFile={handleFile} label="클릭 또는 드래그하여 대표 이미지 업로드" />
            )}
          </div>

          {/* Thumbnail preview */}
          {form.thumbnail && (
            <div className="mb-3">
              <ImagePreview
                url={form.thumbnail}
                onClose={() => setForm(prev => ({ ...prev, thumbnail: '' }))}
              />
            </div>
          )}

          {/* Featured toggle */}
          <div className="mb-4 mt-3.5">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-[18px] h-[18px] accent-orange-500 cursor-pointer"
                checked={form.featured}
                onChange={e => setForm(prev => ({ ...prev, featured: e.target.checked }))}
              />
              <span className="text-sm font-semibold text-gray-900">대표 포트폴리오로 지정</span>
            </label>
            <p className="text-[0.78rem] text-gray-400 mt-1 ml-7">
              체크하면 서비스 상세 페이지에서 해당 카테고리의 대표 포트폴리오로 노출됩니다.
            </p>
          </div>

          {/* Block editor */}
          <div className="mb-4 mt-4">
            <label className="block text-sm font-semibold text-gray-900 mb-1">콘텐츠 (네이버 블로그 스타일)</label>
            <p className="text-[0.8rem] text-gray-400 mb-2.5">텍스트와 이미지를 자유롭게 배치하세요.</p>
            <BlockEditor blocks={blocks} onChange={setBlocks} onError={msg => showToast(msg, 'error')} />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg border border-gray-200 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* ── Actions bar ── */}
      <div className="flex justify-between items-center mb-5">
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORY_FILTERS.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-4 py-[7px] rounded-full border text-[0.85rem] font-semibold transition-all ${
                filterCat === cat
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-orange-500 hover:text-white hover:border-orange-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {orderChanged && (
            <button
              onClick={handleSaveOrder}
              disabled={savingOrder}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors animate-pulse"
            >
              {savingOrder ? '저장 중...' : '순서 저장'}
            </button>
          )}
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            항목 추가
          </button>
        </div>
      </div>
      {/* ── Portfolio grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 text-gray-400" style={{ gridColumn: '1/-1' }}>
          <svg className="w-12 h-12 mx-auto mb-3.5 opacity-35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <p className="text-base">항목이 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {filtered.map((item, idx) => (
            <PortfolioCard
              key={item.id}
              item={item}
              index={idx}
              total={filtered.length}
              onEdit={openEdit}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PortfolioCard sub-component
// ─────────────────────────────────────────────
interface PortfolioCardProps {
  item: PortfolioItem;
  index: number;
  total: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({
  item,
  index,
  total,
  onEdit,
  onDelete,
  onMove,
}) => {
  return (
    <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      {/* 순서 번호 */}
      <div className="absolute top-2 left-2 z-10 bg-zinc-800 text-white text-[0.65rem] font-bold w-6 h-6 flex items-center justify-center rounded-full">
        {index + 1}
      </div>
      {item.featured && (
        <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded-md tracking-wide">
          대표
        </div>
      )}
      <img
        className="w-full h-[140px] object-cover block bg-gray-200"
        src={item.thumbnail || item.image || ''}
        alt={item.title}
        onError={e => { (e.currentTarget as HTMLImageElement).style.background = '#E5E7EB'; }}
      />
      <div className="px-3 py-2.5">
        <div className="text-[0.7rem] font-bold uppercase tracking-[0.06em] text-orange-500 mb-1">
          {item.category}{item.subcategory ? ` › ${item.subcategory}` : ''}
        </div>
        <div className="text-[0.85rem] font-semibold text-gray-900 mb-2 leading-snug">
          {item.title}
        </div>
        <div className="text-[0.75rem] text-gray-400 mb-1.5">
          {(item.blocks || []).length}개 블록
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {index > 0 && (
            <button
              onClick={() => onMove(item.id, -1)}
              title="앞으로"
              className="px-2 py-1.5 text-[0.8rem] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-colors"
            >
              ◀
            </button>
          )}
          {index < total - 1 && (
            <button
              onClick={() => onMove(item.id, 1)}
              title="뒤로"
              className="px-2 py-1.5 text-[0.8rem] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-colors"
            >
              ▶
            </button>
          )}
          <button
            onClick={() => onEdit(item.id)}
            className="px-3 py-1.5 text-[0.8rem] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 transition-colors"
          >
            수정
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="px-3 py-1.5 text-[0.8rem] font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
