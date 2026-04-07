"use client";
import dynamic from 'next/dynamic';
const About = dynamic(() => import('@/src/components/About'), { ssr: false });
export default function AboutClient() { return <About />; }
