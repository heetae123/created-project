"use client";
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
const TeamInterview = dynamic(() => import('@/src/components/TeamInterview'), { ssr: false });

function Inner() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId') || '';
  return <TeamInterview teamId={teamId} />;
}

export default function TeamInterviewClient() {
  return <Suspense><Inner /></Suspense>;
}
