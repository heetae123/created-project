"use client";
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const ServiceDetail = dynamic(() => import('@/src/components/ServiceDetail'), { ssr: false });

export default function ServiceClient() {
  const pathname = usePathname();
  const id = pathname.split('/').filter(Boolean).pop() ?? '';
  return <ServiceDetail id={id} />;
}
