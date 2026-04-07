import React, { useState, useEffect } from 'react';
import { adminGetSettings, adminSaveSettings } from '../../lib/admin-api';
import { useToast } from './shared/Toast';

interface MapData {
  companyName: string;
  address: string;
  lat: number | null;
  lng: number | null;
  phone: string;
  email: string;
  bizLicense: string;
}

const DEFAULT: MapData = {
  companyName: '마이파트너스 본사',
  address: '서울특별시 강남구 테헤란로 123, 넥서스 타워 15층',
  lat: 37.5000,
  lng: 127.0365,
  phone: '02-1234-5678',
  email: 'contact@mai-event.com',
  bizLicense: '123-45-67890',
};

export default function AdminMap() {
  const { showToast } = useToast();
  const [data, setData] = useState<MapData>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState('');

  useEffect(() => {
    adminGetSettings('map')
      .then((d: MapData | null) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (patch: Partial<MapData>) => setData(prev => ({ ...prev, ...patch }));

  const handleGeocode = async () => {
    if (!data.address.trim()) {
      showToast('주소를 입력하세요.', 'error');
      return;
    }
    setGeocoding(true);
    setGeocodeStatus('검색 중...');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.address)}&limit=1`,
        { headers: { 'Accept-Language': 'ko' } }
      );
      const results = await res.json();
      if (results && results.length > 0) {
        const { lat, lon } = results[0];
        set({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setGeocodeStatus(`위치 찾음: ${parseFloat(lat).toFixed(6)}, ${parseFloat(lon).toFixed(6)}`);
        showToast('위치가 설정되었습니다.', 'success');
      } else {
        setGeocodeStatus('주소를 찾을 수 없습니다.');
        showToast('주소를 찾을 수 없습니다.', 'error');
      }
    } catch {
      setGeocodeStatus('검색 실패');
      showToast('위치 검색에 실패했습니다.', 'error');
    } finally {
      setGeocoding(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminSaveSettings('map', data);
      showToast('오시는 길 설정이 저장되었습니다.', 'success');
    } catch {
      showToast('저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const mapSrc =
    data.lat && data.lng
      ? `https://www.google.com/maps?q=${data.lat},${data.lng}&z=15&output=embed`
      : null;

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
      <h2 className="text-2xl font-bold mb-1 text-[#111827]">오시는 길 설정</h2>
      <p className="text-sm text-[#6B7280] mb-6">메인 사이트의 '오시는 길' 섹션에 표시될 회사 위치 정보를 설정합니다.</p>

      {/* Location info */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <span className="inline-block w-1 h-[18px] bg-[#F97316] rounded-[2px]" />
          위치 정보
        </div>

        <div className="mb-[18px]">
          <label className="block text-sm font-semibold text-[#111827] mb-[7px]">회사/장소 이름</label>
          <input
            type="text"
            value={data.companyName}
            onChange={e => set({ companyName: e.target.value })}
            placeholder="마이파트너스 본사"
            className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#111827] mb-[7px]">주소</label>
          <input
            type="text"
            value={data.address}
            onChange={e => set({ address: e.target.value })}
            placeholder="서울특별시 강남구 테헤란로 123, 넥서스 타워 15층"
            className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
          />
        </div>

        <div className="flex items-center gap-[10px] mb-4">
          <button
            onClick={handleGeocode}
            disabled={geocoding}
            className="inline-flex items-center gap-2 px-[18px] py-[9px] bg-gray-100 hover:bg-gray-200 text-[#111827] border border-[#E5E7EB] rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            {geocoding ? '검색 중...' : '주소로 위치 검색'}
          </button>
          {geocodeStatus && (
            <span className="text-[0.8rem] text-[#6B7280]">{geocodeStatus}</span>
          )}
        </div>

        {data.lat && data.lng && (
          <div className="flex gap-4 mb-4">
            <div className="text-sm text-[#6B7280]">
              <span className="font-semibold text-[#111827]">위도:</span> {data.lat.toFixed(6)}
            </div>
            <div className="text-sm text-[#6B7280]">
              <span className="font-semibold text-[#111827]">경도:</span> {data.lng.toFixed(6)}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-[7px]">전화번호</label>
            <input
              type="text"
              value={data.phone}
              onChange={e => set({ phone: e.target.value })}
              placeholder="02-1234-5678"
              className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-[7px]">이메일</label>
            <input
              type="email"
              value={data.email}
              onChange={e => set({ email: e.target.value })}
              placeholder="contact@mai-event.com"
              className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#111827] mb-[7px]">사업자 등록번호</label>
          <input
            type="text"
            value={data.bizLicense}
            onChange={e => set({ bizLicense: e.target.value })}
            placeholder="123-45-67890"
            className="w-full px-[14px] py-[10px] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:border-[#F97316] focus:ring-[3px] focus:ring-[rgba(249,115,22,0.1)]"
          />
        </div>
      </div>

      {/* Map preview */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.04] mb-5">
        <div className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <span className="inline-block w-1 h-[18px] bg-[#F97316] rounded-[2px]" />
          지도 미리보기
        </div>
        <div className="rounded-xl overflow-hidden border border-[#E5E7EB] h-[300px] bg-[#E5E7EB]">
          {mapSrc ? (
            <iframe
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="지도 미리보기"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-[#6B7280]">
              주소를 검색하면 지도가 표시됩니다.
            </div>
          )}
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
