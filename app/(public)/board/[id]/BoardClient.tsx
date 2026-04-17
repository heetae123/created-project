"use client";
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const BoardDetail = dynamic(() => import('@/src/components/BoardDetail'), { ssr: false });

export default function BoardClient() {
  const pathname = usePathname();
  const id = pathname.split('/').filter(Boolean).pop() ?? '';
  return <BoardDetail id={id} />;
}
