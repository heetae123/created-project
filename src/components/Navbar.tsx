import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'ABOUT', path: '/about' },
    { name: 'SERVICE', path: '/service' },
    { name: 'PORTFOLIO', path: '/portfolio' },
    { name: 'BOARD', path: '/board' },
  ];

  const isHome = pathname === '/';
  const isAbout = pathname === '/about';
  const isMosaic = ['/service', '/portfolio', '/board'].some(p => pathname.startsWith(p));
  
  // Theme selection: white-bg pages get light navbar
  const isLight = (isAbout || isMosaic) && !isScrolled;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled || isMosaic || !isHome
          ? isLight 
            ? 'py-3 bg-white/80 backdrop-blur-xl border-b border-zinc-100 shadow-sm'
            : 'py-3 bg-black/60 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/20' 
          : 'py-4 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <Link href="/" className="flex items-center group">
          <Logo 
            color={isLight ? "#18181b" : "#F97316"} 
            className="h-8 md:h-9 transition-transform duration-500 group-hover:scale-105" 
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={`relative text-[12px] font-bold tracking-[0.2em] transition-colors group py-1 ${
                pathname === link.path 
                  ? 'text-[#F97316]' 
                  : isLight 
                    ? 'text-zinc-500 hover:text-zinc-900' 
                    : 'text-zinc-400 hover:text-white'
              }`}
            >
              {link.name}
              <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-[#F97316] transform origin-left transition-transform duration-300 ${
                pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`} />
            </Link>
          ))}
          <Link
            href="/contact"
            className={`px-6 py-2 text-[12px] font-black rounded-full transition-all duration-300 shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
              isLight
                ? 'bg-zinc-900 text-white hover:bg-black shadow-zinc-900/10 hover:shadow-zinc-900/30'
                : 'bg-[#F97316] hover:bg-[#EA580C] text-white shadow-[#F97316]/20 hover:shadow-[#F97316]/40'
            }`}
          >
            견적 문의
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`md:hidden p-2 transition-colors ${
            isLight ? 'text-zinc-900 hover:text-black' : 'text-zinc-300 hover:text-white'
          }`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className={`md:hidden absolute top-full left-0 w-full backdrop-blur-2xl border-b overflow-hidden ${
              isLight 
                ? 'bg-white/95 border-zinc-100' 
                : 'bg-black/95 border-white/10'
            }`}
          >
            <div className="py-12 px-8 flex flex-col space-y-8">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href={link.path}
                    className={`text-2xl font-black tracking-[0.1em] transition-colors ${
                      pathname === link.path 
                        ? 'text-[#F97316]' 
                        : isLight ? 'text-zinc-500' : 'text-zinc-400'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pt-4"
              >
                <Link
                  href="/contact"
                  className={`w-full inline-block text-center py-5 font-black text-lg rounded-2xl shadow-xl ${
                    isLight
                      ? 'bg-zinc-900 text-white shadow-zinc-900/10'
                      : 'bg-[#F97316] text-white shadow-[#F97316]/20'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  견적 문의하기
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
