import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { getSettings } from './lib/api';
import { useSEO } from './hooks/useSEO';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Service from './components/Service';
import ServiceDetail from './components/ServiceDetail';
import Portfolio from './components/Portfolio';
import PortfolioDetail from './components/PortfolioDetail';
import Board from './components/Board';
import BoardDetail from './components/BoardDetail';
import BoardWrite from './components/BoardWrite';
import ContactForm from './components/ContactForm';
import Team from './components/Team';
import TeamInterview from './components/TeamInterview';
import Footer from './components/Footer';
import Greeting from './components/Greeting';
import { ToastProvider } from './components/Admin/shared/Toast';
import { ConfirmProvider } from './components/Admin/shared/ConfirmModal';

function NotFound() {
  useSEO({
    title: '페이지를 찾을 수 없습니다',
    description: '요청하신 페이지를 찾을 수 없습니다.',
    noindex: true,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-zinc-900">
      <h1 className="text-8xl font-black text-[#F97316] mb-4">404</h1>
      <p className="text-2xl font-bold mb-8">페이지를 찾을 수 없습니다</p>
      <a href="/" className="px-8 py-3 bg-[#F97316] text-white font-bold rounded-full hover:bg-[#EA580C] transition-colors">
        홈으로 돌아가기
      </a>
    </div>
  );
}

const AdminLogin = lazy(() => import('./components/Admin/AdminLogin'));
const AdminLayout = lazy(() => import('./components/Admin/AdminLayout'));
const AdminDashboardNew = lazy(() => import('./components/Admin/AdminDashboard'));
const AdminHero = lazy(() => import('./components/Admin/AdminHero'));
const AdminPortfolio = lazy(() => import('./components/Admin/AdminPortfolio'));
const AdminServiceImages = lazy(() => import('./components/Admin/AdminServiceImages'));
const AdminBoard = lazy(() => import('./components/Admin/AdminBoard'));
const AdminTeam = lazy(() => import('./components/Admin/AdminTeam'));
const AdminServiceTexts = lazy(() => import('./components/Admin/AdminServiceTexts'));
const AdminGreeting = lazy(() => import('./components/Admin/AdminGreeting'));
const AdminEmail = lazy(() => import('./components/Admin/AdminEmail'));
const AdminSeo = lazy(() => import('./components/Admin/AdminSeo'));
const AdminKakao = lazy(() => import('./components/Admin/AdminKakao'));
const AdminMap = lazy(() => import('./components/Admin/AdminMap'));
const AdminInquiries = lazy(() => import('./components/Admin/AdminInquiries'));
const AdminLandingTexts = lazy(() => import('./components/Admin/AdminLandingTexts'));
const AdminPassword = lazy(() => import('./components/Admin/AdminPassword'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

function KakaoFloatingButton() {
  const [kakao, setKakao] = useState<{ chatUrl: string; buttonText: string; floatingEnabled: boolean } | null>(null);

  useEffect(() => {
    getSettings('kakao')
      .then(data => { if (data) setKakao(data); })
      .catch(() => {});
  }, []);

  if (!kakao || !kakao.floatingEnabled) return null;

  const btn = (
    <div
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#F97316] rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer"
      title={kakao.buttonText || '카카오톡 채널 가기'}
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#fff">
        <path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67-.15.53-.96 3.4-.99 3.62 0 0-.02.17.09.24.11.06.24.01.24.01.32-.04 3.7-2.42 4.28-2.83.55.08 1.13.13 1.72.13 5.52 0 10-3.58 10-7.94S17.52 3 12 3z"/>
      </svg>
    </div>
  );

  if (kakao.chatUrl) {
    return (
      <a href={kakao.chatUrl} target="_blank" rel="noopener noreferrer">
        {btn}
      </a>
    );
  }

  return btn;
}

function SeoManager() {
  useEffect(() => {
    getSettings('seo')
      .then(seo => {
        if (!seo) return;
        if (seo.title) document.title = seo.title;
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
        const setOgMeta = (property: string, content: string) => {
          if (!content) return;
          let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
          if (!el) {
            el = document.createElement('meta');
            el.setAttribute('property', property);
            document.head.appendChild(el);
          }
          el.setAttribute('content', content);
        };
        setMeta('description', seo.description);
        setMeta('keywords', seo.keywords);
        setOgMeta('og:title', seo.ogTitle);
        setOgMeta('og:description', seo.ogDescription);
        setOgMeta('og:image', seo.ogImage);
      })
      .catch(() => {});
  }, []);
  return null;
}

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <ConfirmProvider>
          <ScrollToTop />
          <SeoManager />
          <Routes>
            {/* Admin routes - outside public layout */}
            <Route
              path="/admin"
              element={
                <Suspense fallback={null}>
                  <AdminLogin />
                </Suspense>
              }
            />
            <Route
              path="/admin/*"
              element={
                <Suspense fallback={<div className="fixed inset-0 bg-[#F9FAFB]" />}>
                  <AdminLayout />
                </Suspense>
              }
            >
              <Route path="dashboard" element={<Suspense fallback={null}><AdminDashboardNew /></Suspense>} />
              <Route path="hero" element={<Suspense fallback={null}><AdminHero /></Suspense>} />
              <Route path="portfolio" element={<Suspense fallback={null}><AdminPortfolio /></Suspense>} />
              <Route path="service-images" element={<Suspense fallback={null}><AdminServiceImages /></Suspense>} />
              <Route path="board" element={<Suspense fallback={null}><AdminBoard /></Suspense>} />
              <Route path="team" element={<Suspense fallback={null}><AdminTeam /></Suspense>} />
              <Route path="service-texts" element={<Suspense fallback={null}><AdminServiceTexts /></Suspense>} />
              <Route path="greeting" element={<Suspense fallback={null}><AdminGreeting /></Suspense>} />
              <Route path="email" element={<Suspense fallback={null}><AdminEmail /></Suspense>} />
              <Route path="seo" element={<Suspense fallback={null}><AdminSeo /></Suspense>} />
              <Route path="kakao" element={<Suspense fallback={null}><AdminKakao /></Suspense>} />
              <Route path="map" element={<Suspense fallback={null}><AdminMap /></Suspense>} />
              <Route path="inquiries" element={<Suspense fallback={null}><AdminInquiries /></Suspense>} />
              <Route path="landing-texts" element={<Suspense fallback={null}><AdminLandingTexts /></Suspense>} />
              <Route path="password" element={<Suspense fallback={null}><AdminPassword /></Suspense>} />
            </Route>

            {/* Public routes */}
            <Route
              path="/*"
              element={
                <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-orange-500/30 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/greeting" element={<Greeting />} />
                      <Route path="/service" element={<Service />} />
                      <Route path="/service/:id" element={<ServiceDetail />} />
                      <Route path="/portfolio" element={<Portfolio />} />
                      <Route path="/portfolio/:id" element={<PortfolioDetail />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/team/interview/:teamId" element={<TeamInterview />} />
                      <Route path="/board" element={<Board />} />
                      <Route path="/board/write" element={<BoardWrite />} />
                      <Route path="/board/:id" element={<BoardDetail />} />
                      <Route path="/contact" element={<ContactForm />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                  <KakaoFloatingButton />
                </div>
              }
            />
          </Routes>
        </ConfirmProvider>
      </ToastProvider>
    </Router>
  );
}
