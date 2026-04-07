import React, { useState, useEffect, useRef } from 'react';
import { adminGetSettings, adminSaveSettings, uploadToCloudinary } from '../../lib/admin-api';
import DropZone from './shared/DropZone';
import ImagePreview from './shared/ImagePreview';
import { useToast } from './shared/Toast';
import { useConfirm } from './shared/ConfirmModal';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface TeamMember {
  id: number;
  name: string;
  role: string;
  team: string;
  representative: boolean;
  image: string;
  interview: string;
}

type FilterTab = '전체' | '기획·운영팀' | '디자인팀' | '영상팀' | '마케팅팀';

const TEAM_OPTIONS: string[] = ['기획·운영팀', '디자인팀', '영상팀', '마케팅팀'];
const FILTER_TABS: FilterTab[] = ['전체', '기획·운영팀', '디자인팀', '영상팀', '마케팅팀'];

// ─────────────────────────────────────────────
// Empty form state
// ─────────────────────────────────────────────
function emptyForm(): Omit<TeamMember, 'id'> {
  return {
    name: '',
    role: '',
    team: '기획·운영팀',
    representative: false,
    image: '',
    interview: '',
  };
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function AdminTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filterTab, setFilterTab] = useState<FilterTab>('전체');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();

  // ── Load ──────────────────────────────────
  useEffect(() => {
    adminGetSettings('mai_team')
      .then((data: TeamMember[] | null) => {
        if (Array.isArray(data)) setMembers(data);
      })
      .catch(() => {});
  }, []);

  // ── Persist ───────────────────────────────
  async function persist(next: TeamMember[]) {
    setMembers(next);
    await adminSaveSettings('mai_team', next);
  }

  // ── Filtered list ─────────────────────────
  const filtered =
    filterTab === '전체' ? members : members.filter(m => m.team === filterTab);

  // ── Open add form ─────────────────────────
  function openAdd() {
    setEditId(null);
    setForm(emptyForm());
    setShowForm(prev => !prev);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  // ── Open edit form ────────────────────────
  function openEdit(id: number) {
    const m = members.find(m => m.id === id);
    if (!m) return;
    setEditId(id);
    setForm({
      name: m.name,
      role: m.role,
      team: m.team,
      representative: m.representative,
      image: m.image,
      interview: m.interview,
    });
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  // ── File upload ───────────────────────────
  async function handleFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'mai-team');
      setForm(prev => ({ ...prev, image: url }));
      showToast('이미지가 업로드되었습니다.', 'success');
    } catch {
      showToast('업로드에 실패했습니다.', 'error');
    } finally {
      setUploading(false);
    }
  }

  // ── Save ──────────────────────────────────
  async function handleSave() {
    if (!form.name.trim() || !form.role.trim()) {
      showToast('이름과 직책을 입력하세요.', 'error');
      return;
    }
    setSaving(true);
    try {
      let next: TeamMember[];
      if (editId !== null) {
        next = members.map(m =>
          m.id === editId ? { ...m, ...form } : m
        );
        showToast('팀원 정보가 수정되었습니다.', 'success');
      } else {
        const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
        next = [...members, { id: newId, ...form }];
        showToast('팀원이 추가되었습니다.', 'success');
      }
      await persist(next);
      setShowForm(false);
    } catch {
      showToast('저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────
  async function handleDelete(id: number) {
    const ok = await showConfirm('팀원 삭제', '이 팀원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!ok) return;
    try {
      const next = members.filter(m => m.id !== id);
      await persist(next);
      showToast('팀원이 삭제되었습니다.', 'info');
    } catch {
      showToast('삭제에 실패했습니다.', 'error');
    }
  }

  // ─────────────────────────────────────────
  return (
    <div>
      <h2 className="text-2xl font-bold mb-1 text-gray-900">전문가 관리</h2>
      <p className="text-sm text-gray-500 mb-6">팀원 정보를 추가, 수정, 삭제합니다.</p>

      {/* ── Add/Edit form ── */}
      {showForm && (
        <div
          ref={formRef}
          className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-5 mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-[18px] bg-orange-500 rounded-sm inline-block" />
            <span className="font-semibold text-gray-900">
              {editId !== null ? '팀원 수정' : '팀원 추가'}
            </span>
          </div>

          {/* Name + Role */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">이름</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-white"
                placeholder="김대표"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">직책 / 역할</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-white"
                placeholder="CEO / 총괄 디렉터"
                value={form.role}
                onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
              />
            </div>
          </div>

          {/* Team */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">소속 팀</label>
            <select
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500 bg-white cursor-pointer"
              value={form.team}
              onChange={e => setForm(prev => ({ ...prev, team: e.target.value }))}
            >
              {TEAM_OPTIONS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">프로필 이미지 URL</label>
            <input
              type="text"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-white"
              placeholder="https://..."
              value={form.image}
              onChange={e => setForm(prev => ({ ...prev, image: e.target.value }))}
            />
          </div>

          {/* Drop zone */}
          <div className="mb-3">
            {uploading ? (
              <div className="border-2 border-dashed border-orange-300 rounded-xl p-5 text-center text-sm text-orange-500 font-semibold bg-orange-50">
                업로드 중...
              </div>
            ) : (
              <DropZone onFile={handleFile} label="클릭 또는 드래그하여 사진 업로드" />
            )}
          </div>

          {/* Image preview */}
          {form.image && (
            <div className="mb-3">
              <ImagePreview
                url={form.image}
                onClose={() => setForm(prev => ({ ...prev, image: '' }))}
              />
            </div>
          )}

          {/* Representative toggle */}
          <div className="mb-4 mt-3">
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">대표자 지정</label>
            <div className="flex items-center gap-2.5">
              <label className="relative inline-block w-11 h-6 cursor-pointer">
                <input
                  type="checkbox"
                  className="opacity-0 w-0 h-0 absolute"
                  checked={form.representative}
                  onChange={e => setForm(prev => ({ ...prev, representative: e.target.checked }))}
                />
                <span
                  className={`absolute inset-0 rounded-xl transition-colors duration-200 ${form.representative ? 'bg-orange-500' : 'bg-gray-300'}`}
                />
                <span
                  className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200 ${form.representative ? 'translate-x-5' : ''}`}
                />
              </label>
              <span
                className="text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => setForm(prev => ({ ...prev, representative: !prev.representative }))}
              >
                About 페이지에 대표로 표시
              </span>
            </div>
          </div>

          {/* Interview */}
          <div className="mb-4 mt-3">
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">실무 인터뷰 내용</label>
            <textarea
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-white resize-y min-h-[100px]"
              rows={5}
              placeholder="팀원의 실무 인터뷰 내용을 입력하세요..."
              value={form.interview}
              onChange={e => setForm(prev => ({ ...prev, interview: e.target.value }))}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-3.5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg border border-gray-200 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* ── Actions bar ── */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">
          총 {filtered.length}명의 팀원
        </span>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          팀원 추가
        </button>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
              filterTab === tab
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3.5 opacity-35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          <p className="text-base">등록된 팀원이 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
          {filtered.map(m => (
            <TeamCard
              key={m.id}
              member={m}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TeamCard sub-component
// ─────────────────────────────────────────────
interface TeamCardProps {
  member: TeamMember;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({
  member,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <img
        className="w-full h-40 object-cover bg-gray-200 block"
        src={member.image || ''}
        alt={member.name}
        onError={e => {
          (e.currentTarget as HTMLImageElement).src =
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='24' fill='%239CA3AF'%3E%3F%3C/text%3E%3C/svg%3E";
        }}
      />
      <div className="p-3.5">
        {member.team && (
          <div className="mb-1.5">
            <span className="inline-block px-2 py-0.5 rounded-full bg-orange-100 text-orange-500 text-[0.7rem] font-semibold">
              {member.team}
            </span>
            {member.representative && (
              <span className="inline-block ml-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[0.7rem] font-semibold">
                대표
              </span>
            )}
          </div>
        )}
        <div className="font-bold text-[0.95rem] text-gray-900 mb-0.5">{member.name}</div>
        <div className="text-[0.8rem] text-gray-500 mb-3">{member.role}</div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(member.id)}
            className="px-3 py-1.5 text-[0.8rem] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 transition-colors"
          >
            수정
          </button>
          <button
            onClick={() => onDelete(member.id)}
            className="px-3 py-1.5 text-[0.8rem] font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
