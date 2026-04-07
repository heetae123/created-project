import React, { useState, useEffect } from 'react';
import { adminGetSettings, adminSaveSettings } from '../../lib/admin-api';
import { useToast } from './shared/Toast';

interface SeoData {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

const DEFAULT: SeoData = {
  title: '마이파트너스 - 최고의 이벤트 파트너',
  description: '마이파트너스는 기업 행사, 컨퍼런스, 페스티벌 등 최고의 이벤트를 기획합니다.',
  keywords: '이벤트, 행사, 컨퍼런스, 기획, 마이파트너스',
  ogTitle: '마이파트너스',
  ogDescription: '당신의 비전이 현실이 되는 무대',
  ogImage: '',
};

export default function AdminSeo() {
  const { showToast } = useToast();
  const [data, setData] = useState<SeoData>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetSettings('seo')
      .then((d: SeoData | null) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (patch: Partial<SeoData>) => setData(prev => ({ ...prev, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminSaveSettings('seo', data);
      showToast('SEO 설정이 저장되었습니다.', 'success');
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
      <h2 className="text-2xl font-bold mb-1 text-[#111827]">SEO 설정</h2>
      <p className="text-sm text-[#6B7280] mb-6">검색 엔진 최적화를 위한 메타 태그를 설정합니다.</p>

      {/* Basic info */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <span className="inline-block w-1 h-[18px] bg-[#F97316] rounded-[2px]" />
          기본 정보
        </div>
        <div className="mb-[18px]">
          <label className="block text-sm font-semibold text-[#111827] mb-[7px]">사이트 제목 (Title)</label>
          <input
            type="text"
            value={data.title}
            onChange={e => set({ title: e.target.value })}
            placeholder="마이파트너스 - 최고의 이벤트 파트너"
            className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
          />
        </div>
        <div className="mb-[18px]">
          <label className="block text-sm font-semibold text-[#111827] mb-[7px]">사이트 설명 (Description)</label>
          <textarea
            value={data.description}
            onChange={e => set({ description: e.target.value })}
            placeholder="마이파트너스는 기업 행사, 컨퍼런스, 페스티벌 등 최고의 이벤트를 기획합니다."
            rows={3}
            className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)] resize-y min-h-[90px] leading-relaxed"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#111827] mb-[7px]">키워드 (Keywords)</label>
          <input
            type="text"
            value={data.keywords}
            onChange={e => set({ keywords: e.target.value })}
            placeholder="이벤트, 행사, 컨퍼런스, 기획, 마이파트너스"
            className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
          />
        </div>
      </div>

      {/* OG settings */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <span className="inline-block w-1 h-[18px] bg-[#F97316] rounded-[2px]" />
          오픈그래프 (OG) 설정
        </div>
        <div className="grid grid-cols-2 gap-4 mb-[18px]">
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-[7px]">OG 제목</label>
            <input
              type="text"
              value={data.ogTitle}
              onChange={e => set({ ogTitle: e.target.value })}
              placeholder="마이파트너스"
              className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-[7px]">OG 설명</label>
            <input
              type="text"
              value={data.ogDescription}
              onChange={e => set({ ogDescription: e.target.value })}
              placeholder="당신의 비전이 현실이 되는 무대"
              className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#111827] mb-[7px]">OG 이미지 URL</label>
          <input
            type="text"
            value={data.ogImage}
            onChange={e => set({ ogImage: e.target.value })}
            placeholder="https://..."
            className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
          />
        </div>
      </div>

      {/* Google search preview */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <span className="inline-block w-1 h-[18px] bg-[#F97316] rounded-[2px]" />
          Google 검색 결과 미리보기
        </div>
        <div className="bg-white border border-[#DDD] rounded-lg px-[18px] py-4 font-[Arial,sans-serif]">
          <div className="text-[0.8rem] text-[#202124] mb-[2px]">https://mai-event.com</div>
          <div className="text-[1.1rem] text-[#1A0DAB] mb-[3px] font-normal">
            {data.title || '마이파트너스 - 최고의 이벤트 파트너'}
          </div>
          <div className="text-[0.875rem] text-[#4D5156] leading-[1.4]">
            {data.description || '마이파트너스는 기업 행사, 컨퍼런스, 페스티벌 등 최고의 이벤트를 기획합니다.'}
          </div>
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
  );
}
