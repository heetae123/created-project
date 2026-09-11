"use client";
import BoardDetail from '@/src/components/BoardDetail';
import type { BoardPublicPost } from '@/src/lib/api-server';

export default function BoardClient({
  id,
  initialPost,
}: {
  id: string;
  initialPost: BoardPublicPost | null;
}) {
  return <BoardDetail id={id} initialPost={initialPost} />;
}
