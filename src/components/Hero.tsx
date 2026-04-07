import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getSettings } from '../lib/api';


export default function Hero() {
  const [heroSettings, setHeroSettings] = useState({
    videoUrl: '',
    images: [] as { url: string; alt: string }[]
  });
  const [heroText, setHeroText] = useState({
    badge: 'BEYOND EXPECTATIONS',
    title1: '최고의 순간을',
    title2: '기획합니다',
    subtitle: '당신의 비전이 현실이 되는 무대. 압도적인 스케일과 디테일로\n관객의 마음을 사로잡는 완벽한 경험을 선사합니다.',
    ctaText: '견적 문의하기',
    posX: 50,
    posY: 50,
    titleSize: 80,
    subtitleSize: 18,
    titleColor: '#FFFFFF',
    highlightColor: '#F97316',
    subtitleColor: '#A1A1AA',
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    getSettings('hero')
      .then(data => {
        if (!data) return;
        if (data.images) {
          setHeroSettings(data);
        } else {
          const images: { url: string; alt: string }[] = [];
          if (data.slides && data.slides.length > 0) {
            images.push(...data.slides);
          } else if (data.imageUrl) {
            images.push({ url: data.imageUrl, alt: 'Hero' });
          }
          setHeroSettings({ videoUrl: data.videoUrl || '', images });
        }
      })
      .catch(() => {});
    getSettings('hero_text')
      .then(data => {
        if (data) setHeroText(prev => ({ ...prev, ...data }));
      })
      .catch(() => {});
  }, []);

  const hasVideo = !!heroSettings.videoUrl;
  const isYouTube = hasVideo && /(?:youtube\.com|youtu\.be)/.test(heroSettings.videoUrl);
  const youtubeVideoId = isYouTube
    ? (heroSettings.videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/) || [])[1] || null
    : null;
  const youtubeEmbedUrl = youtubeVideoId
    ? `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${youtubeVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`
    : '';
  const imageCount = heroSettings.images.length;
  const isSlideshow = !hasVideo && imageCount > 1;
  const currentImageUrl = imageCount > 0 ? heroSettings.images[currentSlide]?.url : '';

  useEffect(() => {
    if (isSlideshow) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % imageCount);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isSlideshow, imageCount]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  } as any;
  return (
    <section ref={containerRef} className="relative h-[100svh] w-full flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Background with Parallax */}
      <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
        {hasVideo ? (
          isYouTube ? (
            <iframe
              src={youtubeEmbedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full object-cover opacity-40 scale-110 pointer-events-none"
              style={{ position: 'absolute', top: '50%', left: '50%', width: '120%', height: '120%', transform: 'translate(-50%, -50%)', border: 'none' }}
            />
          ) : (
            <video
              src={heroSettings.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover opacity-40 scale-110"
            />
          )
        ) : isSlideshow ? (
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={heroSettings.images[currentSlide]?.url}
              alt={heroSettings.images[currentSlide]?.alt || 'Slide'}
              initial={{ opacity: 0, scale: 1.15 }}
              animate={{ opacity: 0.4, scale: 1.1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-full h-full object-cover absolute inset-0"
            />
          </AnimatePresence>
        ) : currentImageUrl ? (
          <img
            src={currentImageUrl}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-40 scale-110"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/80" />
      </motion.div>

      <div
        className="absolute z-10 w-full px-6 md:px-12"
        style={{
          left: `${heroText.posX}%`,
          top: `${heroText.posY}%`,
          transform: 'translate(-50%, -50%)',
          maxWidth: '80rem',
          textAlign: heroText.posX < 35 ? 'left' : heroText.posX > 65 ? 'right' : 'center',
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ opacity }}
          className="space-y-10"
        >
          <motion.div variants={itemVariants} className="inline-block px-5 py-1.5 rounded-full border border-[#F97316]/30 bg-[#F97316]/10 backdrop-blur-md">
            <span className="text-[#F97316] text-[10px] md:text-xs font-black tracking-[0.3em] uppercase">{heroText.badge}</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl font-black leading-[1.05] tracking-tight"
            style={{ fontSize: heroText.titleSize ? `${heroText.titleSize}px` : undefined, color: heroText.titleColor || '#FFFFFF' }}
          >
            {heroText.title1} <br />
            <span style={{ color: heroText.highlightColor || '#F97316' }}>{heroText.title2}</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className={`max-w-2xl ${heroText.posX > 65 ? 'ml-auto' : heroText.posX < 35 ? '' : 'mx-auto'} font-medium leading-relaxed whitespace-pre-line`}
            style={{ fontSize: heroText.subtitleSize ? `${heroText.subtitleSize}px` : undefined, color: heroText.subtitleColor || '#A1A1AA' }}
          >
            {heroText.subtitle}
          </motion.p>

          <motion.div variants={itemVariants} className="pt-6">
            <Link
              href="/contact"
              className="group inline-flex items-center space-x-4 px-10 py-5 bg-white text-black font-black rounded-full hover:bg-zinc-200 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-white/10"
            >
              <span>{heroText.ctaText}</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator & Slide Dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-6">
        {isSlideshow && (
          <div className="flex space-x-3 mb-2">
            {heroSettings.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'bg-[#F97316] scale-150' : 'bg-zinc-600 hover:bg-zinc-400'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <span className="text-zinc-600 text-[10px] font-black tracking-[0.4em] uppercase">Scroll</span>
          <div className="w-[1px] h-20 bg-zinc-800 relative overflow-hidden rounded-full">
            <motion.div
              animate={{ y: [-80, 80] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-[#F97316] to-transparent"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
