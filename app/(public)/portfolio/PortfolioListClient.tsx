"use client";
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
const Portfolio = dynamic(() => import('@/src/components/Portfolio'), { ssr: false });
export default function PortfolioListClient() { return <Suspense><Portfolio /></Suspense>; }
