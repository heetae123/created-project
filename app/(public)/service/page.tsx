import type { Metadata } from 'next';
import ServiceListClient from './ServiceListClient';

export const metadata: Metadata = {
  title: '서비스 소개',
  description: '마이파트너스의 다양한 이벤트 서비스를 소개합니다. 기념행사, 컨퍼런스, 프로모션, 공연/축제 등 전문 이벤트 기획 서비스를 제공합니다.',
  alternates: { canonical: 'https://maiptns.com/service' },
  openGraph: {
    title: '서비스 소개 | MAI PARTNERS',
    description: '마이파트너스의 다양한 이벤트 서비스를 소개합니다. 기념행사, 컨퍼런스, 프로모션, 공연/축제 등 전문 이벤트 기획 서비스를 제공합니다.',
    url: 'https://maiptns.com/service',
  },
};

export default function ServicePage() { return <ServiceListClient />; }
