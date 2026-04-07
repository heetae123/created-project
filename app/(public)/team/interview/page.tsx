import type { Metadata } from 'next';
import TeamInterviewClient from './TeamInterviewClient';

export const metadata: Metadata = {
  title: '팀 인터뷰',
  description: '마이파트너스 팀원들의 인터뷰를 확인하세요. 이벤트 기획 전문가들의 생생한 이야기를 들어보세요.',
  alternates: { canonical: 'https://maiptns.com/team/interview' },
  openGraph: {
    title: '팀 인터뷰 | MAI PARTNERS',
    description: '마이파트너스 팀원들의 인터뷰를 확인하세요. 이벤트 기획 전문가들의 생생한 이야기를 들어보세요.',
    url: 'https://maiptns.com/team/interview',
  },
};

export default function TeamInterviewPage() { return <TeamInterviewClient />; }
