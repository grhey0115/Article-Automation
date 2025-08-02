// WordPress service for Next.js
export async function publishToWordPress(params: {
  title: string;
  content: string;
  category: string;
  tags: string[];
  status?: 'draft' | 'publish';
}): Promise<number> {
  const { title, content, category, tags, status = 'draft' } = params;

  // Check if WordPress configuration is available
  const wordpressUrl = process.env.WORDPRESS_URL;
  const username = process.env.WORDPRESS_USERNAME;
  const password = process.env.WORDPRESS_PASSWORD;

  if (!wordpressUrl || !username || !password) {
    console.error('WordPress configuration is missing');
    throw new Error('WordPress configuration is required for publishing. Please check your .env.local file.');
  }

      // Validate WordPress URL format
    if (!wordpressUrl.startsWith('http://') && !wordpressUrl.startsWith('https://')) {
      throw new Error('WordPress URL must start with http:// or https://');
    }

    // Test WordPress REST API availability first
    try {
      console.log(`Testing WordPress connection to: ${wordpressUrl}/wp-json/wp/v2/posts`);
      console.log(`Using credentials: ${username} (password length: ${password.length})`);
      
      const testResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/posts`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
        }
      });

      const testText = await testResponse.text();
      console.log(`WordPress test response status: ${testResponse.status}`);
      console.log(`WordPress test response body:`, testText.substring(0, 500));

      if (!testResponse.ok) {
        if (testText.includes('<!DOCTYPE')) {
          throw new Error(`WordPress REST API not found at ${wordpressUrl}/wp-json/wp/v2/posts. Please check if:\n1. WordPress REST API is enabled\n2. The URL is correct\n3. You can access ${wordpressUrl}/wp-json/ in your browser`);
        } else if (testResponse.status === 404) {
          throw new Error(`WordPress REST API endpoint not found. Please verify:\n1. WordPress is properly installed\n2. REST API is enabled\n3. The URL ${wordpressUrl} is correct`);
        } else {
          throw new Error(`WordPress API test failed with status ${testResponse.status}: ${testText.substring(0, 200)}`);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error(`Cannot connect to WordPress at ${wordpressUrl}. Please check:\n1. The URL is correct and accessible\n2. WordPress is running\n3. No firewall is blocking the connection`);
      }
      throw error;
    }

  try {
    // Process content for WordPress compatibility
    const processedContent = processContentForWordPress(content);
    
    // Generate SEO metadata
    const focusKeyphrase = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const metaDescription = `Discover the best ${title.toLowerCase()} in 2025. Learn about features, benefits, and top recommendations for ${focusKeyphrase}. Expert guide with detailed reviews and comparisons.`;
    
    // Process category - get or create
    let categoryId: number;
    try {
      console.log(`Fetching category: ${category} from ${wordpressUrl}/wp-json/wp/v2/categories`);
      const categoryResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/categories?slug=${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
        }
      });

      console.log(`Category response status: ${categoryResponse.status}`);
      
      if (categoryResponse.ok) {
        const responseText = await categoryResponse.text();
        console.log(`Category response body:`, responseText.substring(0, 200) + '...');
        
        try {
          const categories = JSON.parse(responseText);
          if (categories.length > 0) {
            categoryId = categories[0].id;
          } else {
            // Create new category
            const createCategoryResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/categories`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
              },
              body: JSON.stringify({
                name: category,
                slug: category.toLowerCase().replace(/\s+/g, '-')
              })
            });

            if (createCategoryResponse.ok) {
              const newCategory = await createCategoryResponse.json();
              categoryId = newCategory.id;
            } else {
              console.error('Failed to create category:', await createCategoryResponse.text());
              categoryId = 1; // Default category
            }
          }
        } catch (parseError) {
          console.error('Failed to parse category response as JSON:', responseText);
          categoryId = 1; // Default category
        }
      } else {
        console.error('Failed to fetch categories:', await categoryResponse.text());
        categoryId = 1; // Default category
      }
    } catch (error) {
      console.error('Error processing category:', error);
      categoryId = 1; // Default category
    }

    // Process tags - limit to 5 tags and get or create them
    const tagIds: number[] = [];
    const limitedTags = tags.slice(0, 5); // Limit to 5 tags
    
    for (const tag of limitedTags) {
      try {
        const tagResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/tags?slug=${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
          }
        });

        if (tagResponse.ok) {
          const responseText = await tagResponse.text();
          console.log(`Tag response body for "${tag}":`, responseText.substring(0, 200) + '...');
          
          try {
            const tags = JSON.parse(responseText);
            if (tags.length > 0) {
              tagIds.push(tags[0].id);
            } else {
            // Create new tag
            const createTagResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/tags`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
              },
              body: JSON.stringify({
                name: tag,
                slug: tag.toLowerCase().replace(/\s+/g, '-')
              })
            });

            if (createTagResponse.ok) {
              const newTag = await createTagResponse.json();
              tagIds.push(newTag.id);
            } else {
              console.error(`Failed to create tag "${tag}":`, await createTagResponse.text());
            }
          }
        } catch (parseError) {
          console.error(`Failed to parse tag response as JSON for "${tag}":`, responseText);
        }
      } else {
        console.error(`Failed to fetch tag "${tag}":`, await tagResponse.text());
      }
      } catch (error) {
        console.error(`Error processing tag "${tag}":`, error);
      }
    }

    // Create the post with SEO metadata
    const postData = {
      title: title,
      content: processedContent,
      status: status,
      categories: [categoryId],
      tags: tagIds,
      // Add SEO metadata as custom fields
      meta: {
        '_yoast_wpseo_focuskw': focusKeyphrase,
        '_yoast_wpseo_metadesc': metaDescription,
        '_yoast_wpseo_title': `${title} - Best Guide 2025`,
        '_yoast_wpseo_is_cornerstone': 'on',
        '_yoast_wpseo_meta-robots-noindex': '0',
        '_yoast_wpseo_meta-robots-nofollow': '0',
        '_yoast_wpseo_meta-robots-adv': 'none',
        '_yoast_wpseo_meta-robots-max-snippet': '-1',
        '_yoast_wpseo_meta-robots-max-imagepreview': 'large',
        '_yoast_wpseo_meta-robots-max-videopreview': '-1'
      }
    };

    console.log('Creating WordPress post with data:', {
      title,
      categoryId,
      tagIds,
      contentLength: processedContent.length,
      focusKeyphrase,
      metaDescription
    });
    
    console.log(`Attempting to create WordPress post at: ${wordpressUrl}/wp-json/wp/v2/posts`);
    console.log(`Using credentials: ${username} (password length: ${password.length})`);
    
    const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
      },
      body: JSON.stringify(postData)
    });

    console.log(`WordPress API response status: ${response.status}`);
    console.log(`WordPress API response headers:`, Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const responseText = await response.text();
      console.log(`WordPress API response body:`, responseText.substring(0, 500) + '...');
      
      try {
        const post = JSON.parse(responseText);
        console.log(`WordPress post created successfully: ${post.id}`);
        return post.id;
      } catch (parseError) {
        console.error(`Failed to parse WordPress response as JSON:`, responseText);
        throw new Error(`WordPress API returned invalid JSON: ${responseText.substring(0, 200)}`);
      }
    } else {
      const errorText = await response.text();
      console.error(`WordPress API error: ${response.status} - ${errorText}`);
      
      // Provide more specific error messages
      if (response.status === 401) {
        throw new Error('WordPress authentication failed. Please check your username and password in .env.local');
      } else if (response.status === 404) {
        throw new Error('WordPress API endpoint not found. Please check your WordPress URL in .env.local');
      } else if (response.status === 403) {
        throw new Error('WordPress access denied. Please check your user permissions.');
      } else if (errorText.includes('<!DOCTYPE')) {
        throw new Error('WordPress returned HTML instead of JSON. This usually means the URL is incorrect or WordPress is not properly configured.');
      } else {
        throw new Error(`WordPress API error: ${response.status} - ${errorText}`);
      }
    }
  } catch (error) {
    console.error('WordPress publishing error:', error);
    throw new Error(`Failed to publish to WordPress: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Function to process content for WordPress compatibility
function processContentForWordPress(content: string): string {
  let processedContent = content;

  // Ensure proper HTML structure
  processedContent = processedContent
    // Fix common HTML issues
    .replace(/<h1>/gi, '<h1>')
    .replace(/<\/h1>/gi, '</h1>')
    .replace(/<h2>/gi, '<h2>')
    .replace(/<\/h2>/gi, '</h2>')
    .replace(/<h3>/gi, '<h3>')
    .replace(/<\/h3>/gi, '</h3>')
    .replace(/<p>/gi, '<p>')
    .replace(/<\/p>/gi, '</p>')
    .replace(/<strong>/gi, '<strong>')
    .replace(/<\/strong>/gi, '</strong>')
    .replace(/<em>/gi, '<em>')
    .replace(/<\/em>/gi, '</em>')
    // Add proper spacing
    .replace(/(<\/h[1-3]>)\s*(<h[1-3]>)/g, '$1\n\n$2')
    .replace(/(<\/p>)\s*(<p>)/g, '$1\n\n$2')
    .replace(/(<\/h[1-3]>)\s*(<p>)/g, '$1\n\n$2')
    .replace(/(<\/p>)\s*(<h[1-3]>)/g, '$1\n\n$2')
    // Ensure paragraphs are properly wrapped
    .replace(/(?<!<p>)(?<!<\/p>)\n\n(?![<])/g, '</p>\n\n<p>')
    // Add opening paragraph tag if content doesn't start with HTML
    .replace(/^(?!<[h|p])/g, '<p>')
    // Add closing paragraph tag if content doesn't end with HTML
    .replace(/(?<!<\/[h|p]>)$/g, '</p>');

  // Add page breaks for long articles (every ~1200 words)
  const words = processedContent.split(/\s+/);
  if (words.length > 1200) {
    const wordsPerPage = 1200;
    let result = '';
    let wordCount = 0;

    for (const word of words) {
      result += word + ' ';
      wordCount++;

      if (wordCount >= wordsPerPage) {
        result += '\n<!--nextpage-->\n';
        wordCount = 0;
      }
    }

    processedContent = result.trim();
  }

  return processedContent;
}