import React, { useState } from 'react';
import { auth } from '../../lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { useToast } from './shared/Toast';

export default function AdminPassword() {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('새 비밀번호가 일치하지 않습니다.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('비밀번호는 6자 이상이어야 합니다.', 'error');
      return;
    }
    const user = auth.currentUser;
    if (!user || !user.email) {
      showToast('로그인 정보를 확인할 수 없습니다.', 'error');
      return;
    }
    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      showToast('비밀번호가 변경되었습니다.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        showToast('현재 비밀번호가 올바르지 않습니다.', 'error');
      } else {
        showToast('비밀번호 변경에 실패했습니다.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1 text-[#111827]">비밀번호 변경</h2>
      <p className="text-sm text-[#6B7280] mb-6">관리자 계정의 로그인 비밀번호를 변경합니다.</p>

      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-[7px]">현재 비밀번호</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호 입력"
              required
              className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-[7px]">새 비밀번호</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="새 비밀번호 입력 (6자 이상)"
              required
              className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-[7px]">새 비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호 재입력"
              required
              className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-[18px] py-[9px] bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 mt-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            {saving ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>
    </div>
  );
}
