import { NextResponse } from 'next/server'

export async function GET() {
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
  
  return NextResponse.json({
    month: currentMonth,
    articlesGenerated: 0,
    apiCalls: 0,
    wordsGenerated: 0
  })
}