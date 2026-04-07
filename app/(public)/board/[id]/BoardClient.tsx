"use client";
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const BoardDetail = dynamic(() => import('@/src/components/BoardDetail'), { ssr: false });

export default function BoardClient() {
  const { id } = useParams<{ id: string }>();
  return <BoardDetail id={id} />;
}
