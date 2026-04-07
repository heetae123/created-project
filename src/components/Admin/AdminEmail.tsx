import React, { useState, useEffect } from 'react';
import { adminGetSettings, adminSaveSettings } from '../../lib/admin-api';
import { useToast } from './shared/Toast';

interface EmailData {
  notificationEmail: string;
  enableNotification: boolean;
  smtpUser: string;
  smtpAppPassword: string;
}

const DEFAULT: EmailData = {
  notificationEmail: '',
  enableNotification: true,
  smtpUser: '',
  smtpAppPassword: '',
};

export default function AdminEmail() {
  const { showToast } = useToast();
  const [emailData, setEmailData] = useState<EmailData>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    adminGetSettings('email')
      .then((d: EmailData | null) => { if (d) setEmailData(prev => ({ ...prev, ...d })); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setEmail = (patch: Partial<EmailData>) => setEmailData(prev => ({ ...prev, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminSaveSettings('email', emailData);
      showToast('이메일 설정이 저장되었습니다.', 'success');
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
      <h2 className="text-2xl font-bold mb-1 text-[#111827]">이메일 설정</h2>
      <p className="text-sm text-[#6B7280] mb-6">문의 접수 시 알림을 받을 이메일과 발송 계정을 설정합니다.</p>

      {/* SMTP 설정 */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <span className="inline-block w-1 h-[18px] bg-[#F97316] rounded-[2px]" />
          Gmail SMTP 설정
        </div>

        <div className="bg-[rgba(249,115,22,0.08)] border border-[rgba(169,87,36,0.2)] rounded-lg px-4 py-3 mb-5 text-sm text-[#111827] leading-relaxed">
          <strong>Gmail 앱 비밀번호 발급 방법</strong><br />
          1. Google 계정 → <strong>보안</strong> → <strong>2단계 인증</strong> 활성화<br />
          2. 보안 → <strong>앱 비밀번호</strong> → 앱: 메일, 기기: 기타 선택 후 생성<br />
          3. 생성된 16자리 비밀번호를 아래에 입력 (공백 없이)
        </div>

        <div className="mb-[18px]">
          <label className="block text-sm font-semibold text-[#111827] mb-[7px]">Gmail 계정 (발신자)</label>
          <input
            type="email"
            value={emailData.smtpUser}
            onChange={e => setEmail({ smtpUser: e.target.value })}
            placeholder="yourmail@gmail.com"
            className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
          />
        </div>

        <div className="mb-[18px]">
          <label className="block text-sm font-semibold text-[#111827] mb-[7px]">앱 비밀번호 (16자리)</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={emailData.smtpAppPassword}
              onChange={e => setEmail({ smtpAppPassword: e.target.value })}
              placeholder="abcd efgh ijkl mnop"
              className="w-full px-[14px] py-[10px] pr-10 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 알림 설정 */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <span className="inline-block w-1 h-[18px] bg-[#F97316] rounded-[2px]" />
          알림 설정
        </div>

        <div className="mb-[18px]">
          <label className="block text-sm font-semibold text-[#111827] mb-[7px]">수신 이메일 주소</label>
          <input
            type="email"
            value={emailData.notificationEmail}
            onChange={e => setEmail({ notificationEmail: e.target.value })}
            placeholder="admin@mai-event.com"
            className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
          />
          <p className="mt-1.5 text-xs text-[#9CA3AF]">비워두면 발신 Gmail 계정으로 수신됩니다.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#111827] mb-[7px]">이메일 알림</label>
          <div className="flex items-center gap-[10px]">
            <label className="relative inline-block w-11 h-6 cursor-pointer">
              <input
                type="checkbox"
                checked={emailData.enableNotification}
                onChange={e => setEmail({ enableNotification: e.target.checked })}
                className="sr-only"
              />
              <span className={`absolute inset-0 rounded-xl transition-colors duration-200 ${emailData.enableNotification ? 'bg-[#F97316]' : 'bg-[#D1D5DB]'}`} />
              <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-200 ${emailData.enableNotification ? 'translate-x-5' : ''}`} />
            </label>
            <span
              className="text-sm font-medium cursor-pointer"
              onClick={() => setEmail({ enableNotification: !emailData.enableNotification })}
            >
              새 문의 접수 시 이메일 알림 받기
            </span>
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
