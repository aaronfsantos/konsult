import { cn } from '@/lib/utils';
import * as React from 'react';

export function KonsultLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      {...props}
    >
      <path d="M6 6l6 6-6 6" />
      <path d="M17 18h-5" />
      <path d="M12 12h5" />
      <path d="M17 6h-5" />
    </svg>
  );
}
