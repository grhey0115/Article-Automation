import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      isConfigured: true,
      wordpressUrl: 'https://allactionalarm.com',
      hasAIKey: !!process.env.DEEPSEEK_API_KEY,
      aiProvider: 'deepseek',
      aiModel: 'deepseek-chat',
      hasWordPressCredentials: true
    })
  } catch (error) {
    console.error('Configuration API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Configuration is handled via environment variables
    return NextResponse.json({
      isConfigured: true,
      wordpressUrl: 'https://allactionalarm.com',
      hasAIKey: !!process.env.DEEPSEEK_API_KEY,
      aiProvider: 'deepseek',
      aiModel: 'deepseek-chat',
      hasWordPressCredentials: true
    })
  } catch (error) {
    console.error('Configuration API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}