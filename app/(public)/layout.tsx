'use client';
import { useEffect } from 'react';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import KakaoFloatingButton from '@/src/components/KakaoFloatingButton';
import { ToastProvider } from '@/src/components/Admin/shared/Toast';
import { ConfirmProvider } from '@/src/components/Admin/shared/ConfirmModal';
import { getSettings } from '@/src/lib/api';

function SeoManager() {
  useEffect(() => {
    getSettings('seo')
      .then(seo => {
        if (!seo) return;
        // description·keywords만 런타임 업데이트 (전역 공통값)
        // og:title·og:description·og:image·title은 각 페이지 generateMetadata에서 처리
        const setMeta = (name: string, content: string) => {
          if (!content) return;
          let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
          if (!el) {
            el = document.createElement('meta');
            el.setAttribute('name', name);
            document.head.appendChild(el);
          }
          el.setAttribute('content', content);
        };
        setMeta('description', seo.description);
        setMeta('keywords', seo.keywords);
      })
      .catch(() => {});
  }, []);
  return null;
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans flex flex-col">
          <SeoManager />
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <KakaoFloatingButton />
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
