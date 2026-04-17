"use client";
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const BoardDetail = dynamic(() => import('@/src/components/BoardDetail'), { ssr: false });

export default function BoardViewClient() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const id = segments[segments.length - 1] ?? '';
  const boardId = id === 'view' ? '' : id;
  return <BoardDetail id={boardId} />;
}
