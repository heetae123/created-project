import React, { useState, useEffect, useRef, useCallback } from 'react';
import { adminGetSettings, adminSaveSettings, uploadToCloudinary } from '../../lib/admin-api';
import { ToastProvider, useToast } from './shared/Toast';
import DropZone from './shared/DropZone';

interface HeroImage {
  url: string;
  alt: string;
}

function AdminHeroInner() {
  const { showToast } = useToast();

  // Video
  const [videoUrl, setVideoUrl] = useState('');

  // Images
  const [images, setImages] = useState<HeroImage[]>([]);
  const [imgUrlInput, setImgUrlInput] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);

  // Hero text
  const [badge, setBadge] = useState('BEYOND EXPECTATIONS');
  const [title1, setTitle1] = useState('최고의 순간을');
  const [title2, setTitle2] = useState('기획합니다');
  const [subtitle, setSubtitle] = useState('당신의 비전이 현실이 되는 무대. 압도적인 스케일과 디테일로\n관객의 마음을 사로잡는 완벽한 경험을 선사합니다.');
  const [ctaText, setCtaText] = useState('견적 문의하기');
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);

  // Hero text styles
  const [titleSize, setTitleSize] = useState(80);
  const [subtitleSize, setSubtitleSize] = useState(18);
  const [titleColor, setTitleColor] = useState('#FFFFFF');
  const [highlightColor, setHighlightColor] = useState('#F97316');
  const [subtitleColor, setSubtitleColor] = useState('#A1A1AA');

  // Brochure
  const [brochureUrl, setBrochureUrl] = useState('');

  // Saving
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Position picker drag
  const pickerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [heroData, heroText, brochure] = await Promise.all([
        adminGetSettings('mai_hero'),
        adminGetSettings('mai_hero_text'),
        adminGetSettings('mai_brochure'),
      ]);

      if (heroData) {
        setVideoUrl(heroData.videoUrl || '');
        // Support old format migration
        if (heroData.images) {
          setImages(heroData.images);
        } else {
          const imgs: HeroImage[] = [];
          if (heroData.slides && heroData.slides.length > 0) {
            imgs.push(...heroData.slides);
          } else if (heroData.imageUrl) {
            imgs.push({ url: heroData.imageUrl, alt: 'Hero' });
          }
          setImages(imgs);
        }
      }

      if (heroText) {
        setBadge(heroText.badge || 'BEYOND EXPECTATIONS');
        setTitle1(heroText.title1 || '최고의 순간을');
        setTitle2(heroText.title2 || '기획합니다');
        setSubtitle(heroText.subtitle || '당신의 비전이 현실이 되는 무대. 압도적인 스케일과 디테일로\n관객의 마음을 사로잡는 완벽한 경험을 선사합니다.');
        setCtaText(heroText.ctaText || '견적 문의하기');
        setPosX(heroText.posX ?? 50);
        setPosY(heroText.posY ?? 50);
        setTitleSize(heroText.titleSize ?? 80);
        setSubtitleSize(heroText.subtitleSize ?? 18);
        setTitleColor(heroText.titleColor || '#FFFFFF');
        setHighlightColor(heroText.highlightColor || '#F97316');
        setSubtitleColor(heroText.subtitleColor || '#A1A1AA');
      }

      if (brochure) {
        setBrochureUrl(brochure.url || '');
      }
    } catch {
      showToast('데이터를 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  // ── Image management ─────────────────────────────────────
  function addImageByUrl() {
    const url = imgUrlInput.trim();
    if (!url) { showToast('URL을 입력하세요.', 'error'); return; }
    setImages(prev => [...prev, { url, alt: '' }]);
    setImgUrlInput('');
  }

  async function handleImageFile(file: File) {
    setUploadingImg(true);
    try {
      const url = await uploadToCloudinary(file, 'mai-hero');
      setImages(prev => [...prev, { url, alt: file.name }]);
    } catch {
      showToast('이미지 업로드에 실패했습니다.', 'error');
    } finally {
      setUploadingImg(false);
    }
  }

  function moveImage(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    setImages(prev => {
      const arr = [...prev];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  }

  function deleteImage(i: number) {
    setImages(prev => prev.filter((_, idx) => idx !== i));
  }

  // ── Position picker ───────────────────────────────────────
  const clampPos = (x: number, y: number) => ({
    x: Math.max(5, Math.min(95, x)),
    y: Math.max(10, Math.min(90, y)),
  });

  const updatePosFromEvent = useCallback((clientX: number, clientY: number) => {
    if (!pickerRef.current) return;
    const rect = pickerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const clamped = clampPos(x, y);
    setPosX(clamped.x);
    setPosY(clamped.y);
  }, []);

  const handlePickerMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    updatePosFromEvent(e.clientX, e.clientY);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (draggingRef.current) updatePosFromEvent(e.clientX, e.clientY); };
    const onUp = () => { draggingRef.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [updatePosFromEvent]);

  function resetPos() {
    setPosX(50);
    setPosY(50);
  }

  // ── Brochure URL ─────────────────────────────────────────

  // ── Save ─────────────────────────────────────────────────
  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      await Promise.all([
        adminSaveSettings('mai_hero', { videoUrl: videoUrl.trim(), images }),
        adminSaveSettings('mai_hero_text', {
          badge: badge.trim(),
          title1: title1.trim(),
          title2: title2.trim(),
          subtitle: subtitle.trim(),
          ctaText: ctaText.trim(),
          posX,
          posY,
          titleSize,
          subtitleSize,
          titleColor,
          highlightColor,
          subtitleColor,
        }),
        adminSaveSettings('mai_brochure', { url: brochureUrl.trim() }),
      ]);
      showToast('히어로 설정이 저장되었습니다.', 'success');
    } catch {
      showToast('저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  }

  // ── Mode indicator ────────────────────────────────────────
  function modeIndicator() {
    const count = images.length;
    if (count === 0) {
      return (
        <div className="mt-3 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: 'rgba(107,114,128,0.08)', border: '1px solid rgba(107,114,128,0.15)', color: '#6B7280' }}>
          이미지가 없습니다. 기본 이미지가 사용됩니다.
        </div>
      );
    } else if (count === 1) {
      return (
        <div className="mt-3 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#3B82F6' }}>
          단일 이미지 모드 (1장)
        </div>
      );
    } else {
      return (
        <div className="mt-3 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
          자동 슬라이드쇼 모드 ({count}장)
        </div>
      );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-[#9CA3AF]">
        <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>
    );
  }

  const textAlign = posX < 35 ? 'left' : posX > 65 ? 'right' : 'center';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#111827] mb-2">히어로 관리</h2>
        <p className="text-base text-[#6B7280]">메인 화면 상단 히어로 섹션의 미디어를 설정합니다.</p>
      </div>

      {/* Video URL */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#F97316] shrink-0" />
          <span className="text-base font-semibold text-[#111827]">동영상 URL (선택사항)</span>
        </div>
        <input
          type="text"
          value={videoUrl}
          onChange={e => setVideoUrl(e.target.value)}
          placeholder="동영상 URL을 입력하면 이미지 대신 동영상이 재생됩니다"
          className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30"
        />
        <p className="mt-1 text-xs text-[#9CA3AF]">동영상 URL이 있으면 이미지보다 우선 적용됩니다. 비워두면 이미지가 표시됩니다.</p>
        {videoUrl.trim() && (
          <div className="mt-2 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: '#F97316' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
            동영상 모드 활성화됨 - 이미지는 무시됩니다.
          </div>
        )}
      </div>

      {/* Image management */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#F97316] shrink-0" />
          <span className="text-base font-semibold text-[#111827]">이미지 관리</span>
        </div>

        <div className="px-3 py-2 rounded-lg text-xs text-[#6B7280] mb-4" style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' }}>
          이미지 1장 = 단일 이미지 표시 | 이미지 2장 이상 = 자동 슬라이드쇼
        </div>

        {/* URL add */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-[#374151] mb-2">이미지 추가</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={imgUrlInput}
              onChange={e => setImgUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addImageByUrl()}
              placeholder="이미지 URL 입력"
              className="flex-1 px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30"
            />
            <button
              onClick={addImageByUrl}
              className="px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              추가
            </button>
          </div>
        </div>

        {/* Drop zone */}
        {uploadingImg ? (
          <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-6 flex flex-col items-center gap-2 text-[#9CA3AF]">
            <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <p className="text-sm">업로드 중...</p>
          </div>
        ) : (
          <DropZone onFile={handleImageFile} label="클릭 또는 드래그하여 이미지 추가 (PNG, JPG, WEBP 지원, 여러 장 가능)" />
        )}

        {/* Mode indicator */}
        {modeIndicator()}

        {/* Image list */}
        {images.length > 0 && (
          <div className="mt-3 space-y-2">
            {images.map((img, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-14 h-10 object-cover rounded-md bg-[#E5E7EB] shrink-0"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.background = '#E5E7EB'; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#374151] truncate">
                    {img.url.startsWith('data:') ? '[업로드 이미지]' : img.url}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveImage(i, -1)}
                    disabled={i === 0}
                    className="p-1.5 rounded hover:bg-[#E5E7EB] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="위로"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                      <polyline points="18 15 12 9 6 15"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => moveImage(i, 1)}
                    disabled={i === images.length - 1}
                    className="p-1.5 rounded hover:bg-[#E5E7EB] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="아래로"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteImage(i)}
                    className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                    title="삭제"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hero Text Management */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#F97316] shrink-0" />
          <span className="text-base font-semibold text-[#111827]">메인 텍스트 관리</span>
        </div>

        <div className="space-y-4">
          {/* Badge */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">상단 배지 텍스트</label>
            <input
              type="text"
              value={badge}
              onChange={e => setBadge(e.target.value)}
              placeholder="BEYOND EXPECTATIONS"
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30"
            />
          </div>

          {/* Titles */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">메인 타이틀 (1줄)</label>
              <input
                type="text"
                value={title1}
                onChange={e => setTitle1(e.target.value)}
                placeholder="최고의 순간을"
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">메인 타이틀 (2줄, 강조)</label>
              <input
                type="text"
                value={title2}
                onChange={e => setTitle2(e.target.value)}
                placeholder="기획합니다"
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30"
              />
            </div>
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">서브 텍스트</label>
            <textarea
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              rows={3}
              placeholder="당신의 비전이 현실이 되는 무대..."
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 resize-none"
            />
          </div>

          {/* CTA */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">버튼 텍스트</label>
            <input
              type="text"
              value={ctaText}
              onChange={e => setCtaText(e.target.value)}
              placeholder="견적 문의하기"
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30"
            />
          </div>

          {/* Position picker */}
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-2">텍스트 위치 (드래그하여 이동)</label>
            <div
              ref={pickerRef}
              onMouseDown={handlePickerMouseDown}
              className="relative w-full rounded-2xl overflow-hidden cursor-crosshair border-2 border-[#E5E7EB]"
              style={{ aspectRatio: '16/9', background: '#0a0a0a', userSelect: 'none' }}
            >
              {/* Grid overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="0.5" className="w-4/5 h-4/5">
                  <line x1="12" y1="0" x2="12" y2="24"/>
                  <line x1="0" y1="12" x2="24" y2="12"/>
                  <line x1="6" y1="0" x2="6" y2="24" strokeDasharray="1 2"/>
                  <line x1="18" y1="0" x2="18" y2="24" strokeDasharray="1 2"/>
                  <line x1="0" y1="6" x2="24" y2="6" strokeDasharray="1 2"/>
                  <line x1="0" y1="18" x2="24" y2="18" strokeDasharray="1 2"/>
                </svg>
              </div>

              {/* Text preview */}
              <div
                className="absolute pointer-events-none z-[5] whitespace-nowrap"
                style={{
                  left: `${posX}%`,
                  top: `${posY}%`,
                  transform: 'translate(-50%, -50%)',
                  textAlign: textAlign as 'left' | 'center' | 'right',
                }}
              >
                <div style={{ fontSize: '7px', color: '#F97316', fontWeight: 800, letterSpacing: '2px', marginBottom: '4px' }}>
                  {badge || 'BEYOND EXPECTATIONS'}
                </div>
                <div style={{ fontSize: '16px', color: '#fff', fontWeight: 900, lineHeight: 1.1 }}>
                  {title1 || '최고의 순간을'}<br />
                  <span style={{ color: '#F97316' }}>{title2 || '기획합니다'}</span>
                </div>
              </div>

              {/* Dot */}
              <div
                className="absolute z-10 pointer-events-none"
                style={{
                  left: `${posX}%`,
                  top: `${posY}%`,
                  width: '20px',
                  height: '20px',
                  background: '#F97316',
                  border: '3px solid #fff',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 2px 12px rgba(249,115,22,0.5)',
                }}
              />
            </div>

            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-[#6B7280]">X: <strong>{Math.round(posX)}</strong>%</span>
              <span className="text-xs text-[#6B7280]">Y: <strong>{Math.round(posY)}</strong>%</span>
              <button
                onClick={resetPos}
                className="ml-auto px-3 py-1.5 text-xs font-medium text-[#374151] bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
              >
                중앙으로 초기화
              </button>
            </div>
          </div>

          {/* Title font size */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[#374151] w-40 shrink-0">타이틀 글자 크기</label>
            <input
              type="range"
              min={24}
              max={120}
              value={titleSize}
              onChange={e => setTitleSize(Number(e.target.value))}
              className="flex-1 accent-[#F97316]"
            />
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                min={24}
                max={120}
                value={titleSize}
                onChange={e => setTitleSize(Number(e.target.value) || 24)}
                className="w-16 px-2 py-1 border border-[#E5E7EB] rounded-lg text-sm text-center text-[#111827] focus:outline-none focus:border-[#F97316]"
              />
              <span className="text-xs text-[#6B7280]">px</span>
            </div>
          </div>

          {/* Subtitle font size */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[#374151] w-40 shrink-0">서브텍스트 글자 크기</label>
            <input
              type="range"
              min={12}
              max={36}
              value={subtitleSize}
              onChange={e => setSubtitleSize(Number(e.target.value))}
              className="flex-1 accent-[#F97316]"
            />
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                min={12}
                max={36}
                value={subtitleSize}
                onChange={e => setSubtitleSize(Number(e.target.value) || 12)}
                className="w-16 px-2 py-1 border border-[#E5E7EB] rounded-lg text-sm text-center text-[#111827] focus:outline-none focus:border-[#F97316]"
              />
              <span className="text-xs text-[#6B7280]">px</span>
            </div>
          </div>

          {/* Title color */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[#374151] w-40 shrink-0">타이틀 색상</label>
            <input
              type="color"
              value={titleColor}
              onChange={e => setTitleColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-[#E5E7EB] cursor-pointer"
            />
            <input
              type="text"
              value={titleColor}
              onChange={e => setTitleColor(e.target.value)}
              className="w-24 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] font-mono"
            />
          </div>

          {/* Highlight color */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[#374151] w-40 shrink-0">강조 텍스트 색상</label>
            <input
              type="color"
              value={highlightColor}
              onChange={e => setHighlightColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-[#E5E7EB] cursor-pointer"
            />
            <input
              type="text"
              value={highlightColor}
              onChange={e => setHighlightColor(e.target.value)}
              className="w-24 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] font-mono"
            />
          </div>

          {/* Subtitle color */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[#374151] w-40 shrink-0">서브텍스트 색상</label>
            <input
              type="color"
              value={subtitleColor}
              onChange={e => setSubtitleColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-[#E5E7EB] cursor-pointer"
            />
            <input
              type="text"
              value={subtitleColor}
              onChange={e => setSubtitleColor(e.target.value)}
              className="w-24 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] font-mono"
            />
          </div>
        </div>
      </div>

      {/* Brochure */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#F97316] shrink-0" />
          <span className="text-base font-semibold text-[#111827]">회사소개서 관리</span>
        </div>
        <p className="text-xs text-[#6B7280] mb-4">
          ABOUT 페이지 Company 섹션에 다운로드 버튼으로 표시됩니다.<br />
          PDF 파일을 <code className="bg-gray-100 px-1 rounded text-xs">public</code> 폴더에 넣고, 파일명을 아래에 입력하세요.
        </p>
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">소개서 파일 경로</label>
          <input
            type="text"
            value={brochureUrl}
            onChange={e => setBrochureUrl(e.target.value)}
            placeholder="/Mai_Partners_MICE_Introduce_2026.pdf"
            className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30"
          />
        </div>
        {brochureUrl.trim() && (
          <div className="mt-3 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            소개서가 등록되어 있습니다.{' '}
            <a
              href={brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
              style={{ color: '#F97316' }}
            >
              미리보기 →
            </a>
            <button
              type="button"
              onClick={() => { setBrochureUrl(''); showToast('소개서가 삭제되었습니다. 저장 버튼을 눌러 반영하세요.', 'info'); }}
              className="ml-auto text-[#EF4444] hover:text-[#DC2626] font-semibold"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        {saving ? '저장 중...' : '저장하기'}
      </button>
    </div>
  );
}

export default function AdminHero() {
  return (
    <ToastProvider>
      <AdminHeroInner />
    </ToastProvider>
  );
}
