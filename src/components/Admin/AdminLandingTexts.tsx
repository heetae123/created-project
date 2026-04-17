import React, { useState, useEffect } from 'react';
import { adminGetSettings, adminSaveSettings } from '../../lib/admin-api';
import { useToast } from './shared/Toast';
import { HighlightText } from '../../lib/highlight';

interface ReviewItem {
  name: string;
  company: string;
  content: string;
}

interface LandingTexts {
  // Portfolio
  portfolioLabel: string;
  portfolioTitle: string;
  portfolioTitleSize: number;
  portfolioColor: string;
  // System
  systemLabel: string;
  systemTitle: string;
  systemTitleSize: number;
  systemColor: string;
  systemDesc: string;
  systemDescSize: number;
  process1Title: string;
  process1Desc: string;
  process2Title: string;
  process2Desc: string;
  process3Title: string;
  process3Desc: string;
  process4Title: string;
  process4Desc: string;
  // Reviews
  reviewsLabel: string;
  reviewsTitle: string;
  reviewsTitleSize: number;
  reviewsColor: string;
  reviews: ReviewItem[];
  // News
  newsLabel: string;
  newsTitle: string;
  newsTitleSize: number;
  newsColor: string;
  // Team
  teamLabel: string;
  teamTitle: string;
  teamTitleSize: number;
  teamColor: string;
  teamDesc: string;
  teamDescSize: number;
  // Contact
  contactLabel: string;
  contactTitle: string;
  contactTitleSize: number;
  contactColor: string;
  contactDesc: string;
  contactDescSize: number;
}

const DEFAULTS: LandingTexts = {
  portfolioLabel: 'Portfolio',
  portfolioTitle: '생생한 현장의 "순간들"',
  portfolioTitleSize: 48,
  portfolioColor: '#F97316',
  systemLabel: 'System',
  systemTitle: '체계적인 행사 기획 "시스템"',
  systemTitleSize: 48,
  systemColor: '#F97316',
  systemDesc: '마이파트너스만의 검증된 프로세스로 오차 없는\n완벽한 행사를 완성합니다.',
  systemDescSize: 16,
  process1Title: '문의 및 상담',
  process1Desc: '행사 목적과 예산, 요구사항을 면밀히 분석합니다.',
  process2Title: '기획 및 제안',
  process2Desc: '창의적인 컨셉과 디테일한 실행 계획을 수립합니다.',
  process3Title: '현장 운영',
  process3Desc: '전문 인력과 시스템을 투입하여 완벽하게 통제합니다.',
  process4Title: '결과 보고',
  process4Desc: '행사 결과 분석 및 사후 관리 리포트를 제공합니다.',
  reviewsLabel: 'Reviews',
  reviewsTitle: '고객 "후기"',
  reviewsTitleSize: 48,
  reviewsColor: '#F97316',
  reviews: [
    { name: '김*민 담당자', company: '글로벌 테크 기업', content: '촉박한 일정 속에서도 완벽한 무대 연출과 매끄러운 진행을 보여주셨습니다. 다음 행사도 무조건 마이파트너스와 함께할 예정입니다.' },
    { name: '이*영 팀장', company: '공공기관', content: 'VIP 의전부터 안전 관리까지 어느 하나 빠지는 곳 없이 꼼꼼하게 챙겨주셔서 마음 편히 행사를 마칠 수 있었습니다.' },
    { name: '박*준 대표', company: '스타트업', content: '저희 브랜드의 아이덴티티를 정확히 이해하고, 기대 이상의 창의적인 기획을 제안해주셔서 참석자들의 반응이 폭발적이었습니다.' },
  ],
  newsLabel: 'Latest Updates',
  newsTitle: '새로운 "소식"',
  newsTitleSize: 48,
  newsColor: '#F97316',
  teamLabel: 'Our Team',
  teamTitle: '최고의 "전문가"들이 함께합니다',
  teamTitleSize: 48,
  teamColor: '#F97316',
  teamDesc: '마이파트너스의 각 분야 전문가들이 모여 당신의 상상을 현실로 만듭니다.',
  teamDescSize: 16,
  contactLabel: 'Contact Us',
  contactTitle: '지금 마이파트너스의\n"완벽한 행사"를 경험하세요!',
  contactTitleSize: 48,
  contactColor: '#F97316',
  contactDesc: '전문 디렉터가 24시간 이내에 작성하신 내용을 바탕으로 최적의 견적을 제안해 드립니다.',
  contactDescSize: 14,
};

const inputClass =
  'w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]';
const textareaClass =
  'w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)] resize-y min-h-[80px] leading-relaxed';
const labelClass = 'block text-sm font-semibold text-[#111827] mb-[7px]';
const sectionHeaderClass = 'text-base font-semibold text-[#111827] mb-4 flex items-center gap-2';

function SectionAccent() {
  return <span className="inline-block w-1 h-[18px] bg-[#F97316] rounded-[2px]" />;
}

function SectionPreview({ children, dark = true }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`rounded-xl p-6 mb-4 border ${dark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-[#E5E7EB]'}`}>
      <div className="flex items-center gap-2 mb-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-[#9CA3AF]"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">미리보기</span>
      </div>
      <div className="text-center">{children}</div>
    </div>
  );
}

function SizeColorRow({ label, size, color, onSize, onColor, min = 12, max = 80 }: {
  label: string; size: number; color: string;
  onSize: (v: number) => void; onColor: (v: string) => void;
  min?: number; max?: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-3">
      <span className="text-sm font-medium text-[#374151] w-28 shrink-0">{label}</span>
      <input type="range" min={min} max={max} value={size} onChange={e => onSize(Number(e.target.value))} className="flex-1 min-w-[100px] accent-[#F97316]" />
      <div className="flex items-center gap-1 shrink-0">
        <input type="number" value={size} onChange={e => onSize(Number(e.target.value) || min)} className="w-16 px-2 py-1 border border-[#E5E7EB] rounded-lg text-sm text-center text-[#111827] focus:outline-none focus:border-[#F97316]" />
        <span className="text-xs text-[#6B7280]">px</span>
      </div>
      <input type="color" value={color} onChange={e => onColor(e.target.value)} className="w-8 h-8 rounded-lg border border-[#E5E7EB] cursor-pointer shrink-0" />
      <input type="text" value={color} onChange={e => onColor(e.target.value)} className="w-20 px-2 py-1 border border-[#E5E7EB] rounded-lg text-xs text-[#111827] font-mono focus:outline-none focus:border-[#F97316]" />
    </div>
  );
}

function HighlightHint() {
  return (
    <p className="text-xs text-[#9CA3AF] mt-1">
      큰따옴표("")안의 텍스트는 <span className="text-[#F97316] font-semibold">강조</span>됩니다. Enter로 줄바꿈할 수 있습니다.
    </p>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  titleField,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  titleField?: boolean;
  rows?: number;
}) {
  return (
    <div className="mb-4">
      <label className={labelClass}>{label}</label>
      {textarea || titleField ? (
        <>
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            className={textareaClass}
            rows={titleField ? (rows ?? 2) : undefined}
          />
          {titleField && <HighlightHint />}
        </>
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}

export default function AdminLandingTexts() {
  const { showToast } = useToast();
  const [data, setData] = useState<LandingTexts>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetSettings('mai_landing_texts')
      .then((saved: any | null) => {
        if (saved) {
          // Backward compatibility: merge old split highlight fields into unified title fields
          if (saved.portfolioHighlight && !saved.portfolioTitle?.includes('"')) {
            saved.portfolioTitle = `${saved.portfolioTitle || ''} "${saved.portfolioHighlight}"`;
          }
          if (saved.systemHighlight && !saved.systemTitle?.includes('"')) {
            saved.systemTitle = `${saved.systemTitle || ''} "${saved.systemHighlight}"`;
          }
          if (saved.reviewsHighlight && !saved.reviewsTitle?.includes('"')) {
            saved.reviewsTitle = `${saved.reviewsTitle || ''} "${saved.reviewsHighlight}"`;
          }
          if (saved.newsHighlight && !saved.newsTitle?.includes('"')) {
            saved.newsTitle = `${saved.newsTitle || ''} "${saved.newsHighlight}"`;
          }
          setData({ ...DEFAULTS, ...saved });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof LandingTexts) => (value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
  };
  const setNum = (key: keyof LandingTexts) => (value: number) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const addReview = () => {
    setData(prev => ({ ...prev, reviews: [...prev.reviews, { name: '', company: '', content: '' }] }));
  };

  const removeReview = (idx: number) => {
    setData(prev => ({ ...prev, reviews: prev.reviews.filter((_, i) => i !== idx) }));
  };

  const updateReview = (idx: number, field: keyof ReviewItem, value: string) => {
    setData(prev => ({
      ...prev,
      reviews: prev.reviews.map((r, i) => i === idx ? { ...r, [field]: value } : r),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminSaveSettings('mai_landing_texts', data);
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
          <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeOpacity=".2" />
          <path d="M21 12a9 9 0 0 1-9 9" />
        </svg>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1 text-[#111827]">랜딩 텍스트 관리</h2>
      <p className="text-sm text-[#6B7280] mb-6">홈 페이지 각 섹션의 텍스트를 수정합니다.</p>

      {/* Portfolio 섹션 */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className={sectionHeaderClass}><SectionAccent />Portfolio 섹션</div>
        <SectionPreview>
          <span className="text-[#F97316] text-[10px] font-black tracking-[0.4em] uppercase block mb-2">{data.portfolioLabel}</span>
          <h3 className="font-black text-white" style={{ fontSize: data.portfolioTitleSize }}><HighlightText text={data.portfolioTitle} color={data.portfolioColor} /></h3>
        </SectionPreview>
        <Field label="레이블 (Label)" value={data.portfolioLabel} onChange={set('portfolioLabel')} />
        <Field label="제목" value={data.portfolioTitle} onChange={set('portfolioTitle')} titleField />
        <SizeColorRow label="제목 스타일" size={data.portfolioTitleSize} color={data.portfolioColor} onSize={setNum('portfolioTitleSize')} onColor={set('portfolioColor')} min={24} max={80} />
      </div>

      {/* System 섹션 */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className={sectionHeaderClass}><SectionAccent />System 섹션</div>
        <SectionPreview>
          <span className="text-[#F97316] text-[10px] font-black tracking-[0.4em] uppercase block mb-2">{data.systemLabel}</span>
          <h3 className="font-black text-white mb-3" style={{ fontSize: data.systemTitleSize }}><HighlightText text={data.systemTitle} color={data.systemColor} /></h3>
          <p className="text-zinc-500 whitespace-pre-line" style={{ fontSize: data.systemDescSize }}>{data.systemDesc}</p>
          <div className="flex gap-3 mt-4 justify-center">
            {[
              { t: data.process1Title, d: data.process1Desc },
              { t: data.process2Title, d: data.process2Desc },
              { t: data.process3Title, d: data.process3Desc },
              { t: data.process4Title, d: data.process4Desc },
            ].map((item, i) => (
              <div key={i} className="bg-[#161616] rounded-xl px-4 py-3 border border-white/5 text-left flex-1">
                <span className="text-zinc-600 text-[10px] font-black">0{i+1}</span>
                <p className="text-white text-xs font-bold mt-1 whitespace-pre-line">{item.t}</p>
                <p className="text-zinc-500 text-[10px] mt-1 whitespace-pre-line line-clamp-2">{item.d}</p>
              </div>
            ))}
          </div>
        </SectionPreview>
        <Field label="레이블 (Label)" value={data.systemLabel} onChange={set('systemLabel')} />
        <Field label="제목" value={data.systemTitle} onChange={set('systemTitle')} titleField />
        <SizeColorRow label="제목 스타일" size={data.systemTitleSize} color={data.systemColor} onSize={setNum('systemTitleSize')} onColor={set('systemColor')} min={24} max={80} />
        <Field label="설명" value={data.systemDesc} onChange={set('systemDesc')} textarea />
        <SizeColorRow label="설명 스타일" size={data.systemDescSize} color={data.systemColor} onSize={setNum('systemDescSize')} onColor={set('systemColor')} min={12} max={24} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">프로세스 카드 1</p>
            <Field label="제목" value={data.process1Title} onChange={set('process1Title')} />
            <Field label="설명" value={data.process1Desc} onChange={set('process1Desc')} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">프로세스 카드 2</p>
            <Field label="제목" value={data.process2Title} onChange={set('process2Title')} />
            <Field label="설명" value={data.process2Desc} onChange={set('process2Desc')} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">프로세스 카드 3</p>
            <Field label="제목" value={data.process3Title} onChange={set('process3Title')} />
            <Field label="설명" value={data.process3Desc} onChange={set('process3Desc')} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">프로세스 카드 4</p>
            <Field label="제목" value={data.process4Title} onChange={set('process4Title')} />
            <Field label="설명" value={data.process4Desc} onChange={set('process4Desc')} />
          </div>
        </div>
      </div>

      {/* Reviews 섹션 */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className={sectionHeaderClass}><SectionAccent />Reviews 섹션</div>
        <SectionPreview>
          <span className="text-[#F97316] text-[10px] font-black tracking-[0.4em] uppercase block mb-2">{data.reviewsLabel}</span>
          <h3 className="font-black text-white mb-4" style={{ fontSize: data.reviewsTitleSize }}><HighlightText text={data.reviewsTitle} color={data.reviewsColor} /></h3>
          <div className="flex gap-3 justify-center">
            {data.reviews.slice(0, 3).map((r, i) => (
              <div key={i} className="bg-[#161616] rounded-xl px-4 py-3 border border-white/5 text-left flex-1">
                <p className="text-zinc-300 text-xs leading-relaxed line-clamp-2 mb-2 whitespace-pre-line">"{r.content}"</p>
                <p className="text-white text-[10px] font-bold">{r.name}</p>
                <p className="text-zinc-600 text-[9px]">{r.company}</p>
              </div>
            ))}
          </div>
          {data.reviews.length >= 4 && <p className="text-zinc-600 text-[10px] mt-2">+ {data.reviews.length - 3}개 더 (슬라이드로 표시)</p>}
        </SectionPreview>
        <Field label="레이블 (Label)" value={data.reviewsLabel} onChange={set('reviewsLabel')} />
        <Field label="제목" value={data.reviewsTitle} onChange={set('reviewsTitle')} titleField />
        <SizeColorRow label="제목 스타일" size={data.reviewsTitleSize} color={data.reviewsColor} onSize={setNum('reviewsTitleSize')} onColor={set('reviewsColor')} min={24} max={80} />
        <div className="mt-4 space-y-4">
          {data.reviews.map((review, idx) => (
            <div key={idx} className="p-5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">후기 {idx + 1}</p>
                <button
                  onClick={() => removeReview(idx)}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                >
                  삭제
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="이름" value={review.name} onChange={v => updateReview(idx, 'name', v)} />
                <Field label="회사" value={review.company} onChange={v => updateReview(idx, 'company', v)} />
              </div>
              <Field label="내용" value={review.content} onChange={v => updateReview(idx, 'content', v)} textarea />
            </div>
          ))}
          <button
            onClick={addReview}
            className="w-full py-3 border-2 border-dashed border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#6B7280] hover:border-[#F97316] hover:text-[#F97316] transition-colors flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            후기 추가
          </button>
        </div>
      </div>

      {/* News 섹션 */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className={sectionHeaderClass}><SectionAccent />News 섹션</div>
        <SectionPreview>
          <span className="text-[#F97316] text-[10px] font-black tracking-[0.4em] uppercase block mb-2">{data.newsLabel}</span>
          <h3 className="font-black text-white" style={{ fontSize: data.newsTitleSize }}><HighlightText text={data.newsTitle} color={data.newsColor} /></h3>
        </SectionPreview>
        <Field label="레이블 (Label)" value={data.newsLabel} onChange={set('newsLabel')} />
        <Field label="제목" value={data.newsTitle} onChange={set('newsTitle')} titleField />
        <SizeColorRow label="제목 스타일" size={data.newsTitleSize} color={data.newsColor} onSize={setNum('newsTitleSize')} onColor={set('newsColor')} min={24} max={80} />
      </div>

      {/* Team 섹션 */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className={sectionHeaderClass}><SectionAccent />Team 섹션</div>
        <SectionPreview>
          <span className="text-[#F97316] text-[10px] font-black tracking-[0.4em] uppercase block mb-2">{data.teamLabel}</span>
          <h3 className="font-black text-white mb-3" style={{ fontSize: data.teamTitleSize }}><HighlightText text={data.teamTitle} color={data.teamColor} /></h3>
          <p className="text-zinc-500 whitespace-pre-line" style={{ fontSize: data.teamDescSize }}>{data.teamDesc}</p>
        </SectionPreview>
        <Field label="레이블 (Label)" value={data.teamLabel} onChange={set('teamLabel')} />
        <Field label="제목" value={data.teamTitle} onChange={set('teamTitle')} titleField />
        <SizeColorRow label="제목 스타일" size={data.teamTitleSize} color={data.teamColor} onSize={setNum('teamTitleSize')} onColor={set('teamColor')} min={24} max={80} />
        <Field label="설명" value={data.teamDesc} onChange={set('teamDesc')} textarea />
        <SizeColorRow label="설명 스타일" size={data.teamDescSize} color={data.teamColor} onSize={setNum('teamDescSize')} onColor={set('teamColor')} min={12} max={24} />
      </div>

      {/* Contact 섹션 */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className={sectionHeaderClass}><SectionAccent />Contact 섹션</div>
        <SectionPreview>
          <div className="inline-block px-3 py-1 rounded-full bg-[#F97316]/10 border border-[#F97316]/20 mb-3">
            <span className="text-[#F97316] text-[10px] font-black tracking-[0.3em] uppercase">{data.contactLabel}</span>
          </div>
          <h3 className="font-black text-white leading-tight" style={{ fontSize: data.contactTitleSize }}><HighlightText text={data.contactTitle} color={data.contactColor} /></h3>
          <p className="text-zinc-500 mt-2 whitespace-pre-line" style={{ fontSize: data.contactDescSize }}>{data.contactDesc}</p>
        </SectionPreview>
        <Field label="레이블 (Label)" value={data.contactLabel} onChange={set('contactLabel')} />
        <Field label="제목" value={data.contactTitle} onChange={set('contactTitle')} titleField rows={3} />
        <SizeColorRow label="제목 스타일" size={data.contactTitleSize} color={data.contactColor} onSize={setNum('contactTitleSize')} onColor={set('contactColor')} min={24} max={80} />
        <Field label="설명" value={data.contactDesc} onChange={set('contactDesc')} textarea />
        <SizeColorRow label="설명 스타일" size={data.contactDescSize} color={data.contactColor} onSize={setNum('contactDescSize')} onColor={set('contactColor')} min={12} max={24} />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-[18px] py-[9px] bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
        </svg>
        {saving ? '저장 중...' : '저장하기'}
      </button>
    </div>
  );
}
