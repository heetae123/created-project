"use client";
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const PortfolioDetail = dynamic(() => import('@/src/components/PortfolioDetail'), { ssr: false });

export default function PortfolioClient() {
  const pathname = usePathname();
  const id = pathname.split('/').filter(Boolean).pop() ?? '';
  return <PortfolioDetail id={id} />;
}
