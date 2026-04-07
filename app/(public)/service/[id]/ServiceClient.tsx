"use client";
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const ServiceDetail = dynamic(() => import('@/src/components/ServiceDetail'), { ssr: false });

export default function ServiceClient() {
  const { id } = useParams<{ id: string }>();
  return <ServiceDetail id={id} />;
}
