import { NextResponse } from 'next/server'

export async function GET() {
  // Return empty logs for simplicity in Next.js
  return NextResponse.json([])
}