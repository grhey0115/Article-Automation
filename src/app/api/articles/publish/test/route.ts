import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Publish endpoint is accessible',
    timestamp: new Date().toISOString()
  });
} 