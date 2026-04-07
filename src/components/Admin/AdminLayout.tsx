import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function updateClock(): string {
  return new Date().toLocaleString('ko-KR', {
    month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit',
  });
}

interface NavItem {
  target: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavFolder {
  label: string;
  items: NavItem[];
}

const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconHero = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 15 3-3 2 2 3-3"/>
  </svg>
);
const IconPortfolio = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
    <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><path d="M16 3v4M8 3v4"/>
  </svg>
);
const IconImage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
);
const IconBoard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconTeam = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconText = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
    <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
  </svg>
);
const IconGreeting = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconInquiry = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.9 3.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconSeo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconKakao = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/>
  </svg>
);
const IconMap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconEmail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconPassword = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px] transition-transform duration-200">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const TOP_ITEMS: NavItem[] = [
  { target: 'dashboard', label: '대시보드', path: '/admin/dashboard', icon: <IconDashboard /> },
  { target: 'inquiries', label: '고객 문의', path: '/admin/inquiries', icon: <IconInquiry /> },
];

const CONTENT_FOLDER: NavFolder = {
  label: '콘텐츠 관리',
  items: [
    { target: 'hero', label: '히어로 관리', path: '/admin/hero', icon: <IconHero /> },
    { target: 'portfolio', label: '포트폴리오 관리', path: '/admin/portfolio', icon: <IconPortfolio /> },
    { target: 'service-images', label: '서비스 이미지 관리', path: '/admin/service-images', icon: <IconImage /> },
    { target: 'board', label: '게시판 관리', path: '/admin/board', icon: <IconBoard /> },
    { target: 'team', label: '전문가 관리', path: '/admin/team', icon: <IconTeam /> },
    { target: 'service-texts', label: '서비스 텍스트 관리', path: '/admin/service-texts', icon: <IconText /> },
    { target: 'greeting', label: '인사말 관리', path: '/admin/greeting', icon: <IconGreeting /> },
    { target: 'landing-texts', label: '랜딩 텍스트 관리', path: '/admin/landing-texts', icon: <IconText /> },
  ],
};

const SETTINGS_FOLDER: NavFolder = {
  label: '설정',
  items: [
    { target: 'seo', label: 'SEO 설정', path: '/admin/seo', icon: <IconSeo /> },
    { target: 'kakao', label: '카카오톡 설정', path: '/admin/kakao', icon: <IconKakao /> },
    { target: 'map', label: '오시는 길 설정', path: '/admin/map', icon: <IconMap /> },
    { target: 'email', label: '이메일 설정', path: '/admin/email', icon: <IconEmail /> },
    { target: 'password', label: '비밀번호 변경', path: '/admin/password', icon: <IconPassword /> },
  ],
};

const SECTION_TITLES: Record<string, string> = {
  dashboard: '대시보드',
  hero: '히어로 관리',
  portfolio: '포트폴리오 관리',
  'service-images': '서비스 이미지 관리',
  board: '게시판 관리',
  team: '전문가 관리',
  'service-texts': '서비스 텍스트 관리',
  greeting: '인사말 관리',
  seo: 'SEO 설정',
  kakao: '카카오톡 설정',
  map: '오시는 길 설정',
  email: '이메일 설정',
  inquiries: '고객 문의',
  'landing-texts': '랜딩 텍스트 관리',
  password: '비밀번호 변경',
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [clock, setClock] = useState(updateClock());
  const [contentOpen, setContentOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);

  // Session guard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate('/admin', { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Clock
  useEffect(() => {
    const id = setInterval(() => setClock(updateClock()), 60000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin', { replace: true });
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const currentSegment = location.pathname.replace('/admin/', '').split('/')[0] || 'dashboard';
  const pageTitle = SECTION_TITLES[currentSegment] || '';

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const NavLink = ({ item }: { item: NavItem; key?: string }) => (
    <Link
      to={item.path}
      className={`flex items-center gap-[10px] px-5 py-[11px] text-sm font-medium border-l-[3px] transition-all duration-[180ms] ${
        isActive(item.path)
          ? 'bg-[rgba(169,87,36,0.12)] text-white border-l-[#F97316]'
          : 'text-[#9CA3AF] border-l-transparent hover:bg-[#1F2937] hover:text-[#E5E7EB]'
      }`}
    >
      {item.icon}
      <span>{item.label}</span>
    </Link>
  );

  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#F9FAFB]" style={{ color: '#111827' }}>
      {/* Sidebar */}
      <aside className="w-64 bg-[#111827] flex flex-col shrink-0 overflow-y-auto">
        {/* Logo */}
        <div className="px-5 py-6 pb-5 flex items-center gap-[10px] border-b border-white/[0.07]">
          <div className="w-9 h-9 bg-[#F97316] rounded-lg flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-[1.1rem] tracking-[0.05em]">MAI PARTNERS</div>
            <div className="text-[#9CA3AF] text-[0.7rem] tracking-[0.08em] uppercase">Admin</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2">
          {/* Top items */}
          {TOP_ITEMS.map(item => <NavLink key={item.target} item={item} />)}

          {/* Content folder */}
          <div>
            <button
              onClick={() => setContentOpen(v => !v)}
              className="w-full flex items-center justify-between px-5 py-[10px] text-[#4B5563] text-[0.7rem] font-semibold tracking-[0.1em] uppercase cursor-pointer hover:text-[#6B7280] transition-colors"
            >
              <span>{CONTENT_FOLDER.label}</span>
              <span className={`transition-transform duration-200 ${contentOpen ? '' : '-rotate-90'}`}>
                <IconChevron />
              </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${contentOpen ? 'max-h-[600px]' : 'max-h-0'}`}>
              {CONTENT_FOLDER.items.map(item => <NavLink key={item.target} item={item} />)}
            </div>
          </div>

          {/* Settings folder */}
          <div>
            <button
              onClick={() => setSettingsOpen(v => !v)}
              className="w-full flex items-center justify-between px-5 py-[10px] text-[#4B5563] text-[0.7rem] font-semibold tracking-[0.1em] uppercase cursor-pointer hover:text-[#6B7280] transition-colors"
            >
              <span>{SETTINGS_FOLDER.label}</span>
              <span className={`transition-transform duration-200 ${settingsOpen ? '' : '-rotate-90'}`}>
                <IconChevron />
              </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${settingsOpen ? 'max-h-[400px]' : 'max-h-0'}`}>
              {SETTINGS_FOLDER.items.map(item => <NavLink key={item.target} item={item} />)}
            </div>
          </div>
        </nav>

        {/* Logout */}
        <div className="px-5 py-5 border-t border-white/[0.07]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-[10px] text-[#9CA3AF] hover:text-white transition-colors text-sm font-medium w-full"
          >
            <IconLogout />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h1 className="text-base font-semibold text-[#111827]">{pageTitle}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#6B7280]">{clock}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:bg-gray-100 hover:text-[#111827] transition-colors border border-[#E5E7EB]"
            >
              로그아웃
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
