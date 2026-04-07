import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { Search, PenTool, Layout, FileText, Star, Quote, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSettings } from '../lib/api';
import { HighlightText } from '../lib/highlight';

const processIcons = [Search, PenTool, Layout, FileText];
const processSteps = ["01", "02", "03", "04"];

interface ReviewItem {
  name: string;
  company: string;
  content: string;
}

interface LandingTexts {
  systemLabel?: string;
  systemTitle?: string;
  systemDesc?: string;
  systemTitleSize?: number;
  systemColor?: string;
  systemDescSize?: number;
  process1Title?: string;
  process1Desc?: string;
  process2Title?: string;
  process2Desc?: string;
  process3Title?: string;
  process3Desc?: string;
  process4Title?: string;
  process4Desc?: string;
  reviewsLabel?: string;
  reviewsTitle?: string;
  reviewsTitleSize?: number;
  reviewsColor?: string;
  reviews?: ReviewItem[];
}

const DEFAULT_TEXTS: LandingTexts = {
  systemLabel: 'System',
  systemTitle: '체계적인 행사 기획 "시스템"',
  systemDesc: '마이파트너스만의 검증된 프로세스로 오차 없는\n완벽한 행사를 완성합니다.',
  process1Title: '문의 및 상담',
  process1Desc: '행사 목적과 예산, 요구사항을 면밀히 분석합니다.',
  process2Title: '기획 및 제안',
  process2Desc: '창의적인 컨셉과 디테일한 실행 계획을 수립합니다.',
  process3Title: '현장 운영',
  process3Desc: '전문 인력과 시스템을 투입하여 완벽하게 통제합니다.',
  process4Title: '결과 보고',
  process4Desc: '행사 결과 분석 및 사후 관리 리포트를 제공합니다.',
  reviewsLabel: 'Reviews',
  reviewsTitle: '고객 "후기"',
  reviews: [
    { name: '김*민 담당자', company: '글로벌 테크 기업', content: '촉박한 일정 속에서도 완벽한 무대 연출과 매끄러운 진행을 보여주셨습니다. 다음 행사도 무조건 마이파트너스와 함께할 예정입니다.' },
    { name: '이*영 팀장', company: '공공기관', content: 'VIP 의전부터 안전 관리까지 어느 하나 빠지는 곳 없이 꼼꼼하게 챙겨주셔서 마음 편히 행사를 마칠 수 있었습니다.' },
    { name: '박*준 대표', company: '스타트업', content: '저희 브랜드의 아이덴티티를 정확히 이해하고, 기대 이상의 창의적인 기획을 제안해주셔서 참석자들의 반응이 폭발적이었습니다.' },
  ],
};

export default function HomeFeatures() {
  const [texts, setTexts] = useState<LandingTexts>(DEFAULT_TEXTS);
  const [slidesPerView, setSlidesPerView] = useState(3);

  useEffect(() => {
    getSettings('landing_texts')
      .then((data: LandingTexts | null) => { if (data) setTexts({ ...DEFAULT_TEXTS, ...data }); })
      .catch(() => {});

    const handleResize = () => {
      if (window.innerWidth < 768) setSlidesPerView(1);
      else if (window.innerWidth < 1024) setSlidesPerView(2);
      else setSlidesPerView(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const processes = [
    { icon: processIcons[0], step: processSteps[0], title: texts.process1Title ?? DEFAULT_TEXTS.process1Title!, desc: texts.process1Desc ?? DEFAULT_TEXTS.process1Desc! },
    { icon: processIcons[1], step: processSteps[1], title: texts.process2Title ?? DEFAULT_TEXTS.process2Title!, desc: texts.process2Desc ?? DEFAULT_TEXTS.process2Desc! },
    { icon: processIcons[2], step: processSteps[2], title: texts.process3Title ?? DEFAULT_TEXTS.process3Title!, desc: texts.process3Desc ?? DEFAULT_TEXTS.process3Desc! },
    { icon: processIcons[3], step: processSteps[3], title: texts.process4Title ?? DEFAULT_TEXTS.process4Title!, desc: texts.process4Desc ?? DEFAULT_TEXTS.process4Desc! },
  ];

  const reviewItems = texts.reviews && texts.reviews.length > 0 ? texts.reviews : DEFAULT_TEXTS.reviews!;
  const reviews = reviewItems.map(r => ({ ...r, avatar: r.name ? r.name[0] : '?' }));
  const useSlider = reviews.length > slidesPerView;
  const [slideIdx, setSlideIdx] = useState(0);
  const maxSlide = Math.max(0, reviews.length - slidesPerView);

  const nextSlide = useCallback(() => setSlideIdx(prev => prev >= maxSlide ? 0 : prev + 1), [maxSlide]);
  const prevSlide = useCallback(() => setSlideIdx(prev => prev <= 0 ? maxSlide : prev - 1), [maxSlide]);

  useEffect(() => {
    if (!useSlider) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [useSlider, nextSlide]);

  useEffect(() => {
    setSlideIdx(0);
  }, [slidesPerView]);

  return (
    <section className="bg-[#0f0f0f] py-40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* System Part */}
        <div className="mb-48">
          <div className="text-center mb-24">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#F97316] text-xs font-black tracking-[0.4em] uppercase block mb-6"
            >
              {texts.systemLabel ?? 'System'}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight"
              style={{ fontSize: texts.systemTitleSize || 48 }}
            >
              <HighlightText text={texts.systemTitle ?? '체계적인 행사 기획 "시스템"'} color={texts.systemColor || '#F97316'} />
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-zinc-500 text-base font-medium max-w-2xl mx-auto"
              style={{ fontSize: texts.systemDescSize || 16 }}
            >
              {(texts.systemDesc ?? DEFAULT_TEXTS.systemDesc!).split('\n').map((line, i) => (
                <React.Fragment key={i}>{line}{i === 0 && <br className="hidden md:block" />}</React.Fragment>
              ))}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {processes.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="bg-[#161616] p-12 rounded-[2.5rem] border border-white/5 group hover:bg-[#1a1a1a] hover:border-[#F97316]/20 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8">
                   <span className="text-5xl font-black text-zinc-800/20 group-hover:text-[#F97316]/10 transition-colors duration-500">{item.step}</span>
                </div>
                
                <div className="relative z-10">
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="w-16 h-16 flex items-center justify-center bg-zinc-900 rounded-2xl mb-12 group-hover:bg-[#F97316]/10 transition-colors duration-500"
                  >
                    <item.icon className="w-7 h-7 text-[#F97316]" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-white mb-4 group-hover:text-[#F97316] transition-colors duration-500 whitespace-pre-line">{item.title}</h3>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed group-hover:text-zinc-400 transition-colors duration-500 whitespace-pre-line">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <Link href="/about" className="group inline-flex items-center space-x-3 px-10 py-4 rounded-full border border-white/10 text-white text-sm font-bold hover:bg-white hover:text-black transition-all duration-500">
              <span>회사 소개 바로가기</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Reviews Part */}
        <div>
          <div className="text-center mb-24">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#F97316] text-xs font-black tracking-[0.4em] uppercase block mb-6"
            >
              {texts.reviewsLabel ?? 'Reviews'}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black text-white"
              style={{ fontSize: texts.reviewsTitleSize || 48 }}
            >
              <HighlightText text={texts.reviewsTitle ?? '고객 "후기"'} color={texts.reviewsColor || '#F97316'} />
            </motion.h2>
          </div>

          {useSlider ? (
            <div className="relative">
              <div className="overflow-hidden">
                <motion.div
                  className="flex gap-10"
                  animate={{ x: `calc(-${slideIdx} * (100% + 40px) / ${slidesPerView})` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                >
                  {reviews.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#161616] p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/5 relative group hover:border-white/10 transition-all duration-500 shrink-0"
                      style={{ width: `calc((100% - ${(slidesPerView - 1) * 40}px) / ${slidesPerView})` }}
                    >
                      <Quote className="absolute top-6 right-6 md:top-10 md:right-10 w-8 h-8 md:w-12 md:h-12 text-zinc-800/30 group-hover:text-[#F97316]/10 transition-colors duration-500" />
                      <div className="flex space-x-1 mb-8 md:mb-10">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-[#F97316] text-[#F97316]" />
                        ))}
                      </div>
                      <p className="text-zinc-300 text-base md:text-xl font-medium leading-relaxed mb-10 md:mb-12 relative z-10 group-hover:text-white transition-colors duration-500 whitespace-pre-line">
                        "{item.content}"
                      </p>
                      <div className="flex items-center space-x-4 md:space-x-5">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-zinc-900 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-[#F97316] text-lg md:text-xl border border-white/5 group-hover:border-[#F97316]/20 transition-all">
                          {item.avatar}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm md:text-base group-hover:text-[#F97316] transition-colors">{item.name}</h4>
                          <p className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">{item.company}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
              {/* Slider controls */}
              <div className="flex items-center justify-center gap-6 mt-12">
                <button onClick={prevSlide} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white hover:border-[#F97316] transition-all">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlideIdx(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === slideIdx ? 'bg-[#F97316] scale-150' : 'bg-zinc-700 hover:bg-zinc-500'}`}
                    />
                  ))}
                </div>
                <button onClick={nextSlide} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white hover:border-[#F97316] transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {reviews.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#161616] p-12 rounded-[3rem] border border-white/5 relative group hover:border-white/10 transition-all duration-500"
                >
                  <Quote className="absolute top-10 right-10 w-12 h-12 text-zinc-800/30 group-hover:text-[#F97316]/10 transition-colors duration-500" />
                  <div className="flex space-x-1 mb-10">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#F97316] text-[#F97316]" />
                    ))}
                  </div>
                  <p className="text-zinc-300 text-lg md:text-xl font-medium leading-relaxed mb-12 relative z-10 group-hover:text-white transition-colors duration-500">
                    "{item.content}"
                  </p>
                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center font-black text-[#F97316] text-xl border border-white/5 group-hover:border-[#F97316]/20 transition-all">
                      {item.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-[#F97316] transition-colors">{item.name}</h4>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">{item.company}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
