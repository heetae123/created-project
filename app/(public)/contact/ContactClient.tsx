"use client";
import dynamic from 'next/dynamic';
const ContactForm = dynamic(() => import('@/src/components/ContactForm'), { ssr: false });
export default function ContactClient() { return <ContactForm />; }
