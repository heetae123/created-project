import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <img
      src="/logo.png?v=2"
      alt="마이파트너스"
      className={`h-7 md:h-8 w-auto object-contain ${className}`}
    />
  );
}
