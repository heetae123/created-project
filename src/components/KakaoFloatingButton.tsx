'use client';
import { useState, useEffect } from 'react';
import { getSettings } from '../lib/api';

export default function KakaoFloatingButton() {
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
