import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { getLatestPosts, getSettings } from '../lib/api';
import { HighlightText } from '../lib/highlight';

interface NewsItem {
  id: number;
  category: string;
  title: string;
  date: string;
}

interface LandingTexts {
  newsLabel?: string;
  newsTitle?: string;
  newsTitleSize?: number;
  newsColor?: string;
}

export default function NewsNotice() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [texts, setTexts] = useState<LandingTexts>({});

  useEffect(() => {
    getSettings('landing_texts')
      .then((data: LandingTexts | null) => { if (data) setTexts(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getLatestPosts(4)
      .then(data => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-40 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col items-center gap-8 mb-24">
          <div className="space-y-4 text-center">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#F97316] text-xs font-black tracking-[0.5em] uppercase block"
            >
              {texts.newsLabel ?? 'Latest Updates'}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black text-white tracking-tight"
              style={{ fontSize: texts.newsTitleSize || 48 }}
            >
              <HighlightText text={texts.newsTitle ?? '새로운 "소식"'} color={texts.newsColor || '#F97316'} />
            </motion.h2>
          </div>
          <Link href="/board" className="group flex items-center space-x-3 px-6 py-3 rounded-full bg-zinc-900 border border-white/5 text-zinc-400 text-xs font-black tracking-widest hover:bg-white hover:text-black transition-all duration-500 uppercase">
            <span>View All Board</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="space-y-0 border-t border-white/5">
          {loading ? (
            <div className="py-20 text-center text-zinc-600 text-sm">불러오는 중...</div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center text-zinc-600 text-sm">등록된 게시물이 없습니다.</div>
          ) : (
            items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <Link href={`/board/${item.id}`} className="flex flex-col md:flex-row md:items-center py-10 border-b border-white/5 group relative overflow-hidden px-4 -mx-4 hover:bg-white/[0.02] transition-colors duration-500">
                  <div className="md:w-40 mb-4 md:mb-0">
                    <span className={`text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-full border ${
                      item.category === 'notice'
                        ? 'border-[#F97316]/30 text-[#F97316] bg-[#F97316]/5'
                        : item.category === 'certificate'
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                          : 'border-zinc-800 text-zinc-500 bg-zinc-900'
                    }`}>
                      {item.category === 'notice' ? 'NOTICE' : item.category === 'certificate' ? 'CERTIFICATE' : 'NEWS'}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl md:text-2xl font-bold text-zinc-400 group-hover:text-white transition-colors duration-500 leading-tight">
                      {item.title}
                    </h3>
                  </div>
                  <div className="md:w-40 text-left md:text-right mt-4 md:mt-0 flex items-center md:justify-end gap-4">
                    <span className="text-zinc-700 text-sm font-bold tracking-tighter group-hover:text-zinc-500 transition-colors">{item.date}</span>
                    <Plus className="hidden md:block w-5 h-5 text-zinc-800 group-hover:text-[#F97316] group-hover:rotate-90 transition-all duration-500" />
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
