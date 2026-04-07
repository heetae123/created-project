import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { QUILL_BOARD_TOOLBAR, QUILL_FORMATS } from '../../lib/quill-config';
import { getBoardPosts, saveBoardPost, deleteBoardPost, uploadToCloudinary, toggleBoardPin } from '../../lib/admin-api';
import { ToastProvider, useToast } from './shared/Toast';
import { ConfirmProvider, useConfirm } from './shared/ConfirmModal';
import DropZone from './shared/DropZone';

type Category = 'all' | 'notice' | 'news' | 'certificate';

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

interface BoardPost {
  id: number;
  title: string;
  author: string;
  content: string;
  thumbnail: string;
  category: string;
  isNotice: boolean;
  pinned?: boolean;
  password: string;
  views: number;
  date: string;
  createdAt: string;
  blocks?: any[];
  _cat?: string;
  _num?: number;
}

function CategoryBadge({ cat }: { cat: string }) {
  if (cat === 'notice') {
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-[0.7rem] font-semibold" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316' }}>
        NOTICE
      </span>
    );
  }
  if (cat === 'certificate') {
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-[0.7rem] font-semibold" style={{ background: '#ECFDF5', color: '#059669' }}>
        CERTIFICATE
      </span>
    );
  }
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-[0.7rem] font-semibold" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
      NEWS
    </span>
  );
}

// ── Main Component ────────────────────────────────────────

function AdminBoardInner() {
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();

  // List state
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Category>('all');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formCategory, setFormCategory] = useState<'notice' | 'news' | 'certificate'>('notice');
  const [formContent, setFormContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // Quill ref and stable toast ref (updated each render, no re-initialization)
  const quillRef = useRef<any>(null);
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;
  const pasteCleanupRef = useRef<(() => void) | null>(null);

  // Intercept paste/drop images → upload to Cloudinary instead of embedding base64.
  // Base64 in HTML balloons the Firestore document past its 1 MB limit.
  useEffect(() => {
    if (!showForm) {
      pasteCleanupRef.current?.();
      pasteCleanupRef.current = null;
      return;
    }

    const timer = setTimeout(() => {
      const editor = quillRef.current?.getEditor();
      if (!editor) return;

      async function onPaste(e: ClipboardEvent) {
        const items = Array.from(e.clipboardData?.items ?? []);
        const images = items.filter(i => i.type.startsWith('image/'));
        if (!images.length) return;
        e.preventDefault();
        e.stopPropagation();
        const range = editor.getSelection() ?? { index: editor.getLength(), length: 0 };
        for (const item of images) {
          const file = item.getAsFile();
          if (!file) continue;
          try {
            const url = await uploadToCloudinary(file, 'mai-board');
            editor.insertEmbed(range.index, 'image', url, 'user');
            editor.setSelection(range.index + 1, 0, 'user');
          } catch {
            showToastRef.current('이미지 업로드에 실패했습니다.', 'error');
          }
        }
      }

      async function onDrop(e: DragEvent) {
        const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'));
        if (!files.length) return;
        e.preventDefault();
        e.stopPropagation();
        const range = editor.getSelection() ?? { index: editor.getLength(), length: 0 };
        for (const file of files) {
          try {
            const url = await uploadToCloudinary(file, 'mai-board');
            editor.insertEmbed(range.index, 'image', url, 'user');
            editor.setSelection(range.index + 1, 0, 'user');
          } catch {
            showToastRef.current('이미지 업로드에 실패했습니다.', 'error');
          }
        }
      }

      editor.root.addEventListener('paste', onPaste as EventListener, true);
      editor.root.addEventListener('drop', onDrop as EventListener, true);

      pasteCleanupRef.current = () => {
        editor.root.removeEventListener('paste', onPaste as EventListener, true);
        editor.root.removeEventListener('drop', onDrop as EventListener, true);
      };
    }, 200);

    return () => {
      clearTimeout(timer);
      pasteCleanupRef.current?.();
      pasteCleanupRef.current = null;
    };
  }, [showForm]);

  // Build modules once — handlers use refs to access latest values
  const modules = useMemo(() => ({
    toolbar: {
      container: QUILL_BOARD_TOOLBAR,
      handlers: {
        image: function () {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.multiple = true;
          input.click();
          input.onchange = async () => {
            const files = Array.from(input.files || []);
            if (!files.length) return;
            const quill = quillRef.current?.getEditor();
            if (!quill) return;
            let idx = (quill.getSelection() ?? { index: quill.getLength(), length: 0 }).index;
            for (const file of files) {
              try {
                const url = await uploadToCloudinary(file, 'mai-board');
                quill.insertEmbed(idx, 'image', url, 'user');
                idx += 1;
                quill.setSelection(idx, 0, 'user');
              } catch {
                showToastRef.current('이미지 업로드에 실패했습니다.', 'error');
              }
            }
          };
        },
        video: function () {
          const url = window.prompt('YouTube 또는 Vimeo URL을 입력하세요:');
          if (!url) return;
          const embedUrl = getEmbedUrl(url);
          if (!embedUrl) {
            showToastRef.current('유효한 YouTube 또는 Vimeo URL을 입력하세요.', 'error');
            return;
          }
          const quill = quillRef.current?.getEditor();
          if (!quill) return;
          const range = quill.getSelection() ?? { index: quill.getLength(), length: 0 };
          quill.insertEmbed(range.index, 'video', embedUrl, 'user');
          quill.setSelection(range.index + 1, 0, 'user');
        },
      },
    },
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const data = await getBoardPosts();
      setPosts(enrichPosts(data));
    } catch {
      showToast('게시물을 불러올 수 없습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function enrichPosts(allPosts: any[]): BoardPost[] {
    const sortedAsc = [...allPosts].sort((a, b) => (a.id || 0) - (b.id || 0));
    let noticeCount = 0, newsCount = 0, certCount = 0;
    const numMap: Record<number, number> = {};
    sortedAsc.forEach(p => {
      const cat = p.category || (p.isNotice ? 'notice' : 'news');
      if (cat === 'notice') { noticeCount++; numMap[p.id] = noticeCount; }
      else if (cat === 'certificate') { certCount++; numMap[p.id] = certCount; }
      else { newsCount++; numMap[p.id] = newsCount; }
    });

    const sorted = [...allPosts].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.id || 0) - (a.id || 0);
    });
    return sorted.map(p => ({
      ...p,
      _cat: p.category || (p.isNotice ? 'notice' : 'news'),
      _num: numMap[p.id] || 0,
    }));
  }

  const filteredPosts = filter === 'all'
    ? posts
    : posts.filter(p => p._cat === filter);

  // ── Form helpers ─────────────────────────────────────────

  function openNewForm() {
    setEditId(null);
    setFormTitle('');
    setFormThumbnail('');
    setFormCategory('notice');
    setFormContent('');
    setShowForm(true);
  }

  async function openEditForm(post: BoardPost) {
    setEditId(String(post.id));
    setFormTitle(post.title || '');
    setFormThumbnail(post.thumbnail || '');
    setFormCategory((post.category || (post.isNotice ? 'notice' : 'news')) as 'notice' | 'news' | 'certificate');

    // Load content: prefer first text block, fall back to post.content
    let content = '';
    if (post.blocks && post.blocks.length > 0) {
      const textBlock = post.blocks.find((b: any) => b.type === 'text');
      content = textBlock?.html || '';
    }
    if (!content && post.content) {
      content = post.content;
    }
    setFormContent(content);

    setShowForm(true);
    setTimeout(() => {
      document.getElementById('board-form-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  function cancelForm() {
    setShowForm(false);
    setEditId(null);
    setFormContent('');
  }

  async function handleThumbnailFile(file: File) {
    setUploadingThumb(true);
    try {
      const url = await uploadToCloudinary(file, 'mai-board');
      setFormThumbnail(url);
    } catch {
      showToast('이미지 업로드에 실패했습니다.', 'error');
    } finally {
      setUploadingThumb(false);
    }
  }

  async function handleSave() {
    if (saving) return;
    const title = formTitle.trim();
    const content = formContent.trim();

    if (!title || !content || content === '<p><br></p>') {
      showToast('제목과 내용을 입력하세요.', 'error');
      return;
    }

    setSaving(true);
    try {
      await saveBoardPost({
        title,
        content,
        blocks: [{ type: 'text', html: content }],
        thumbnail: formThumbnail.trim(),
        category: formCategory,
        isNotice: formCategory === 'notice',
        editId: editId || null,
      });
      showToast(editId ? '게시물이 수정되었습니다.' : '게시물이 등록되었습니다.', 'success');
      setShowForm(false);
      setEditId(null);
      setFormContent('');
      await loadPosts();
    } catch (e: any) {
      showToast('저장에 실패했습니다: ' + (e?.message || e), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(post: BoardPost) {
    const ok = await showConfirm('게시물 삭제', '이 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!ok) return;
    try {
      await deleteBoardPost(String(post.id));
      showToast('게시물이 삭제되었습니다.', 'info');
      await loadPosts();
    } catch {
      showToast('삭제에 실패했습니다.', 'error');
    }
  }

  async function handleTogglePin(post: BoardPost) {
    try {
      await toggleBoardPin(String(post.id), !post.pinned);
      showToast(post.pinned ? '고정이 해제되었습니다.' : '상단에 고정되었습니다.', 'success');
      await loadPosts();
    } catch {
      showToast('처리에 실패했습니다.', 'error');
    }
  }

  const filterLabels: { key: Category; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'notice', label: 'NOTICE' },
    { key: 'news', label: 'NEWS' },
    { key: 'certificate', label: 'CERTIFICATE' },
  ];

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-[#111827] mb-1">게시판 관리</h2>
        <p className="text-sm text-[#6B7280]">게시물을 작성, 수정, 삭제합니다. 툴바로 텍스트·이미지·동영상을 자유롭게 구성하세요.</p>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div
          id="board-form-top"
          className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5 mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#F97316] shrink-0" />
            <span className="text-sm font-semibold text-[#111827]">{editId ? '게시물 수정' : '새 글 작성'}</span>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-1.5">제목</label>
            <input
              type="text"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="게시물 제목을 입력하세요"
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30"
            />
          </div>

          {/* Thumbnail URL */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-[#374151] mb-1.5">대표 이미지 URL (선택)</label>
            <input
              type="text"
              value={formThumbnail}
              onChange={e => setFormThumbnail(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30"
            />
          </div>

          {/* Thumbnail dropzone */}
          {uploadingThumb ? (
            <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-5 flex flex-col items-center gap-2 text-[#9CA3AF] mb-4">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <p className="text-xs">업로드 중...</p>
            </div>
          ) : (
            <div className="mb-4">
              <DropZone onFile={handleThumbnailFile} label="클릭 또는 드래그하여 대표 이미지 업로드" />
            </div>
          )}

          {/* Thumbnail preview */}
          {formThumbnail.trim() && (
            <div className="mb-4 relative inline-block">
              <img
                src={formThumbnail}
                alt="썸네일 미리보기"
                className="h-28 rounded-lg object-cover border border-[#E5E7EB] bg-[#F3F4F6]"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setFormThumbnail('')}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          )}

          {/* Single Quill editor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              내용
              <span className="ml-2 text-xs font-normal text-[#9CA3AF]">툴바의 이미지 버튼으로 사진 업로드, 동영상 버튼으로 YouTube/Vimeo 삽입</span>
            </label>
            <div className="quill-wrapper">
              <ReactQuill
                {...{ ref: quillRef } as any}
                theme="snow"
                value={formContent}
                onChange={(val, _delta, source) => { if (source === 'api') return; setFormContent(val); }}
                modules={modules}
                formats={QUILL_FORMATS}
                placeholder="내용을 입력하세요. 이미지와 동영상을 툴바로 삽입할 수 있습니다."
              />
            </div>
          </div>

          {/* Category */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#374151] mb-1.5">분류</label>
            <select
              value={formCategory}
              onChange={e => setFormCategory(e.target.value as 'notice' | 'news' | 'certificate')}
              className="px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 bg-white"
              style={{ width: '220px' }}
            >
              <option value="notice">NOTICE (공지사항)</option>
              <option value="news">NEWS (뉴스)</option>
              <option value="certificate">CERTIFICATE (인증서)</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {saving ? '저장 중...' : '게시'}
            </button>
            <button
              onClick={cancelForm}
              className="px-5 py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] text-sm font-medium rounded-lg transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs + add button row */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {filterLabels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                filter === key
                  ? 'bg-[#F97316] text-white border-[#F97316]'
                  : 'bg-transparent text-[#6B7280] border-[#E5E7EB] hover:bg-[#F9FAFB]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-[#6B7280]">총 {filteredPosts.length}개의 게시물</span>
          <button
            onClick={openNewForm}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            새 글 작성
          </button>
        </div>
      </div>

      {/* Board list */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3 text-[#9CA3AF]">
            <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <p className="text-sm">불러오는 중...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-[#9CA3AF]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 opacity-40">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <p className="text-sm">등록된 게시물이 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] w-12 text-center">번호</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] w-12 text-center">고정</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] w-24">분류</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#6B7280]">제목</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] w-24 whitespace-nowrap">작성일</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] w-16 text-center">조회</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] w-28">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post, idx) => (
                  <tr key={post.id || idx} className={`border-b border-[#F3F4F6] transition-colors ${post.pinned ? 'bg-[rgba(249,115,22,0.04)] hover:bg-[rgba(249,115,22,0.07)]' : 'hover:bg-[#FAFAFA]'}`}>
                    <td className="px-4 py-3 text-center text-xs text-[#6B7280]">{post._num}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleTogglePin(post)}
                        title={post.pinned ? '고정 해제' : '상단 고정'}
                        className={`w-7 h-7 flex items-center justify-center rounded-md border transition-colors mx-auto ${
                          post.pinned
                            ? 'bg-[#F97316] border-[#F97316] text-white'
                            : 'bg-[#F3F4F6] border-[#E5E7EB] text-[#9CA3AF] hover:border-[#F97316] hover:text-[#F97316]'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                        </svg>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge cat={post._cat || 'news'} />
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#111827] max-w-[300px] truncate">
                      {post.pinned && <span className="inline-block mr-1 text-[#F97316] font-black text-[10px] align-middle">[고정]</span>}
                      {post.title}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280] whitespace-nowrap">{post.date || ''}</td>
                    <td className="px-4 py-3 text-xs text-[#6B7280] text-center">{post.views || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openEditForm(post)}
                          className="px-2.5 py-1 text-xs font-medium text-[#374151] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-md transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
                          className="px-2.5 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminBoard() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AdminBoardInner />
      </ConfirmProvider>
    </ToastProvider>
  );
}
