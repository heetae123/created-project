import React, { useState, Suspense, use } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { getSettings, getPortfolioList } from '../lib/api';
import { HighlightText } from '../lib/highlight';

interface LandingTexts {
  portfolioLabel?: string;
  portfolioTitle?: string;
  portfolioTitleSize?: number;
  portfolioColor?: string;
}

const layoutClasses = [
  "col-span-2 md:col-span-2 md:row-span-2",
  "",
  "",
  "",
  ""
];

interface GalleryItem {
  id?: number;
  url: string;
  title?: string;
}

// ── Skeleton ──────────────────────────────────────────────
function MainGallerySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {[...Array(5)].map((_, idx) => (
        <div
          key={idx}
          className={`rounded-lg md:rounded-[2rem] bg-zinc-800/60 animate-pulse ${
            idx === 0
              ? 'col-span-2 md:col-span-2 md:row-span-2 aspect-video md:aspect-square'
              : 'aspect-square'
          } ${layoutClasses[idx] || ''}`}
        />
      ))}
    </div>
  );
}

// ── Content (Suspense child) ───────────────────────────────
function GalleryGrid({ itemsPromise }: { itemsPromise: Promise<GalleryItem[]> }) {
  const items = use(itemsPromise);

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {items.map((item, idx) => {
        const inner = (
          <>
            <img
              src={item.url}
              alt={item.title || 'Gallery'}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            {item.title && (
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-white text-xs md:text-sm font-bold truncate">{item.title}</p>
              </div>
            )}
          </>
        );

        return (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              duration: 0.8,
              delay: idx * 0.1,
              ease: [0.21, 0.47, 0.32, 0.98]
            }}
            className={`rounded-lg md:rounded-[2rem] overflow-hidden group bg-zinc-900 relative ${idx === 0 ? 'aspect-video md:aspect-auto' : 'aspect-square md:aspect-auto'} ${layoutClasses[idx] || ''}`}
          >
            {item.id ? (
              <Link href={`/portfolio/${item.id}`} className="block w-full h-full">
                {inner}
              </Link>
            ) : (
              inner
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────
export default function MainGallery() {
  const [texts, setTexts] = useState<LandingTexts>({});

  React.useEffect(() => {
    getSettings('landing_texts')
      .then((data: LandingTexts | null) => { if (data) setTexts(data); })
      .catch(() => {});
  }, []);

  const [itemsPromise] = useState<Promise<GalleryItem[]>>(() =>
    getPortfolioList()
      .then((data: any[]) => {
        if (!Array.isArray(data) || data.length === 0) return [];
        return data
          .filter(p => p.category === '행사스케치' && (p.image || p.thumbnail))
          .sort((a: any, b: any) => (b.id || 0) - (a.id || 0))
          .slice(0, 5)
          .map((p: any) => ({ id: p.id, url: p.image || p.thumbnail, title: p.title }));
      })
      .catch(() => [])
  );

  return (
    <section className="py-32 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#F97316] text-xs font-black tracking-[0.4em] uppercase mb-4 block"
          >
            {texts.portfolioLabel ?? 'Portfolio'}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-white tracking-tight"
            style={{ fontSize: texts.portfolioTitleSize || 48 }}
          >
            <HighlightText text={texts.portfolioTitle ?? '생생한 현장의 "순간들"'} color={texts.portfolioColor || '#F97316'} />
          </motion.h2>
        </div>

        <Suspense fallback={<MainGallerySkeleton />}>
          <GalleryGrid itemsPromise={itemsPromise} />
        </Suspense>
      </div>
    </section>
  );
}
