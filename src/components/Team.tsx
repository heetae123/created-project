import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { getSettings } from '../lib/api';
import { HighlightText } from '../lib/highlight';

const TEAMS = [
  { id: 'planning', name: '기획·운영팀', desc: '아이디어를 현실로 만드는 기획 전문가들' },
  { id: 'design', name: '디자인팀', desc: '비주얼로 브랜드 가치를 높이는 디자이너들' },
  { id: 'video', name: '영상팀', desc: '감동을 영상으로 담아내는 영상 전문가들' },
  { id: 'marketing', name: '마케팅팀', desc: '브랜드를 세상에 알리는 마케팅 전문가들' },
];

interface TeamMember {
  id?: number;
  name: string;
  role: string;
  image?: string;
  avatar?: string;
  team?: string;
}

interface TeamTexts {
  teamLabel?: string;
  teamTitle?: string;
  teamTitleSize?: number;
  teamColor?: string;
  teamDesc?: string;
  teamDescSize?: number;
}

export default function Team() {
  const [allMembers, setAllMembers] = useState<TeamMember[]>([]);
  const [texts, setTexts] = useState<TeamTexts>({});

  useEffect(() => {
    getSettings('team')
      .then(data => {
        if (Array.isArray(data)) setAllMembers(data);
      })
      .catch(() => {});
    getSettings('landing_texts')
      .then((data: TeamTexts | null) => { if (data) setTexts(data); })
      .catch(() => {});
  }, []);

  return (
    <section className="pt-32 pb-24 md:pt-40 md:pb-32 bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#F97316] font-bold tracking-widest text-sm uppercase mb-4 block"
          >
            {texts.teamLabel ?? 'Our Team'}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-bold mb-6"
            style={{ fontSize: texts.teamTitleSize || 48 }}
          >
            <HighlightText text={texts.teamTitle ?? '최고의 "전문가"들이 함께합니다'} color={texts.teamColor || '#F97316'} />
          </motion.h2>
          <p className="text-zinc-400 max-w-2xl mx-auto" style={{ fontSize: texts.teamDescSize || 16 }}>
            {texts.teamDesc ?? '마이파트너스의 각 분야 전문가들이 모여 당신의 상상을 현실로 만듭니다.'}
          </p>
        </div>

        <div className="space-y-24">
          {TEAMS.map((teamInfo, teamIdx) => {
            const members = allMembers.filter(m => m.team === teamInfo.name);
            if (members.length === 0) return null;

            return (
              <motion.div
                key={teamInfo.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: teamIdx * 0.05 }}
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-[#F97316] font-black text-3xl md:text-5xl tracking-tighter">
                      {teamInfo.name}
                    </h3>
                    <p className="text-zinc-400 text-lg md:text-xl font-bold tracking-tight">
                      {teamInfo.desc}
                    </p>
                  </div>
                  <Link
                    href={`/team/interview?teamId=${teamInfo.id}`}
                    className="hidden md:inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 border border-zinc-700 hover:border-[#F97316] text-zinc-400 hover:text-[#F97316] text-sm font-bold transition-all group shrink-0"
                  >
                    <span>팀 실무 인터뷰</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {members.map((member, i) => (
                    <motion.div
                      key={member.id || i}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="text-center group"
                    >
                      <div className="w-32 h-32 md:w-48 md:h-48 mx-auto rounded-full overflow-hidden mb-6 border-4 border-zinc-900 group-hover:border-[#F97316] transition-colors duration-300">
                        <img
                          src={member.image || member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                      <p className="text-zinc-500 text-sm">{member.role}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                  <Link
                    href={`/team/interview?teamId=${teamInfo.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-700 hover:border-[#F97316] text-zinc-400 hover:text-[#F97316] text-sm font-medium transition-all group"
                  >
                    <span>팀 실무 인터뷰</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>

                {teamIdx < TEAMS.length - 1 && (
                  <div className="mt-16 border-t border-zinc-800/50" />
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-full transition-all group"
          >
            <span className="font-bold">프로젝트 문의하기</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
