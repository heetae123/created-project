"use client";
import PortfolioDetail from '@/src/components/PortfolioDetail';
import type { PortfolioPublicItem } from '@/src/lib/api-server';

export default function PortfolioClient({
  id,
  initialItem,
}: {
  id: string;
  initialItem: PortfolioPublicItem | null;
}) {
  return <PortfolioDetail id={id} initialItem={initialItem} />;
}
