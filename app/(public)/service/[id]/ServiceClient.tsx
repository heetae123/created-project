"use client";
import ServiceDetail from '@/src/components/ServiceDetail';

export default function ServiceClient({ id }: { id: string }) {
  return <ServiceDetail id={id} />;
}
