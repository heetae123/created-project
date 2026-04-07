"use client";
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const PortfolioDetail = dynamic(() => import('@/src/components/PortfolioDetail'), { ssr: false });

export default function PortfolioClient() {
  const { id } = useParams<{ id: string }>();
  return <PortfolioDetail id={id} />;
}
