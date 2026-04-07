"use client";
import dynamic from 'next/dynamic';
const Team = dynamic(() => import('@/src/components/Team'), { ssr: false });
export default function TeamClient() { return <Team />; }
