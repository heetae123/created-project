import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Hero from './Hero';
import MainGallery from './MainGallery';
import HomeFeatures from './HomeFeatures';
import NewsNotice from './NewsNotice';
import ContactForm from './ContactForm';
export default function Home() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [pathname]);

  return (
    <div className="relative">
      <Hero />
      <MainGallery />
      <HomeFeatures />
      <NewsNotice />
      <ContactForm />
    </div>
  );
}
