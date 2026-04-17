"use client";
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const PortfolioDetail = dynamic(() => import('@/src/components/PortfolioDetail'), { ssr: false });

export default function PortfolioViewClient() {
  const pathname = usePathname();
  // Firebase rewrite로 이 페이지가 서빙될 때 실제 URL(/portfolio/새아이디)에서 ID 추출
  const id = pathname.split('/').filter(Boolean).pop() ?? '';
  return <PortfolioDetail id={id} />;
}
