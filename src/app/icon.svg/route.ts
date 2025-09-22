import { NextResponse } from 'next/server';

export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0080FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 6l6 6-6 6" />
      <path d="M17 18h-5" />
      <path d="M12 12h5" />
      <path d="M17 6h-5" />
    </svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
}
