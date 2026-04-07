"use client";
import dynamic from 'next/dynamic';
const Service = dynamic(() => import('@/src/components/Service'), { ssr: false });
export default function ServiceListClient() { return <Service />; }
