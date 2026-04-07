import React, { useState, useEffect, useRef } from 'react';
import { adminGetSettings, adminSaveSettings, uploadToCloudinary } from '../../lib/admin-api';
import DropZone from './shared/DropZone';
import { useToast } from './shared/Toast';
import { useConfirm } from './shared/ConfirmModal';

// ─────────────────────────────────────────────
// Types & constants
// ─────────────────────────────────────────────
interface ServiceImageEntry {
  url: string;
  position: string;
}

type ServiceImagesData = Record<string, ServiceImageEntry>;

interface ServiceCategory {
  slug: string;
  name: string;
  group: string;
}

const SERVICE_IMAGE_CATEGORIES: ServiceCategory[] = [
  { slug: 'ceremony',      name: '기념행사',   group: '기업행사' },
  { slug: 'promotion',     name: '프로모션',   group: '기업행사' },
  { slug: 'sports',        name: 'Sports',     group: '기업행사' },
  { slug: 'vip',           name: 'VIP 행사',   group: '기업행사' },
  { slug: 'international', name: '국제행사',   group: '공공/문화행사' },
  { slug: 'conference',    name: '컨퍼런스',   group: '공공/문화행사' },
  { slug: 'contest',       name: '컨테스트',   group: '공공/문화행사' },
  { slug: 'festival',      name: '공연 축제',  group: '공공/문화행사' },
  { slug: 'design',        name: '디자인',     group: '특화·지원' },
  { slug: 'system',        name: '시스템 협업', group: '특화·지원' },
  { slug: 'hr',            name: '인재협업',   group: '특화·지원' },
];

const GROUP_ORDER = ['기업행사', '공공/문화행사', '특화·지원'];

function parseSvcImgData(saved: ServiceImagesData, slug: string): ServiceImageEntry {
  const v = saved[slug] as any;
  if (!v) return { url: '', position: '50% 50%' };
  if (typeof v === 'string') return { url: v, position: '50% 50%' };
  return { url: v.url || '', position: v.position || '50% 50%' };
}

// ─────────────────────────────────────────────
// Focal point picker (21:9 preview with draggable dot)
// ─────────────────────────────────────────────
interface FocalPickerProps {
  imageUrl: string;
  position: string;
  onPositionChange: (pos: string) => void;
}

function FocalPicker({ imageUrl, position, onPositionChange }: FocalPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  function computePos(clientX: number, clientY: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    onPositionChange(`${Math.round(x)}% ${Math.round(y)}%`);
  }

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    computePos(e.clientX, e.clientY);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (draggingRef.current) computePos(e.clientX, e.clientY);
  };
  const onMouseUp = () => { draggingRef.current = false; };
  const onMouseLeave = () => { draggingRef.current = false; };

  const onTouchStart = (e: React.TouchEvent) => {
    draggingRef.current = true;
    computePos(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (draggingRef.current) {
      e.preventDefault();
      computePos(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const onTouchEnd = () => { draggingRef.current = false; };

  // Parse position string like "43% 61%" into x/y
  const parts = position.split(' ');
  const dotX = parts[0] || '50%';
  const dotY = parts[1] || '50%';

  return (
    <div
      ref={containerRef}
      className="relative bg-gray-200 rounded-xl overflow-hidden select-none"
      style={{ aspectRatio: '21/9', cursor: imageUrl ? 'crosshair' : 'default' }}
      onMouseDown={imageUrl ? onMouseDown : undefined}
      onMouseMove={imageUrl ? onMouseMove : undefined}
      onMouseUp={imageUrl ? onMouseUp : undefined}
      onMouseLeave={imageUrl ? onMouseLeave : undefined}
      onTouchStart={imageUrl ? onTouchStart : undefined}
      onTouchMove={imageUrl ? onTouchMove : undefined}
      onTouchEnd={imageUrl ? onTouchEnd : undefined}
    >
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt="preview"
            className="w-full h-full object-cover pointer-events-none block"
            style={{ objectPosition: position }}
            onError={e => {
              const parent = (e.currentTarget as HTMLImageElement).parentElement;
              if (parent) parent.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#6B7280;font-size:0.85rem">이미지를 불러올 수 없습니다</div>';
            }}
          />
          {/* Focal point indicator dot */}
          <div
            className="absolute pointer-events-none w-5 h-5 border-2 border-white rounded-full shadow-[0_0_0_2px_rgba(0,0,0,0.4)] z-10"
            style={{
              left: dotX,
              top: dotY,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
          이미지를 등록하세요
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Service styles interface
// ─────────────────────────────────────────────
interface ServiceStyles {
  catTitleSize: number;
  catTitleColor: string;
  svcNameSize: number;
  svcNameColor: string;
  svcDescColor: string;
}

const DEFAULT_SERVICE_STYLES: ServiceStyles = {
  catTitleSize: 28,
  catTitleColor: '#18181B',
  svcNameSize: 18,
  svcNameColor: '#18181B',
  svcDescColor: '#A1A1AA',
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function AdminServiceImages() {
  const [saved, setSaved] = useState<ServiceImagesData>({});
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editPos, setEditPos] = useState('50% 50%');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();

  // ── Service styles state ───────────────────
  const [svcStyles, setSvcStyles] = useState<ServiceStyles>(DEFAULT_SERVICE_STYLES);
  const [savingStyles, setSavingStyles] = useState(false);

  // ── Load ──────────────────────────────────
  useEffect(() => {
    adminGetSettings('mai_service_images')
      .then((data: ServiceImagesData | null) => {
        if (data && typeof data === 'object') setSaved(data);
      })
      .catch(() => {});
    adminGetSettings('mai_service_styles')
      .then((data: ServiceStyles | null) => {
        if (data && typeof data === 'object') setSvcStyles({ ...DEFAULT_SERVICE_STYLES, ...data });
      })
      .catch(() => {});
  }, []);

  // ── Persist ───────────────────────────────
  async function persist(next: ServiceImagesData) {
    setSaved(next);
    await adminSaveSettings('mai_service_images', next);
  }

  // ── Open edit form ────────────────────────
  function openEdit(slug: string) {
    const d = parseSvcImgData(saved, slug);
    setEditSlug(slug);
    setEditUrl(d.url);
    setEditPos(d.position);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  // ── File upload ───────────────────────────
  async function handleFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'mai-services');
      setEditUrl(url);
      showToast('이미지가 업로드되었습니다.', 'success');
    } catch (e: any) {
      showToast('업로드 실패: ' + (e?.message || ''), 'error');
    } finally {
      setUploading(false);
    }
  }

  // ── Save ──────────────────────────────────
  async function handleSave() {
    if (!editSlug) return;
    setSaving(true);
    try {
      const next = { ...saved };
      if (editUrl.trim()) {
        next[editSlug] = { url: editUrl.trim(), position: editPos };
      } else {
        delete next[editSlug];
      }
      await persist(next);
      setEditSlug(null);
      showToast('저장되었습니다.', 'success');
    } catch {
      showToast('저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────
  async function handleRemove(slug?: string) {
    const target = slug || editSlug;
    if (!target) return;

    const ok = await showConfirm('이미지 삭제', '이 서비스의 대표 이미지를 삭제하시겠습니까?');
    if (!ok) return;

    try {
      const next = { ...saved };
      delete next[target];
      await persist(next);
      if (target === editSlug) setEditSlug(null);
      showToast('이미지가 삭제되었습니다.', 'info');
    } catch {
      showToast('삭제에 실패했습니다.', 'error');
    }
  }

  // ── Save styles ───────────────────────────
  async function handleSaveStyles() {
    setSavingStyles(true);
    try {
      await adminSaveSettings('mai_service_styles', svcStyles);
      showToast('스타일이 저장되었습니다.', 'success');
    } catch {
      showToast('저장에 실패했습니다.', 'error');
    } finally {
      setSavingStyles(false);
    }
  }

  // ── Active category meta ──────────────────
  const activeCat = SERVICE_IMAGE_CATEGORIES.find(c => c.slug === editSlug);

  // ── Grouped categories ────────────────────
  const grouped = GROUP_ORDER.map(group => ({
    group,
    cats: SERVICE_IMAGE_CATEGORIES.filter(c => c.group === group),
  }));

  // ─────────────────────────────────────────
  return (
    <div>
      <h2 className="text-2xl font-bold mb-1 text-gray-900">서비스 대표 이미지 관리</h2>
      <p className="text-sm text-gray-500 mb-6">서비스 상세 페이지 상단에 표시될 대표 이미지를 설정합니다.</p>

      {/* ── Edit form ── */}
      {editSlug && (
        <div
          ref={formRef}
          className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-5 mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-[18px] bg-orange-500 rounded-sm inline-block" />
            <span className="font-semibold text-gray-900">
              {activeCat ? `${activeCat.name} — 대표 이미지 수정` : '이미지 수정'}
            </span>
          </div>

          {/* 21:9 preview + focal picker */}
          <div className="mb-4">
            <div className="text-[0.8rem] font-semibold text-gray-500 mb-2">미리보기 (21:9 비율)</div>
            <FocalPicker
              imageUrl={editUrl}
              position={editPos}
              onPositionChange={setEditPos}
            />
            <div className="text-[0.82rem] text-gray-500 font-medium mt-1">
              초점: {editPos}
            </div>
          </div>

          {/* Image URL */}
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">이미지 URL</label>
            <input
              type="text"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-white"
              placeholder="https://..."
              value={editUrl}
              onChange={e => setEditUrl(e.target.value)}
            />
          </div>

          {/* Drop zone */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              초점 위치 — 미리보기 이미지 위를 <strong>클릭 또는 드래그</strong>하여 초점 위치를 지정하세요
            </label>
            {uploading ? (
              <div className="border-2 border-dashed border-orange-300 rounded-xl p-5 text-center text-sm text-orange-500 font-semibold bg-orange-50">
                업로드 중...
              </div>
            ) : (
              <DropZone onFile={handleFile} label="클릭 또는 드래그하여 이미지 업로드" />
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={() => setEditSlug(null)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg border border-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => handleRemove()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors ml-auto"
            >
              이미지 삭제
            </button>
          </div>
        </div>
      )}

      {/* ── Service grid (grouped) ── */}
      {grouped.map(({ group, cats }) => (
        <div key={group} className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{group}</h3>
          <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {cats.map(cat => {
              const d = parseSvcImgData(saved, cat.slug);
              return (
                <ServiceImageCard
                  key={cat.slug}
                  cat={cat}
                  entry={d}
                  active={editSlug === cat.slug}
                  onEdit={openEdit}
                  onDelete={handleRemove}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// ServiceImageCard sub-component
// ─────────────────────────────────────────────
interface ServiceImageCardProps {
  cat: ServiceCategory;
  entry: ServiceImageEntry;
  active: boolean;
  onEdit: (slug: string) => void;
  onDelete: (slug: string) => void;
}

const ServiceImageCard: React.FC<ServiceImageCardProps> = ({
  cat,
  entry,
  active,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className={`relative bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${
        active ? 'border-orange-400 ring-2 ring-orange-200' : 'border-gray-200'
      }`}
    >
      {!entry.url && (
        <div className="absolute top-2 right-2 z-10 bg-gray-400 text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded">
          미설정
        </div>
      )}
      <img
        className="w-full h-[140px] object-cover block bg-gray-200"
        src={entry.url || ''}
        alt={cat.name}
        style={{ objectPosition: entry.position }}
        onError={e => {
          const img = e.currentTarget as HTMLImageElement;
          img.style.background = '#E5E7EB';
          img.style.objectFit = 'contain';
        }}
      />
      <div className="px-3 py-2.5">
        <div className="text-[0.7rem] font-bold uppercase tracking-[0.06em] text-orange-500 mb-1">
          {cat.group}
        </div>
        <div className="text-[0.85rem] font-semibold text-gray-900 mb-2.5">
          {cat.name}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(cat.slug)}
            className="px-3 py-1.5 text-[0.8rem] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 transition-colors flex-1"
          >
            수정
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(cat.slug);
            }}
            className="px-3 py-1.5 text-[0.8rem] font-semibold bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-100 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
