import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getSettings } from '../lib/api';

const TEAM_MAP: Record<string, string> = {
  planning: '기획·운영팀',
  design: '디자인팀',
  video: '영상팀',
  marketing: '마케팅팀',
};

const TEAM_DESCRIPTIONS: Record<string, string> = {
  planning: '아이디어를 현실로 만드는 기획 전문가들',
  design: '비주얼로 브랜드 가치를 높이는 디자이너들',
  video: '감동을 영상으로 담아내는 영상 전문가들',
  marketing: '브랜드를 세상에 알리는 마케팅 전문가들',
};

interface TeamMember {
  id?: number;
  name: string;
  role: string;
  image?: string;
  avatar?: string;
  team?: string;
  interview?: string;
}

export default function TeamInterview({ teamId: propTeamId }: { teamId?: string }) {
  const searchParams = useSearchParams();
  const teamId = propTeamId || searchParams.get('teamId') || '';
  const [members, setMembers] = useState<TeamMember[]>([]);
  const teamName = TEAM_MAP[teamId] || '';
  const teamDesc = TEAM_DESCRIPTIONS[teamId] || '';


  useEffect(() => {
    getSettings('team')
      .then(data => {
        if (Array.isArray(data)) {
          setMembers(data.filter((m: TeamMember) => m.team === teamName));
        }
      })
      .catch(() => {});
  }, [teamName]);

  if (!teamName) {
    return (
      <section className="pt-32 pb-24 bg-zinc-950 min-h-screen text-center">
        <p className="text-zinc-400 text-lg">팀을 찾을 수 없습니다.</p>
        <Link href="/team" className="text-[#F97316] mt-4 inline-block hover:underline">팀 목록으로 돌아가기</Link>
      </section>
    );
  }

  return (
    <section className="pt-32 pb-24 md:pt-40 md:pb-32 bg-zinc-950 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <Link href="/team" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-12 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">팀 목록으로</span>
        </Link>

        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-[#F97316]/10 border border-[#F97316]/20 mb-6"
          >
            <span className="text-[#F97316] font-bold text-sm tracking-wider">{teamName}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            팀 실무 인터뷰
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg"
          >
            {teamDesc}
          </motion.p>
        </div>

        <div className="space-y-16">
          {members.length === 0 ? (
            <p className="text-center text-zinc-500">등록된 인터뷰가 없습니다.</p>
          ) : (
            members.map((member, idx) => (
              <motion.div
                key={member.id || idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 flex-shrink-0">
                    <div className="aspect-square md:h-full">
                      <img
                        src={member.image || member.avatar}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <div className="flex-1 p-8 md:p-10">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                      <p className="text-[#F97316] font-medium text-sm">{member.role}</p>
                    </div>
                    <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {member.interview || '인터뷰 내용이 준비 중입니다.'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
