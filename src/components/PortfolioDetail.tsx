import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { getPortfolioItem } from '../lib/api';

interface Block {
  type: 'text' | 'image' | 'video';
  content?: string;
  url?: string;
  caption?: string;
}

function getVideoEmbedUrl(url: string): string {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return '';
}

interface PortfolioItem {
  id: string;
  category: string;
  title: string;
  thumbnail?: string;
  image?: string;
  client?: string;
  date?: string;
  description?: string;
  blocks?: Block[];
}

export default function PortfolioDetail({ id: propId }: { id?: string }) {
  const id = propId;
  const router = useRouter();
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!id) return;
    getPortfolioItem(id)
      .then((data: any) => {
        setItem(data as PortfolioItem | null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 bg-white min-h-screen animate-pulse">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          {/* Back link */}
          <div className="h-5 w-40 bg-zinc-200 rounded mb-12" />
          {/* Category badge */}
          <div className="h-5 w-24 bg-zinc-200 rounded mb-4" />
          {/* Title */}
          <div className="h-10 w-3/4 bg-zinc-200 rounded mb-3" />
          <div className="h-10 w-1/2 bg-zinc-200 rounded mb-6" />
          {/* Client / Date */}
          <div className="flex gap-6 mb-12">
            <div className="h-4 w-28 bg-zinc-200 rounded" />
            <div className="h-4 w-28 bg-zinc-200 rounded" />
          </div>
          {/* Thumbnail */}
          <div className="w-full aspect-video bg-zinc-200 rounded-3xl mb-16" />
          {/* Content blocks */}
          <div className="space-y-4">
            <div className="h-4 w-full bg-zinc-200 rounded" />
            <div className="h-4 w-5/6 bg-zinc-200 rounded" />
            <div className="h-4 w-4/6 bg-zinc-200 rounded" />
            <div className="h-4 w-full bg-zinc-200 rounded mt-6" />
            <div className="h-4 w-3/4 bg-zinc-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="pt-40 pb-24 text-center">
        <h2 className="text-2xl font-bold mb-4 text-zinc-900">포트폴리오를 찾을 수 없습니다.</h2>
        <button onClick={() => router.push('/portfolio')} className="text-[#F97316] font-bold">목록으로 돌아가기</button>
      </div>
    );
  }

  const hasBlocks = item.blocks && item.blocks.length > 0;

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <Link
          href={`/portfolio?category=${encodeURIComponent(item.category)}`}
          className="inline-flex items-center space-x-2 text-zinc-400 hover:text-[#F97316] font-bold mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>포트폴리오 목록으로 돌아가기</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <span className="inline-block px-3 py-1 bg-[#F97316]/10 text-[#F97316] rounded text-xs font-bold tracking-widest mb-4">
            {item.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-zinc-900 leading-tight mb-6">
            {item.title}
          </h1>
          {(item.client || item.date) && (
            <div className="flex flex-wrap gap-6 text-sm text-zinc-400">
              {item.client && <span><span className="font-bold text-zinc-500">Client</span> {item.client}</span>}
              {item.date && <span><span className="font-bold text-zinc-500">Date</span> {item.date}</span>}
            </div>
          )}
        </motion.div>

        {/* Thumbnail / Main Image */}
        {(item.thumbnail || item.image) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl overflow-hidden mb-16 shadow-2xl"
          >
            <img
              src={item.thumbnail || item.image}
              alt={item.title}
              className="w-full aspect-video object-cover"
            />
          </motion.div>
        )}

        {/* Blog-style Content Blocks */}
        {hasBlocks ? (
          <div className="space-y-8">
            {item.blocks!.map((block, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {block.type === 'text' && block.content && (
                  <div className="text-zinc-600 text-lg leading-relaxed prose prose-zinc max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.content) }} />
                )}
                {block.type === 'image' && (
                  <figure className="my-4">
                    <img
                      src={block.url}
                      alt={block.caption || ''}
                      className="w-full rounded-2xl shadow-md"
                    />
                    {block.caption && (
                      <figcaption className="mt-3 text-center text-sm text-zinc-400">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                )}
                {block.type === 'video' && block.url && (
                  <figure className="my-4">
                    {block.url.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video
                        src={block.url}
                        controls
                        className="w-full rounded-2xl shadow-md"
                      />
                    ) : getVideoEmbedUrl(block.url) ? (
                      <iframe
                        src={getVideoEmbedUrl(block.url)}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="w-full aspect-video rounded-2xl shadow-md border-0"
                      />
                    ) : null}
                    {block.caption && (
                      <figcaption className="mt-3 text-center text-sm text-zinc-400">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                )}
              </motion.div>
            ))}
          </div>
        ) : item.description ? (
          <div className="bg-zinc-50 p-10 md:p-16 rounded-[40px] border border-zinc-100">
            <h3 className="text-2xl font-black text-zinc-900 mb-8 flex items-center space-x-3">
              <span className="w-8 h-[2px] bg-[#F97316]" />
              <span>프로젝트 개요</span>
            </h3>
            <p className="text-zinc-600 text-lg md:text-xl font-medium leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </div>
        ) : null}

        {/* Back button */}
        <div className="flex justify-center mt-16">
          <Link
            href={`/portfolio?category=${encodeURIComponent(item.category)}`}
            className="px-10 py-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-full transition-all shadow-lg shadow-[#F97316]/20"
          >
            목록보기
          </Link>
        </div>
      </div>
    </div>
  );
}
