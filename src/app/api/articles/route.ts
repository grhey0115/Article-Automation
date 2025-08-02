import { NextRequest, NextResponse } from 'next/server'
import { generateArticleContent } from '@/lib/ai-service'
import { publishToWordPress } from '@/lib/wordpress-service'

// In-memory storage for simplicity
const articles = new Map()

export async function GET() {
  try {
    const allArticles = Array.from(articles.values()).sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(allArticles)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Create article
    const article = {
      title: data.title,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags || '').split(',').map((t: string) => t.trim()),
      category: data.category,
      wordCount: data.wordCount || 6000,
      tone: data.tone || 'professional',
      additionalInstructions: data.additionalInstructions,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      wordpressId: null,
      content: null
    }
    
    articles.set(article.id, article)
    
    // Process in background
    processArticle(article).catch(console.error)
    
    return NextResponse.json(article)
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json({ error: 'Invalid article data' }, { status: 400 })
  }
}

async function processArticle(article: any) {
  try {
    // Update status
    article.status = 'generating'
    articles.set(article.id, article)

    // Generate content using AI service
    const content = await generateArticleContent({
      title: article.title,
      wordCount: article.wordCount,
      tone: article.tone,
      tags: article.tags,
      category: article.category,
      additionalInstructions: article.additionalInstructions
    })

    // Add page breaks
    const processedContent = addPageBreaks(content)

    // Update article with content
    article.content = processedContent
    article.wordCount = content.split(/\s+/).length
    article.status = 'publishing'
    articles.set(article.id, article)

    // Publish to WordPress
    const wordpressId = await publishToWordPress({
      title: article.title,
      content: processedContent,
      tags: article.tags,
      category: article.category,
      status: 'draft'
    })

    // Final update
    article.wordpressId = wordpressId
    article.status = 'completed'
    article.updatedAt = new Date().toISOString()
    articles.set(article.id, article)

  } catch (error) {
    console.error('Processing error:', error)
    article.status = 'failed'
    article.updatedAt = new Date().toISOString()
    articles.set(article.id, article)
  }
}

function addPageBreaks(content: string): string {
  if (!content) return ""
  
  const words = content.split(/\s+/)
  const wordsPerPage = 1200
  let result = ""
  let wordCount = 0

  for (const word of words) {
    result += word + " "
    wordCount++
    
    if (wordCount >= wordsPerPage) {
      result += "\n<!--nextpage-->\n"
      wordCount = 0
    }
  }
  
  return result.trim()
}