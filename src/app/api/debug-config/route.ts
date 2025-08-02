import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const config = {
      wordpressUrl: process.env.WORDPRESS_URL,
      wordpressUsername: process.env.WORDPRESS_USERNAME,
      wordpressPassword: process.env.WORDPRESS_PASSWORD ? '***SET***' : '***NOT SET***',
      deepseekApiKey: process.env.DEEPSEEK_API_KEY ? '***SET***' : '***NOT SET***',
      openaiApiKey: process.env.OPENAI_API_KEY ? '***SET***' : '***NOT SET***'
    };

    // Check if WordPress URL is properly formatted
    const urlIssues = [];
    if (config.wordpressUrl) {
      if (!config.wordpressUrl.startsWith('http://') && !config.wordpressUrl.startsWith('https://')) {
        urlIssues.push('WordPress URL should start with http:// or https://');
      }
      if (config.wordpressUrl.endsWith('/')) {
        urlIssues.push('WordPress URL should not end with a slash');
      }
      if (config.wordpressUrl.includes('/wp-admin')) {
        urlIssues.push('WordPress URL should not include /wp-admin');
      }
    }

    return NextResponse.json({
      success: true,
      config,
      issues: {
        missingConfig: !config.wordpressUrl || !config.wordpressUsername || !process.env.WORDPRESS_PASSWORD,
        urlIssues,
        suggestions: [
          'Make sure your .env.local file exists in the project root',
          'WordPress URL should be like: https://your-site.com',
          'Use Application Password from WordPress, not your regular password',
          'Check that WordPress REST API is enabled'
        ]
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 