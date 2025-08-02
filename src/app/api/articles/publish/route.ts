import { NextRequest, NextResponse } from 'next/server';
import { publishToWordPress } from '@/lib/wordpress-service';
import { marked } from 'marked';

// Helper function to generate tags from content
function generateTagsFromContent(content: string, title: string): string[] {
  const words = content.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
  const titleWords = title.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
  
  // Common words to exclude
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
  
  // Count word frequency
  const wordCount: { [key: string]: number } = {};
  [...words, ...titleWords].forEach(word => {
    if (word.length > 3 && !stopWords.has(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  // Get top 5 most frequent words as tags
  const sortedWords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
  
  return sortedWords;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, markdown, tags, category, status = 'draft' } = body;

    console.log('Publishing article:', { title, category, status, contentLength: markdown?.length });

    if (!title || !markdown || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate tags if not provided or if less than 3 tags
    let finalTags = Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean);
    if (finalTags.length < 3) {
      const generatedTags = generateTagsFromContent(markdown, title);
      finalTags = [...new Set([...finalTags, ...generatedTags])].slice(0, 5);
      console.log('Generated tags:', finalTags);
    }

    // Convert Markdown to HTML
    const html = await marked.parse(markdown);
    console.log('Markdown converted to HTML, length:', html.length);

    // Publish to WordPress
    const postId = await publishToWordPress({
      title,
      content: html,
      tags: finalTags,
      category,
      status
    });

    // Generate the WordPress admin draft editor URL
    const wpUrl = process.env.WORDPRESS_URL || 'https://your-wordpress-site.com';
    const adminUrl = `${wpUrl}/wp-admin/post.php?post=${postId}&action=edit`;

    console.log('Article published successfully with ID:', postId, 'Admin URL:', adminUrl);
    return NextResponse.json({ postId, url: adminUrl });
  } catch (error) {
    console.error('Publishing error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 