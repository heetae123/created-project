import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, go straight to dashboard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        navigate('/admin/dashboard', { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const doLogin = async () => {
    if (!pw) return;
    setLoading(true);
    setError('');
    try {
      const adminEmail = 'admin@mai-entertainment.com';
      await signInWithEmailAndPassword(auth, adminEmail, pw);
      navigate('/admin/dashboard', { replace: true });
    } catch (e: any) {
      console.error('Login error:', e);
      if (e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
        setError('비밀번호가 올바르지 않거나 권한이 없습니다.');
      } else if (e.code === 'auth/invalid-credential') {
        setError('로그인 정보가 올바르지 않습니다.');
      } else {
        setError('로그인 중 오류가 발생했습니다. (' + e.code + ')');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doLogin();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#111827]">
      <div className="bg-white/[0.04] border border-white/10 rounded-[20px] px-10 py-12 w-[400px] backdrop-blur-xl shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
        {/* Logo */}
        <div className="text-center mb-2">
          <span className="text-[2.5rem] font-bold tracking-widest text-white">
            MAI <span className="text-orange-500">PARTNERS</span>
          </span>
        </div>
        <p className="text-center text-gray-400 text-[0.85rem] mb-9">Admin Dashboard</p>

        {/* Password field */}
        <label className="block text-gray-300 text-sm font-medium mb-2">비밀번호</label>
        <div className="relative mb-5">
          <input
            type={showPw ? 'text' : 'password'}
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="비밀번호를 입력하세요"
            className="w-full px-4 py-3 pr-12 bg-white/[0.07] border border-white/15 rounded-[10px] text-white placeholder-gray-500 text-[0.95rem] focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.2)] transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
          >
            {showPw ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        {/* Login button */}
        <button
          onClick={doLogin}
          disabled={loading}
          className="w-full py-[13px] bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white rounded-[10px] font-semibold text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? '확인 중...' : '로그인'}
        </button>

        {/* Error */}
        <p className="text-[#FCA5A5] text-[0.85rem] mt-3 text-center min-h-[20px]">{error}</p>
      </div>
    </div>
  );
}
