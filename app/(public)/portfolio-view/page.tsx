import type { Metadata } from 'next';
import PortfolioViewClient from './PortfolioViewClient';

export const metadata: Metadata = {
  title: '포트폴리오',
  robots: { index: false },
};

export default function PortfolioViewPage() {
  return <PortfolioViewClient />;
}
