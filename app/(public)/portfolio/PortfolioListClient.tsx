"use client";
import Portfolio from '@/src/components/Portfolio';
import type { PortfolioPublicItem } from '@/src/lib/api-server';

export default function PortfolioListClient({ initialItems }: { initialItems: PortfolioPublicItem[] }) {
  return <Portfolio initialItems={initialItems} />;
}
