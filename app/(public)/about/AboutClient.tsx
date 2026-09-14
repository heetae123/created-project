"use client";
import About, { type MapInfo } from '@/src/components/About';

export default function AboutClient({ initialMap }: { initialMap: MapInfo }) {
  return <About initialMap={initialMap} />;
}
