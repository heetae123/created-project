import React, { useState, useEffect } from 'react';
import { adminGetSettings, getInquiries } from '../../lib/admin-api';
import { getPortfolioList } from '../../lib/api';
import { ToastProvider, useToast } from './shared/Toast';

function DashboardInner() {
  const [newInquiries, setNewInquiries] = useState(0);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [inquiries, portfolio, team] = await Promise.all([
        getInquiries(),
        getPortfolioList(),
        adminGetSettings('mai_team'),
      ]);

      const newCount = (inquiries || []).filter(
        (i: any) => i.status === '신규' || !i.status
      ).length;
      setNewInquiries(newCount);

      setPortfolioCount(portfolio.length);

      const teamArr = Array.isArray(team) ? team : [];
      setTeamCount(teamArr.length);

      // Newest first, max 5
      const sorted = [...(inquiries || [])].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
      setRecentInquiries(sorted.slice(0, 5));
    } catch (e) {
      showToast('데이터를 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function statusBadge(status: string) {
    const s = status || '신규';
    const map: Record<string, string> = {
      '신규': 'bg-[rgba(249,115,22,0.12)] text-[#F97316]',
      '진행중': 'bg-blue-50 text-blue-600',
      '완료': 'bg-emerald-50 text-emerald-600',
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-[0.7rem] font-semibold ${map[s] || 'bg-gray-100 text-gray-500'}`}>
        {s}
      </span>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#111827] mb-1">안녕하세요, 관리자님</h2>
      <p className="text-sm text-[#6B7280] mb-6">마이파트너스 Admin Dashboard에 오신 것을 환영합니다.</p>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* New inquiries */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FEF3C7' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <div className="text-xs text-[#6B7280] font-medium mb-1">새 문의</div>
            <div className="text-2xl font-bold text-[#111827]">{loading ? '—' : `${newInquiries}건`}</div>
          </div>
        </div>

        {/* Portfolio */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#ECFDF5' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
          </div>
          <div>
            <div className="text-xs text-[#6B7280] font-medium mb-1">포트폴리오 항목</div>
            <div className="text-2xl font-bold text-[#111827]">{loading ? '—' : `${portfolioCount}개`}</div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#EDE9FE' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <div className="text-xs text-[#6B7280] font-medium mb-1">팀원 수</div>
            <div className="text-2xl font-bold text-[#111827]">{loading ? '—' : `${teamCount}명`}</div>
          </div>
        </div>
      </div>

      {/* Recent inquiries */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F97316] shrink-0" />
          <span className="text-sm font-semibold text-[#111827]">최근 문의 (최대 5건)</span>
          <button
            onClick={loadDashboardData}
            className="ml-auto text-xs text-[#6B7280] hover:text-[#F97316] transition-colors"
          >
            새로고침
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3 text-[#9CA3AF]">
            <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <p className="text-sm">불러오는 중...</p>
          </div>
        ) : recentInquiries.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-[#9CA3AF]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 opacity-40">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p className="text-sm">아직 접수된 문의가 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] whitespace-nowrap">상태</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] whitespace-nowrap">업체명</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] whitespace-nowrap">담당자</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] whitespace-nowrap">행사명</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] whitespace-nowrap">접수일</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.map((inq, idx) => (
                  <tr key={inq.id || idx} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3">{statusBadge(inq.status)}</td>
                    <td className="px-4 py-3 font-medium text-[#111827]">{inq.companyName || inq.company || '-'}</td>
                    <td className="px-4 py-3 text-[#374151]">{inq.contactPerson || inq.name || '-'}</td>
                    <td className="px-4 py-3 text-[#374151] max-w-[200px] truncate">{inq.eventName || '-'}</td>
                    <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">
                      {inq.createdAt
                        ? new Date(inq.createdAt).toLocaleDateString('ko-KR')
                        : (inq.date || '-')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ToastProvider>
      <DashboardInner />
    </ToastProvider>
  );
}
