import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M65 40C65 53.8071 53.8071 65 40 65H25C21.6863 65 19 62.3137 19 59V21C19 17.6863 21.6863 15 25 15H40C53.8071 15 65 26.1929 65 40Z"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        d="M30 35V45"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M40 30V50"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M50 25V55"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
