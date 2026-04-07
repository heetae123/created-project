import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { getSettings } from '../lib/api';

const defaultInfo = {
  companyName: '마이파트너스',
  address: '서울특별시 강남구 테헤란로 123, 넥서스 타워 15층',
  phone: '02-1234-5678',
  email: 'contact@mai-event.com',
  bizLicense: '123-45-67890',
};

export default function Footer() {
  const [info, setInfo] = useState(defaultInfo);

  useEffect(() => {
    getSettings('map')
      .then((data: any) => {
        if (data) {
          setInfo({
            companyName: data.companyName || defaultInfo.companyName,
            address: data.address || defaultInfo.address,
            phone: data.phone || defaultInfo.phone,
            email: data.email || defaultInfo.email,
            bizLicense: data.bizLicense || defaultInfo.bizLicense,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start gap-20">
        <div className="space-y-10 max-w-sm">
          <Link href="/" className="inline-block">
            <Logo className="h-16 md:h-20" color="#F97316" />
          </Link>
          <p className="text-zinc-500 text-base font-medium leading-relaxed">
            상상을 현실로 만드는 크리에이티브 파트너. <br />
            당신의 비전이 현실이 되는 무대를 선물합니다.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end space-y-10">
          <div className="flex space-x-12 text-[11px] font-black tracking-[0.2em] text-zinc-400 uppercase">
            <Link href="#" className="hover:text-[#F97316] transition-colors">이용약관</Link>
            <Link href="#" className="hover:text-[#F97316] transition-colors">개인정보처리방침</Link>
            <Link href="/contact" className="hover:text-[#F97316] transition-colors">문의하기</Link>
          </div>
          <div className="text-right">
            <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em] mb-3">
              © {new Date().getFullYear()} {info.companyName}. All rights reserved.
            </p>
            <p className="text-zinc-500 text-xs font-medium leading-relaxed whitespace-pre-line">
              {info.address} <br />
              Tel: {info.phone} | Email: {info.email} <br />
              Business License: {info.bizLicense}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
