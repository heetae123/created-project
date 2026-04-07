import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Download } from 'lucide-react';
import Link from 'next/link';
import { getSettings } from '../lib/api';


const defaultMap = {
  companyName: '마이파트너스 본사',
  address: '서울특별시 강남구 테헤란로 123, 넥서스 타워 15층',
  phone: '02-1234-5678',
  email: 'contact@mai-event.com',
  lat: 37.5000,
  lng: 127.0365,
};

interface AboutStyles {
  sectionTitleSize: number;
  sectionTitleColor: string;
  bodySize: number;
  bodyColor: string;
  accentColor: string;
}

const DEFAULT_ABOUT_STYLES: AboutStyles = {
  sectionTitleSize: 48,
  sectionTitleColor: '#18181B',
  bodySize: 18,
  bodyColor: '#525252',
  accentColor: '#F97316',
};

export default function About() {

  const [team, setTeam] = useState<any[]>([]);
  const [mapInfo, setMapInfo] = useState(defaultMap);
  const [brochureUrl, setBrochureUrl] = useState<string | null>(null);
  const [aboutStyles, setAboutStyles] = useState<AboutStyles>(DEFAULT_ABOUT_STYLES);

  useEffect(() => {
    Promise.all([
      getSettings('team'),
      getSettings('map'),
      getSettings('brochure'),
      getSettings('about_styles'),
    ])
      .then(([teamData, mapData, brochureData, stylesData]) => {
        if (Array.isArray(teamData) && teamData.length > 0) setTeam(teamData);
        if (mapData && mapData.lat && mapData.lng) setMapInfo({ ...defaultMap, ...mapData });
        if (brochureData && brochureData.url) setBrochureUrl(brochureData.url);
        if (stylesData && typeof stylesData === 'object') setAboutStyles({ ...DEFAULT_ABOUT_STYLES, ...stylesData });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="pb-24 overflow-hidden bg-white">
      {/* Part 1: Company Intro */}
      <section className="pt-48 pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-block font-bold text-sm tracking-widest uppercase"
              style={{ color: aboutStyles.accentColor }}
            >
              Company
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-black leading-tight"
              style={{ fontSize: aboutStyles.sectionTitleSize, color: aboutStyles.sectionTitleColor }}
            >
              상상을 현실로 만드는 <br />
              크리에이티브 파트너
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-medium leading-relaxed whitespace-pre-line"
              style={{ fontSize: aboutStyles.bodySize, color: aboutStyles.bodyColor }}
            >
              마이파트너스는 단순한 대행사가 아닙니다. 우리는 브랜드의 메시지를 가장 효과적으로 전달할 수 있는 공간과 시간을 설계합니다. 기획부터 연출, 실행까지 모든 과정에서 타협 없는 퀄리티를 추구하며, 관객에게 잊지 못할 감동을 선사합니다.
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              className="w-24 h-1 origin-left"
              style={{ backgroundColor: aboutStyles.accentColor }}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/greeting"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-[#F97316] hover:text-white text-zinc-600 font-bold text-sm rounded-full transition-all duration-300 border border-zinc-200 hover:border-[#F97316] group"
                >
                  <span>전체보기</span>
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = '/Mai_Partners_MICE_Introduce_2026_compressed.pdf';
                    link.download = 'MAI_Partners_회사소개서.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm rounded-full transition-all duration-300 shadow-lg shadow-[#F97316]/20 group active:scale-95 select-none"
                >
                  <Download className="w-4 h-4" />
                  <span>회사소개서 다운로드</span>
                </button>
              </div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:w-1/2 rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
              alt="Team 마이파트너스"
              loading="lazy"
              className="w-full aspect-video object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Part 2: Team Intro - Compact with expand */}
      <section className="py-24 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-block text-[#F97316] font-bold text-sm tracking-widest uppercase mb-4"
              >
                Our Team
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-black text-zinc-900"
              >
                최고의 전문가들이 함께합니다
              </motion.h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.filter(m => m.representative).map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 text-center group"
              >
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-zinc-50 group-hover:border-[#F97316]/20 transition-colors">
                  <img
                    src={member.image || member.avatar}
                    alt={member.name}
                    loading="lazy"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                {member.team && (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#F97316]/10 text-[#F97316] text-[10px] font-bold tracking-wider mb-2">{member.team}</span>
                )}
                <h4 className="text-xl font-black text-zinc-900 mb-2">{member.name}</h4>
                <p className="text-sm text-zinc-500 font-bold uppercase tracking-wider">{member.role}</p>
              </motion.div>
            ))}
          </div>

          {/* 전체보기 link */}
          <div className="mt-12 text-center">
            <Link
              href="/team"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-[#F97316] hover:text-white text-zinc-600 font-bold text-sm rounded-full transition-all duration-300 border border-zinc-200 hover:border-[#F97316] group"
            >
              <span>전체보기</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Part 3: Location */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-16">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-block text-[#F97316] font-bold text-sm tracking-widest uppercase mb-4"
            >
              Location
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black text-zinc-900 mb-6"
            >
              오시는 길
            </motion.h2>
            <p className="text-zinc-500 text-lg font-medium">마이파트너스와 함께 새로운 프로젝트를 시작해보세요. 언제든 환영합니다.</p>
          </div>

          <div className="bg-zinc-900 rounded-[40px] overflow-hidden flex flex-col-reverse lg:flex-row shadow-2xl">
            <div className="lg:w-1/2 p-12 lg:p-16 space-y-12 text-white">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-white/5 rounded-2xl">
                  <MapPin className="w-6 h-6 text-[#F97316]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2">주소</h4>
                  <p className="text-zinc-400 text-sm font-medium leading-relaxed whitespace-pre-line">{mapInfo.address}</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-white/5 rounded-2xl">
                  <Phone className="w-6 h-6 text-[#F97316]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2">전화</h4>
                  <p className="text-zinc-400 text-sm font-medium leading-relaxed">{mapInfo.phone}</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-white/5 rounded-2xl">
                  <Mail className="w-6 h-6 text-[#F97316]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2">이메일</h4>
                  <p className="text-zinc-400 text-sm font-medium leading-relaxed">{mapInfo.email}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <a
                  href={`https://map.kakao.com/link/map/${encodeURIComponent(mapInfo.companyName)},${mapInfo.lat},${mapInfo.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#FEE500] text-[#3C1E1E] rounded-xl text-sm font-bold hover:brightness-95 transition-all"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#3C1E1E"><path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67-.15.53-.96 3.4-.99 3.62 0 0-.02.17.09.24.11.06.24.01.24.01.32-.04 3.7-2.42 4.28-2.83.55.08 1.13.13 1.72.13 5.52 0 10-3.58 10-7.94S17.52 3 12 3z"/></svg>
                  카카오맵
                </a>
                <a
                  href={`https://map.naver.com/v5/search/${encodeURIComponent(mapInfo.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#03C75A] text-white rounded-xl text-sm font-bold hover:brightness-95 transition-all"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white"><path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/></svg>
                  네이버지도
                </a>
              </div>
            </div>
            <div className="lg:w-1/2 relative h-[400px] lg:h-auto min-h-[400px]">
              <iframe
                title="마이파트너스 오시는 길"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapInfo.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
