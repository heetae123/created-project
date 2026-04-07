import React, { useState, useEffect } from 'react';
import { getInquiries, updateInquiryStatus, deleteInquiry } from '../../lib/admin-api';
import { useToast } from './shared/Toast';
import { useConfirm } from './shared/ConfirmModal';

interface Inquiry {
  id: string;
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  eventName?: string;
  eventDate?: string;
  location?: string;
  attendance?: string;
  budget?: string;
  details?: string;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
}

type StatusType = '신규' | '확인' | '완료';

const STATUS_STYLES: Record<string, string> = {
  '신규': 'bg-[#FEF3C7] text-[#92400E]',
  '확인': 'bg-[#DBEAFE] text-[#1E40AF]',
  '완료': 'bg-[#D1FAE5] text-[#065F46]',
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-[10px] py-[3px] rounded-full text-xs font-bold whitespace-nowrap ${cls}`}>
      {status || '신규'}
    </span>
  );
}

export default function AdminInquiries() {
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getInquiries();
      setInquiries(data);
    } catch {
      showToast('문의 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = async (id: string, status: StatusType) => {
    try {
      await updateInquiryStatus(id, status);
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      showToast('상태가 업데이트되었습니다.', 'success');
    } catch {
      showToast('상태 업데이트에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await showConfirm('문의 삭제', '이 문의를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!ok) return;
    try {
      await deleteInquiry(id);
      setInquiries(prev => prev.filter(i => i.id !== id));
      if (expandedId === id) setExpandedId(null);
      showToast('삭제되었습니다.', 'success');
    } catch {
      showToast('삭제에 실패했습니다.', 'error');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const formatDate = (val: string | undefined) => {
    if (!val) return '-';
    try { return new Date(val).toLocaleDateString('ko-KR'); } catch { return val; }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1 text-[#111827]">고객 문의</h2>
      <p className="text-sm text-[#6B7280] mb-6">접수된 문의 내역을 확인하고 상태를 관리합니다.</p>

      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04]">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">
            <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeOpacity=".2"/>
              <path d="M21 12a9 9 0 0 1-9 9"/>
            </svg>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-14 text-[#6B7280]">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p className="text-sm">접수된 문의가 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['번호', '업체명', '담당자', '연락처', '행사명', '상태', '접수일', '관리'].map(h => (
                    <th key={h} className="px-[14px] py-3 text-left text-[0.75rem] font-bold text-[#6B7280] uppercase tracking-[0.05em] border-b-2 border-[#E5E7EB] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inquiries.map((row, idx) => (
                  <React.Fragment key={row.id}>
                    <tr
                      className={`cursor-pointer ${expandedId === row.id ? 'bg-[#F9FAFB]' : 'hover:bg-[#FAFAFA]'}`}
                      onClick={() => toggleExpand(row.id)}
                    >
                      <td className="px-[14px] py-[13px] text-sm border-b border-[#E5E7EB] text-[#6B7280]">
                        {inquiries.length - idx}
                      </td>
                      <td className="px-[14px] py-[13px] text-sm border-b border-[#E5E7EB] font-medium text-[#111827]">
                        {row.companyName || '-'}
                      </td>
                      <td className="px-[14px] py-[13px] text-sm border-b border-[#E5E7EB] text-[#111827]">
                        {row.contactPerson || '-'}
                      </td>
                      <td className="px-[14px] py-[13px] text-sm border-b border-[#E5E7EB] text-[#111827]">
                        {row.phone || '-'}
                      </td>
                      <td className="px-[14px] py-[13px] text-sm border-b border-[#E5E7EB] text-[#111827]">
                        {row.eventName || '-'}
                      </td>
                      <td className="px-[14px] py-[13px] border-b border-[#E5E7EB]">
                        <StatusBadge status={row.status || '신규'} />
                      </td>
                      <td className="px-[14px] py-[13px] text-sm border-b border-[#E5E7EB] text-[#6B7280] whitespace-nowrap">
                        {formatDate(row.createdAt)}
                      </td>
                      <td className="px-[14px] py-[13px] border-b border-[#E5E7EB]" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded"
                          title="삭제"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </td>
                    </tr>

                    {expandedId === row.id && (
                      <tr className="bg-[#F9FAFB]">
                        <td colSpan={8} className="px-6 py-5 border-b border-[#E5E7EB]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: contact + status */}
                            <div>
                              <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-3">상세 정보</h4>
                              <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-lg px-4 py-3 text-sm leading-[1.7] whitespace-pre-wrap space-y-1" style={{ color: '#374151' }}>
                                <div><span className="font-semibold text-[#111827]">업체명:</span> {row.companyName || '-'}</div>
                                <div><span className="font-semibold text-[#111827]">담당자:</span> {row.contactPerson || '-'}</div>
                                <div><span className="font-semibold text-[#111827]">연락처:</span> {row.phone || '-'}</div>
                                <div><span className="font-semibold text-[#111827]">이메일:</span> {row.email || '-'}</div>
                                <div><span className="font-semibold text-[#111827]">행사명:</span> {row.eventName || '-'}</div>
                                <div><span className="font-semibold text-[#111827]">행사일:</span> {row.eventDate || '-'}</div>
                                <div><span className="font-semibold text-[#111827]">장소:</span> {row.location || '-'}</div>
                                <div><span className="font-semibold text-[#111827]">예상인원:</span> {row.attendance || '-'}</div>
                                <div><span className="font-semibold text-[#111827]">예산:</span> {row.budget || '-'}</div>
                                {row.details && (
                                  <div className="pt-2">
                                    <span className="font-semibold text-[#111827]">요청사항:</span>
                                    <div className="mt-1 text-[#374151] bg-white border border-[#BAE6FD] rounded p-2 whitespace-pre-wrap text-xs leading-relaxed">
                                      {String(row.details)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right: status update */}
                            <div>
                              <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-3">상태 변경</h4>
                              <div className="flex gap-2 flex-wrap">
                                {(['신규', '확인', '완료'] as StatusType[]).map(s => (
                                  <button
                                    key={s}
                                    onClick={() => handleStatusUpdate(row.id, s)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                                      (row.status || '신규') === s
                                        ? 'bg-[#111827] text-white border-[#111827]'
                                        : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#F97316] hover:text-[#F97316]'
                                    }`}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                              <div className="mt-4">
                                <button
                                  onClick={() => handleDelete(row.id)}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-semibold transition-colors"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                                  </svg>
                                  삭제
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
