"use client";
import dynamic from 'next/dynamic';
const Board = dynamic(() => import('@/src/components/Board'), { ssr: false });
export default function BoardListClient() { return <Board />; }
