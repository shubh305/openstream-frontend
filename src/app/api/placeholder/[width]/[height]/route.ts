import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ width: string; height: string }> }
) {
  const { width, height } = await params;
  
  const w = parseInt(width) || 320;
  const h = parseInt(height) || 180;
  
  const svg = `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="${h}" fill="#1a1a1a"/>
      <rect x="0" y="0" width="${w}" height="${h}" fill="none" stroke="#333" stroke-width="2"/>
      <text x="50%" y="50%" font-family="monospace" font-size="14" fill="#666" text-anchor="middle" dy=".3em">
        ${w} x ${h}
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
