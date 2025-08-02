import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const wordpressUrl = process.env.WORDPRESS_URL;
    const username = process.env.WORDPRESS_USERNAME;
    const password = process.env.WORDPRESS_PASSWORD;

    if (!wordpressUrl || !username || !password) {
      return NextResponse.json({
        error: 'WordPress configuration missing',
        config: {
          hasUrl: !!wordpressUrl,
          hasUsername: !!username,
          hasPassword: !!password
        }
      }, { status: 400 });
    }

    // Test multiple WordPress endpoints to diagnose the issue
    const endpoints = [
      { url: `${wordpressUrl}/wp-json/wp/v2/posts`, name: 'Posts API' },
      { url: `${wordpressUrl}/wp-json/`, name: 'REST API Root' },
      { url: `${wordpressUrl}/wp-json/wp/v2/`, name: 'API v2 Root' }
    ];

    let lastError = null;
    let successfulEndpoint = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing ${endpoint.name} at: ${endpoint.url}`);
        
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
          }
        });

        const responseText = await response.text();
        console.log(`${endpoint.name} response status: ${response.status}`);
        console.log(`${endpoint.name} response body:`, responseText.substring(0, 200));

        if (response.ok && !responseText.includes('<!DOCTYPE')) {
          successfulEndpoint = endpoint;
          break;
        } else {
          lastError = {
            endpoint: endpoint.name,
            status: response.status,
            body: responseText.substring(0, 200),
            isHtml: responseText.includes('<!DOCTYPE')
          };
        }
      } catch (error) {
        lastError = {
          endpoint: endpoint.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    if (successfulEndpoint) {
      return NextResponse.json({
        success: true,
        status: 200,
        message: `WordPress connection successful via ${successfulEndpoint.name}`,
        endpoint: successfulEndpoint.name
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'WordPress connection failed',
        lastError,
        suggestions: [
          'Check if WordPress REST API is enabled',
          'Verify the WordPress URL is correct (should be like https://your-site.com)',
          'Ensure username and password are correct',
          'Check if the user has proper permissions',
          'Try accessing the WordPress site directly in your browser',
          'Check if any security plugins are blocking API access'
        ]
      }, { status: 400 });
    }


  } catch (error) {
    console.error('WordPress test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to test WordPress connection'
    }, { status: 500 });
  }
} 