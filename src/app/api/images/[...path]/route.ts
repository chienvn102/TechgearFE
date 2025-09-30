// API route to proxy images from backend
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path.join('/');
    const backendUrl = `http://localhost:3000/uploads/${imagePath}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'NextJS-Proxy',
      },
    });
    
    if (!response.ok) {
      return new NextResponse(`Image not found: ${response.statusText}`, { status: 404 });
    }
    
    const buffer = await response.arrayBuffer();
    const headers = new Headers();
    
    // Copy content type from backend
    const contentType = response.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
    
    // Add cache headers
    headers.set('Cache-Control', 'public, max-age=3600');
    
    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
