"use client";
import dynamic from 'next/dynamic';
const Home = dynamic(() => import('@/src/components/Home'), { ssr: false });
export default function HomeClient() { return <Home />; }
