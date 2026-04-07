"use client";
import dynamic from 'next/dynamic';
const Greeting = dynamic(() => import('@/src/components/Greeting'), { ssr: false });
export default function GreetingClient() { return <Greeting />; }
