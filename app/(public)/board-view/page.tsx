import type { Metadata } from 'next';
import BoardViewClient from './BoardViewClient';

export const metadata: Metadata = {
  title: '게시판',
  robots: { index: false },
};

export default function BoardViewPage() {
  return <BoardViewClient />;
}
