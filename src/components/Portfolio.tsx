import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPortfolioList } from '../lib/api';

const MAIN_CATEGORIES = ['행사스케치', '아이디어 노트', '행사프로그램'];

const SUB_CATEGORIES = [
  '전체',
  '기념행사', '프로모션', 'Sports', 'VIP 행사',
  '국제행사', '컨퍼런스', '컨테스트', '공연 축제',
  '디자인', '시스템 협업', '인재협업'
];

interface PortfolioItem {
  id: number;
  category: string;
  subcategory?: string;
  title: string;
  thumbnail?: string;
  image?: string;
}

export default function Portfolio() {

  const searchParams = useSearchParams();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMain, setActiveMain] = useState<string>(
    searchParams.get('category') ?? MAIN_CATEGORIES[0]
  );
  const [activeSub, setActiveSub] = useState('전체');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 60, damping: 25 });

  useEffect(() => {
    getPortfolioList()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !trackRef.current || window.innerWidth < 768) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const trackWidth = trackRef.current.scrollWidth;
    const viewWidth = rect.width;
    
    if (trackWidth <= viewWidth) {
      x.set(0);
      return;
    }

    const mouseXRelative = (e.clientX - rect.left) / viewWidth;
    const maxScroll = trackWidth - viewWidth + 80;
    const targetX = -(maxScroll * mouseXRelative) + 40;
    
    const constrainedX = Math.min(0, Math.max(-maxScroll + 80, targetX));
    x.set(constrainedX);
  };

  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const filteredItems = items.filter(item => {
    if (item.category !== activeMain) return false;
    if (activeMain === '행사스케치' && activeSub !== '전체') {
      return item.subcategory === activeSub;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredItems.length / PER_PAGE);
  const pagedItems = filteredItems.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [activeMain, activeSub]);

  return (
    <div className="pt-24 pb-24 bg-white overflow-hidden">
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-20 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-[#F97316] font-bold text-sm tracking-widest uppercase mb-4"
            >
              Portfolio
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black text-zinc-900 leading-tight"
            >
              우리가 설계한 <br />
              <span className="inline-block py-1 text-zinc-900 italic uppercase">
                특별한 순간들
              </span>
            </motion.h2>
          </div>

          {/* Main Category Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {MAIN_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveMain(cat); setActiveSub('전체'); x.set(0); }}
                className={`px-10 py-4 rounded-full text-[13px] font-black tracking-widest transition-all duration-500 ${
                  activeMain === cat
                    ? 'bg-[#F97316] text-white shadow-2xl shadow-[#F97316]/20'
                    : 'bg-zinc-50 text-zinc-400 hover:bg-[#F97316]/10 hover:text-[#F97316]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Minimal Mouse-Follow Sub Category Track (행사스케치 전용) */}
          {activeMain === '행사스케치' && (
            <div 
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => x.set(0)}
              className="relative mb-20 group"
            >
              {/* Desktop: Mouse-Follow / Mobile: Drag */}
              <motion.div 
                ref={trackRef}
                style={{ x: springX }}
                drag="x"
                dragConstraints={containerRef}
                className="flex items-center gap-10 whitespace-nowrap min-w-max py-6"
              >
                {SUB_CATEGORIES.map((sub, idx) => {
                  const isActive = activeSub === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => setActiveSub(sub)}
                      className={`relative text-[11px] md:text-[13px] font-black tracking-[0.2em] uppercase transition-all duration-500 ${
                        isActive
                          ? 'text-[#F97316]'
                          : 'text-zinc-500 hover:text-[#F97316]/60'
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        {sub}
                        {isActive && (
                          <motion.span 
                            layoutId="sub-dot-minimal"
                            className="w-1 h-1 md:w-1.5 md:h-1.5 bg-[#F97316] rounded-full"
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
              
              <div className="hidden md:block absolute -top-10 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <span className="text-[9px] font-black tracking-[0.5em] text-zinc-300 uppercase italic">Slide to explore</span>
              </div>
            </div>
          )}

          {activeMain !== '행사스케치' && <div className="mb-16" />}

          {/* Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
            {loading ? (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/5] bg-zinc-200 rounded-2xl md:rounded-[1.5rem] mb-4 md:mb-5" />
                    <div className="space-y-2 text-center">
                      <div className="h-3 w-16 bg-zinc-200 rounded mx-auto" />
                      <div className="h-4 w-3/4 bg-zinc-200 rounded mx-auto" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
            <AnimatePresence mode="wait">
              {pagedItems.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-40 text-center"
                >
                  <div className="w-12 h-[1px] bg-zinc-100 mx-auto mb-6" />
                  <p className="text-sm font-black text-zinc-300 uppercase tracking-[0.3em]">No items in this category</p>
                </motion.div>
              ) : (
                pagedItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ 
                      delay: idx * 0.05, 
                      duration: 0.7, 
                      ease: [0.22, 1, 0.36, 1] 
                    }}
                    className="group"
                  >
                    <Link href={`/portfolio/${item.id}`} className="block">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl md:rounded-[1.5rem] mb-4 md:mb-5">
                        <img
                          src={item.image || item.thumbnail}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-1200 ease-out group-hover:scale-105"
                        />
                        {/* Full Size Overlay */}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                          <div className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500">
                             <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1 md:space-y-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-[1px] w-2 md:w-3 bg-zinc-100" />
                          <span className="text-[8px] md:text-[9px] font-black tracking-[0.2em] uppercase text-[#F97316]">
                            {item.subcategory || item.category}
                          </span>
                          <div className="h-[1px] w-2 md:w-3 bg-zinc-100" />
                        </div>
                        <h3 className="text-sm md:text-base font-black text-zinc-900 group-hover:text-[#F97316] transition-colors duration-500 leading-tight">
                          {item.title}
                        </h3>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-16">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:border-[#F97316] hover:text-[#F97316] transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${
                    n === page
                      ? 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20'
                      : 'border border-zinc-200 text-zinc-400 hover:border-[#F97316] hover:text-[#F97316]'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:border-[#F97316] hover:text-[#F97316] transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
