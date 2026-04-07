import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { useParams } from 'react-router-dom';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, User, Calendar, Eye, Trash2, X } from 'lucide-react';
import { getBoardPost, deleteBoardPost } from '../lib/api';

// Allow YouTube/Vimeo iframes and set links to open in new tab — registered once at module load
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
    return;
  }
  if (node.tagName !== 'IFRAME') return;
  const src = node.getAttribute('src') || '';
  if (
    !src.startsWith('https://www.youtube.com/embed/') &&
    !src.startsWith('https://player.vimeo.com/video/')
  ) {
    node.parentNode?.removeChild(node);
  }
});

const SANITIZE_CONFIG = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allowfullscreen', 'frameborder', 'allow', 'referrerpolicy', 'src', 'class', 'width', 'height', 'style', 'target', 'rel'],
};

interface TextBlock {
  type: 'text';
  html: string;
}

interface ImagesBlock {
  type: 'images';
  urls: string[];
  caption: string;
}

interface VideoBlock {
  type: 'video';
  url: string;
  caption: string;
}

type Block = TextBlock | ImagesBlock | VideoBlock;

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  // live/ 패턴 추가
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

const IFRAME_TEMPLATE = (src: string) =>
  `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0;">` +
  `<iframe src="${src}" style="position:absolute;top:0;left:0;width:100%;height:100%;" ` +
  `frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ` +
  `referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;

// YouTube/Vimeo URL → iframe 변환 (텍스트로 저장된 URL 포함)
function convertVideoUrlsToIframes(html: string): string {
  if (!html) return html;

  // 1) 이미 <a href="...embed..."> 형태로 링크된 경우
  let result = html.replace(
    /<a[^>]*href=["'](https?:\/\/(?:www\.youtube\.com\/embed\/|player\.vimeo\.com\/video\/)[^"']+)["'][^>]*>.*?<\/a>/gi,
    (_match, url) => IFRAME_TEMPLATE(url.trim()),
  );

  // 2) 텍스트로 적혀 있는 embed URL
  result = result.replace(
    /(?<!['"=])(https?:\/\/(?:www\.youtube\.com\/embed\/|player\.vimeo\.com\/video\/)[^\s<"']+)/g,
    (_match, url) => IFRAME_TEMPLATE(url.trim()),
  );

  // 3) 일반 YouTube URL (watch?v=, youtu.be/, shorts/, live/)
  result = result.replace(
    /(?<!['"=])(https?:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|shorts\/|live\/)|https?:\/\/youtu\.be\/)([a-zA-Z0-9_-]{11})[^\s<"']*/g,
    (_match, _prefix, videoId) => IFRAME_TEMPLATE(`https://www.youtube.com/embed/${videoId}`),
  );

  return result;
}

interface Post {
  id: number;
  title: string;
  author: string;
  date: string;
  views: number;
  isNotice: boolean;
  category?: string;
  content: string;
  blocks?: Block[];
  password?: string;
  thumbnail?: string;
}

// ── Lightbox ─────────────────────────────────────────────

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
      >
        <X size={20} />
      </button>
      <img
        src={src}
        alt="확대 이미지"
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
        onClick={e => e.stopPropagation()}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

// ── Block Renderer ────────────────────────────────────────

function BlocksRenderer({ blocks }: { blocks: Block[] }) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === 'text') {
          const html = block.html?.trim();
          if (!html || html === '<p><br></p>') return null;
          return (
            <div
              key={index}
              className="text-zinc-700 leading-relaxed text-lg prose prose-zinc max-w-none mb-6 ql-rendered"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(convertVideoUrlsToIframes(html), SANITIZE_CONFIG),
              }}
            />
          );
        }

        if (block.type === 'video' && (block as VideoBlock).url) {
          const embed = getEmbedUrl((block as VideoBlock).url);
          if (!embed) return null;
          return (
            <div key={index} className="mb-6">
              <div className="aspect-video rounded-xl overflow-hidden border border-zinc-100 shadow-sm">
                <iframe
                  src={embed}
                  className="w-full h-full"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              {(block as VideoBlock).caption && (
                <p className="mt-2 text-sm text-zinc-400 text-center">{(block as VideoBlock).caption}</p>
              )}
            </div>
          );
        }

        if (block.type === 'images' && block.urls?.length > 0) {
          return (
            <div key={index} className="mb-6">
              <div className="flex flex-wrap gap-3">
                {block.urls.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxSrc(url)}
                    className="flex-shrink-0 rounded-xl overflow-hidden border border-zinc-100 hover:ring-2 hover:ring-[#F97316]/50 transition-all focus:outline-none focus:ring-2 focus:ring-[#F97316]/50"
                  >
                    <img
                      src={url}
                      alt={block.caption || `이미지 ${i + 1}`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-auto object-contain"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </button>
                ))}
              </div>
              {block.caption && (
                <p className="mt-2 text-sm text-zinc-400 text-center">{block.caption}</p>
              )}
            </div>
          );
        }

        return null;
      })}

      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </>
  );
}

// ── Main Component ────────────────────────────────────────

export default function BoardDetail({ id: propId }: { id?: string }) {
  const routerParams = useParams();
  const id = propId || routerParams.id;
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isAdmin = localStorage.getItem('isAdmin') === 'true';


  useEffect(() => {
    getBoardPost(String(id))
      .then(data => { if (data) setPost(data as Post); else setPost(null); })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleteError('');
    setDeleting(true);
    try {
      await deleteBoardPost(String(id));
      router.push('/board');
    } catch {
      setDeleteError('삭제에 실패했습니다.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-40 pb-24 bg-white min-h-screen text-center">
        <div className="text-zinc-400">불러오는 중...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-40 pb-24 bg-white min-h-screen text-center">
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">게시물을 찾을 수 없습니다.</h2>
        <button onClick={() => router.push('/board')} className="text-[#F97316] font-bold">목록으로 돌아가기</button>
      </div>
    );
  }

  const postCategory = post.category || (post.isNotice ? 'notice' : 'news');
  const isCertificate = postCategory === 'certificate';

  // Determine whether to use blocks or legacy content
  const hasBlocks = Array.isArray(post.blocks) && post.blocks.length > 0;

  // ── Delete modal ──
  const deleteModal = showDeleteModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-zinc-200 rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl">
        <h3 className="text-lg font-bold text-zinc-900 mb-2">게시물 삭제</h3>
        <p className="text-zinc-500 text-sm mb-6">이 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
        {deleteError && <p className="text-red-500 text-sm mb-4">{deleteError}</p>}
        <div className="flex gap-3">
          <button
            onClick={() => { setShowDeleteModal(false); setDeleteError(''); }}
            className="flex-1 px-4 py-3 bg-zinc-100 text-zinc-600 rounded-lg font-bold hover:bg-zinc-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );

  const badgeClass = isCertificate
    ? 'bg-emerald-50 text-emerald-600'
    : postCategory === 'notice'
      ? 'bg-[#F97316]/10 text-[#F97316]'
      : 'bg-blue-50 text-blue-500';
  const badgeLabel = isCertificate ? 'CERTIFICATE' : postCategory === 'notice' ? 'NOTICE' : 'NEWS';

  return (
    <section className="pt-32 pb-24 md:pt-40 md:pb-32 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/board')}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">목록으로 돌아가기</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm"
        >
          {/* Post Header */}
          <div className="p-8 md:p-12 border-b border-zinc-100">
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${badgeClass}`}>
              {badgeLabel}
            </span>
            <h1 className="text-2xl md:text-4xl font-bold text-zinc-900 mb-8 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap gap-6 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <User size={16} className="text-[#F97316]" />
                {post.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#F97316]" />
                {post.date}
              </div>
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-[#F97316]" />
                조회 {post.views}
              </div>
            </div>
          </div>

          {/* Thumbnail */}
          {post.thumbnail && (
            <div className="px-8 md:px-12 pt-8">
              <img
                src={post.thumbnail}
                alt={post.title}
                loading="lazy"
                className="w-full object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Post Content: blocks or legacy HTML */}
          <div className="p-8 md:p-12">
            {hasBlocks ? (
              <BlocksRenderer blocks={post.blocks!} />
            ) : (
              <div
                className="text-zinc-700 leading-relaxed text-lg prose prose-zinc max-w-none ql-rendered"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(convertVideoUrlsToIframes(post.content), SANITIZE_CONFIG),
                }}
              />
            )}
          </div>
        </motion.div>

        {/* Bottom Buttons */}
        <div className="flex justify-center gap-4 mt-12">
          <button
            onClick={() => router.push('/board')}
            className="px-10 py-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-full transition-all shadow-lg shadow-[#F97316]/20"
          >
            목록보기
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-8 py-4 bg-zinc-100 hover:bg-red-600 text-zinc-500 hover:text-white font-bold rounded-full transition-all flex items-center gap-2"
            >
              <Trash2 size={16} />
              삭제
            </button>
          )}
        </div>
      </div>

      {deleteModal}
    </section>
  );
}
