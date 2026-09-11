"use client";
import Board from '@/src/components/Board';
import type { BoardPublicPost } from '@/src/lib/api-server';

export default function BoardListClient({ initialPosts }: { initialPosts: BoardPublicPost[] }) {
  return <Board initialPosts={initialPosts} />;
}
