import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { QUILL_MODULES, QUILL_FORMATS } from '../../lib/quill-config';
import { adminGetSettings, adminSaveSettings } from '../../lib/admin-api';
import { useToast } from './shared/Toast';

const SERVICES = [
  { value: 'ceremony',      label: '기념행사',   group: '기업행사' },
  { value: 'promotion',     label: '프로모션',   group: '기업행사' },
  { value: 'sports',        label: 'Sports',     group: '기업행사' },
  { value: 'vip',           label: 'VIP 행사',   group: '기업행사' },
  { value: 'international', label: '국제행사',   group: '공공/문화행사' },
  { value: 'conference',    label: '컨퍼런스',   group: '공공/문화행사' },
  { value: 'contest',       label: '컨테스트',   group: '공공/문화행사' },
  { value: 'festival',      label: '공연 축제',  group: '공공/문화행사' },
  { value: 'design',        label: '디자인',     group: '특화·지원' },
  { value: 'system',        label: '시스템 협업', group: '특화·지원' },
  { value: 'hr',            label: '인재협업',   group: '특화·지원' },
];

interface ServiceTextData {
  overview: string;
  points: string[];
  pointsColor?: string;
  pointsTextColor?: string;
}

type ServiceTextsMap = Record<string, ServiceTextData>;

export default function AdminServiceTexts() {
  const { showToast } = useToast();
  const [selectedSlug, setSelectedSlug] = useState('ceremony');
  const [allData, setAllData] = useState<ServiceTextsMap>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetSettings('service_texts')
      .then((data: ServiceTextsMap | null) => {
        if (data) setAllData(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const current: ServiceTextData = allData[selectedSlug] ?? { overview: '', points: [] };

  const updateCurrent = (patch: Partial<ServiceTextData>) => {
    setAllData(prev => ({
      ...prev,
      [selectedSlug]: { ...current, ...patch },
    }));
  };

  const addPoint = () => {
    updateCurrent({ points: [...current.points, ''] });
  };

  const updatePoint = (idx: number, val: string) => {
    const pts = current.points.map((p, i) => (i === idx ? val : p));
    updateCurrent({ points: pts });
  };

  const removePoint = (idx: number) => {
    updateCurrent({ points: current.points.filter((_, i) => i !== idx) });
  };

  const handleReset = () => {
    if (window.confirm('이 서비스의 모든 텍스트 내용을 초기화하시겠습니까?')) {
      updateCurrent({ overview: '', points: [] });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminSaveSettings('service_texts', allData);
      showToast('저장되었습니다.', 'success');
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
      <h2 className="text-2xl font-bold mb-1 text-[#111827]">서비스 텍스트 관리</h2>
      <p className="text-sm text-[#6B7280] mb-6">서비스 상세 페이지의 '서비스 개요'와 '주요 포인트'를 수정합니다.</p>

      {/* Service selector */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className="mb-0">
          <label className="block text-sm font-semibold text-[#111827] mb-[7px]">서비스 선택</label>
          <select
            value={selectedSlug}
            onChange={e => setSelectedSlug(e.target.value)}
            className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)] cursor-pointer"
          >
            {['기업행사', '공공/문화행사', '특화·지원'].map(group => (
              <optgroup key={group} label={group}>
                {SERVICES.filter(s => s.group === group).map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl p-6 mb-5 border bg-white border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-[#9CA3AF]"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">미리보기</span>
        </div>
        <div>
          <h3 className="text-2xl font-black text-zinc-900 mb-4">서비스 개요</h3>
          {current.overview ? (
            <div className="ql-editor leading-relaxed" style={{ padding: 0 }} dangerouslySetInnerHTML={{ __html: current.overview }} />
          ) : (
            <p className="leading-relaxed text-[#525252]">서비스 개요 텍스트가 여기에 표시됩니다.</p>
          )}
          <h3 className="text-2xl font-black text-zinc-900 mt-6 mb-4">주요 포인트</h3>
          <ul className="space-y-2">
            {current.points.length === 0 ? (
              <li className="flex items-start gap-2 text-sm" style={{ color: current.pointsTextColor ?? '#525252' }}>
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: current.pointsColor ?? '#F97316' }} />
                포인트 항목이 여기에 표시됩니다.
              </li>
            ) : (
              current.points.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: current.pointsTextColor ?? '#525252' }}>
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: current.pointsColor ?? '#F97316' }} />
                  {pt}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Overview */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <span className="inline-block w-1 h-[18px] bg-[#F97316] rounded-[2px]" />
          서비스 개요
        </div>
        <div className="mb-4 min-h-[200px]">
          <div key={selectedSlug}>
            <ReactQuill
              value={current.overview}
              onChange={(html, _delta, source) => {
                if (source === 'api') return;
                updateCurrent({ overview: html });
              }}
              modules={QUILL_MODULES}
              formats={QUILL_FORMATS}
              theme="snow"
              placeholder="서비스 개요 텍스트를 입력하세요..."
            />
          </div>
        </div>

        {/* Points bullet color */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-[#374151] w-40 shrink-0">포인트 색상</label>
          <input
            type="color"
            value={current.pointsColor ?? '#F97316'}
            onChange={e => updateCurrent({ pointsColor: e.target.value })}
            className="w-10 h-10 rounded-lg border border-[#E5E7EB] cursor-pointer"
          />
          <input
            type="text"
            value={current.pointsColor ?? '#F97316'}
            onChange={e => updateCurrent({ pointsColor: e.target.value })}
            className="w-24 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] font-mono"
          />
        </div>
        {/* Points text color */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-[#374151] w-40 shrink-0">포인트 텍스트 색상</label>
          <input
            type="color"
            value={current.pointsTextColor ?? '#525252'}
            onChange={e => updateCurrent({ pointsTextColor: e.target.value })}
            className="w-10 h-10 rounded-lg border border-[#E5E7EB] cursor-pointer"
          />
          <input
            type="text"
            value={current.pointsTextColor ?? '#525252'}
            onChange={e => updateCurrent({ pointsTextColor: e.target.value })}
            className="w-24 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] font-mono"
          />
        </div>
      </div>

      {/* Key points */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className="flex justify-between items-center mb-3">
          <div className="text-base font-semibold text-[#111827] flex items-center gap-2">
            <span className="inline-block w-1 h-[18px] bg-[#F97316] rounded-[2px]" />
            주요 포인트
          </div>
          <button
            onClick={addPoint}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-[#111827] border border-[#E5E7EB] hover:bg-gray-200 transition-colors"
          >
            + 포인트 추가
          </button>
        </div>
        {current.points.length === 0 && (
          <p className="text-sm text-[#6B7280] py-2">포인트를 추가하세요.</p>
        )}
        <div className="flex flex-col gap-2">
          {current.points.map((pt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#6B7280] w-5 shrink-0">{idx + 1}.</span>
              <input
                type="text"
                value={pt}
                onChange={e => updatePoint(idx, e.target.value)}
                placeholder={`포인트 ${idx + 1}`}
                className="flex-1 px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
              />
              <button
                onClick={() => removePoint(idx)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                title="삭제"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
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
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-[18px] py-[9px] bg-white hover:bg-red-50 text-red-500 border border-red-200 rounded-lg text-sm font-semibold transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
          내용 삭제 (초기화)
        </button>
      </div>
    </div>
  );
}
