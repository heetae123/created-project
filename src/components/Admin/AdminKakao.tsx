import React, { useState, useEffect } from 'react';
import { adminGetSettings, adminSaveSettings } from '../../lib/admin-api';
import { useToast } from './shared/Toast';

interface KakaoData {
  chatUrl: string;
  buttonText: string;
  floatingEnabled: boolean;
}

const DEFAULT: KakaoData = {
  chatUrl: '',
  buttonText: '카카오톡 문의하기',
  floatingEnabled: true,
};

export default function AdminKakao() {
  const { showToast } = useToast();
  const [data, setData] = useState<KakaoData>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetSettings('kakao')
      .then((d: KakaoData | null) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (patch: Partial<KakaoData>) => setData(prev => ({ ...prev, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminSaveSettings('kakao', data);
      showToast('카카오톡 설정이 저장되었습니다.', 'success');
    } catch {
      showToast('저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeOpacity=".2"/>
          <path d="M21 12a9 9 0 0 1-9 9"/>
        </svg>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1 text-[#111827]">카카오톡 설정</h2>
      <p className="text-sm text-[#6B7280] mb-6">카카오톡 채널 연결 및 플로팅 버튼을 설정합니다.</p>

      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className="mb-[18px]">
          <label className="block text-sm font-semibold text-[#111827] mb-[7px]">카카오톡 채팅 URL</label>
          <input
            type="text"
            value={data.chatUrl}
            onChange={e => set({ chatUrl: e.target.value })}
            placeholder="https://open.kakao.com/o/..."
            className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
          />
          <p className="text-[0.78rem] text-[#6B7280] mt-[5px]">카카오 오픈채팅 또는 채널 링크를 입력하세요.</p>
        </div>
        <div className="mb-[18px]">
          <label className="block text-sm font-semibold text-[#111827] mb-[7px]">버튼 텍스트</label>
          <input
            type="text"
            value={data.buttonText}
            onChange={e => set({ buttonText: e.target.value })}
            placeholder="카카오톡 문의하기"
            className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
          />
        </div>
        <div className="mb-[18px]">
          <label className="block text-sm font-semibold text-[#111827] mb-[7px]">플로팅 버튼 활성화</label>
          <div className="flex items-center gap-[10px]">
            <label className="relative inline-block w-11 h-6 cursor-pointer">
              <input
                type="checkbox"
                checked={data.floatingEnabled}
                onChange={e => set({ floatingEnabled: e.target.checked })}
                className="sr-only"
              />
              <span
                className={`absolute inset-0 rounded-xl transition-colors duration-200 ${data.floatingEnabled ? 'bg-[#F97316]' : 'bg-[#D1D5DB]'}`}
              />
              <span
                className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-200 ${data.floatingEnabled ? 'translate-x-5' : ''}`}
              />
            </label>
            <span
              className="text-sm font-medium cursor-pointer"
              onClick={() => set({ floatingEnabled: !data.floatingEnabled })}
            >
              사이트 우측 하단에 플로팅 버튼 표시
            </span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-[18px] py-[9px] bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  );
}
