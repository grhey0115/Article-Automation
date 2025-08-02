// AI service for Next.js
export async function generateArticleContent(params: {
  title: string;
  wordCount: number;
  tone: string;
  tags: string[];
  category: string;
  additionalInstructions?: string;
}): Promise<string> {
  const { title, wordCount, tone, tags, category, additionalInstructions } = params;
  
  // Ensure minimum word count of 1000
  const adjustedWordCount = Math.max(wordCount, 1000);
  
  // Check if API key is configured
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  if (!deepseekApiKey) {
    console.error('DEEPSEEK_API_KEY is not configured');
    throw new Error('DeepSeek API key is required for article generation');
  }

  // For articles longer than 3000 words, use chunked approach
  if (adjustedWordCount > 3000) {
    return await generateChunkedArticle(title, adjustedWordCount, tone, tags, category, additionalInstructions, deepseekApiKey);
  }

  const prompt = `Write a comprehensive ${adjustedWordCount}-word article about "${title}" in proper HTML format for WordPress.

CRITICAL REQUIREMENTS:
- EXACT word count: ${adjustedWordCount} words (not less, not more)
- Tone: ${tone}
- Category: ${category}
- Tags: ${tags.join(', ')}
${additionalInstructions ? `- Additional instructions: ${additionalInstructions}` : ''}

SEO REQUIREMENTS:
- Focus Keyphrase: "${title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()}"
- Meta Description: Create a compelling 155-160 character meta description
- Include the focus keyphrase naturally throughout the content
- Use proper heading hierarchy (H1, H2, H3)
- Include relevant internal and external links where appropriate

STRUCTURE THE ARTICLE WITH PROPER HTML FORMATTING TO REACH EXACTLY ${adjustedWordCount} WORDS:

<h1>${title}</h1>

<h2>Introduction to ${title.split(' ').slice(0, 3).join(' ')}</h2>

<p>Start with a comprehensive introduction paragraph (150-200 words) that hooks the reader and provides detailed context about ${title}. Include background information, current market trends, and why this topic is important today.</p>

<h3>What is ${title.split(' ').slice(0, 2).join(' ')}?</h3>

<p>Provide a detailed definition and explanation of ${title.split(' ').slice(0, 2).join(' ')} (200-250 words). Use <strong>bold text</strong> for key terms and concepts. Include technical specifications, working principles, and fundamental characteristics that define this technology or concept.</p>

<h3>How Does ${title.split(' ').slice(-2).join(' ')} Work?</h3>

<p>Explain the mechanisms and processes behind ${title.split(' ').slice(-2).join(' ')} in detail (200-250 words). Include <strong>important details</strong> and technical information. Describe the step-by-step process, underlying technologies, and operational principles that make this system or concept function effectively.</p>

<h2>Benefits of ${title.split(' ').slice(0, 3).join(' ')}</h2>

<h3>Enhanced Efficiency and Performance</h3>

<p>Discuss how ${title.split(' ').slice(0, 3).join(' ')} improves efficiency in detail (200-250 words). Use <strong>specific examples</strong> and <strong>concrete benefits</strong>. Include performance metrics, efficiency gains, and real-world applications that demonstrate the advantages of this technology or system.</p>

<h3>Improved User Experience</h3>

<p>Explain the user experience improvements comprehensively (200-250 words). Include <strong>real-world scenarios</strong> and <strong>practical applications</strong>. Describe how this technology enhances user interaction, simplifies complex processes, and provides intuitive interfaces that make tasks easier and more enjoyable.</p>

<h3>Cost-Effective Solutions</h3>

<p>Detail the cost benefits and return on investment extensively (200-250 words). Use <strong>specific numbers</strong> and <strong>comparative analysis</strong> when possible. Include initial investment costs, ongoing operational expenses, long-term savings, and value propositions that make this solution economically attractive.</p>

<h2>Key Features to Look For in ${title.split(' ').slice(0, 3).join(' ')}</h2>

<h3>Advanced Technology Integration</h3>

<p>Describe the cutting-edge technologies involved in detail (200-250 words). Highlight <strong>innovative features</strong> and <strong>technical capabilities</strong>. Explain how modern technologies like artificial intelligence, machine learning, IoT connectivity, and advanced algorithms enhance the functionality and performance of these systems.</p>

<h3>Scalability and Flexibility</h3>

<p>Explain how the system can grow with your needs comprehensively (200-250 words). Include <strong>scalability factors</strong> and <strong>adaptation capabilities</strong>. Describe the system's ability to handle increased workloads, expand functionality, and adapt to changing requirements without requiring complete replacement or major overhauls.</p>

<h3>Comprehensive Security Features</h3>

<p>Detail the security measures and protocols extensively (200-250 words). Emphasize <strong>security importance</strong> and <strong>protection mechanisms</strong>. Include encryption standards, access control systems, threat detection capabilities, and compliance with industry security standards and regulations.</p>

<h3>User-Friendly Interface</h3>

<p>Describe the interface design and usability in detail (200-250 words). Focus on <strong>ease of use</strong> and <strong>accessibility features</strong>. Explain how intuitive design, clear navigation, responsive layouts, and accessibility considerations make the system usable by people with varying technical expertise.</p>

<h2>${title.split(' ').slice(0, 2).join(' ')} Technology – The Game Changer</h2>

<h3>Revolutionary Capabilities</h3>

<p>Explain the breakthrough features that make this technology revolutionary in detail (200-250 words). Use <strong>industry insights</strong> and <strong>expert opinions</strong>. Describe how this technology represents a significant advancement over previous solutions, introducing capabilities that were previously impossible or impractical to implement.</p>

<h3>Integration with Modern Systems</h3>

<p>Describe how it integrates with existing infrastructure comprehensively (200-250 words). Include <strong>compatibility details</strong> and <strong>integration benefits</strong>. Explain the seamless connectivity with current technology ecosystems, APIs, protocols, and standards that enable smooth operation within existing environments.</p>

<h3>Real-Time Processing and Analytics</h3>

<p>Explain the real-time capabilities and analytical features in detail (200-250 words). Highlight <strong>performance metrics</strong> and <strong>data insights</strong>. Describe how the system processes information instantaneously, provides immediate feedback, and generates valuable insights that enable informed decision-making and proactive management.</p>

<h2>Best ${title.split(' ').slice(0, 3).join(' ')} (2025 Picks)</h2>

<h3>Top-Rated Professional Solutions</h3>

<p>Review the best professional-grade options available in detail (200-250 words). Include <strong>specific product recommendations</strong> and <strong>feature comparisons</strong>. Provide comprehensive analysis of leading products, their unique selling points, performance characteristics, and suitability for professional applications.</p>

<h3>Best Enterprise-Grade Options</h3>

<p>Discuss enterprise-level solutions and their capabilities comprehensively (200-250 words). Focus on <strong>scalability</strong> and <strong>enterprise features</strong>. Explain how these solutions meet the demanding requirements of large organizations, including advanced management tools, extensive customization options, and robust support systems.</p>

<h3>Budget-Friendly Alternatives</h3>

<p>Present cost-effective options that don't compromise quality in detail (200-250 words). Include <strong>price ranges</strong> and <strong>value propositions</strong>. Describe affordable solutions that provide excellent value, balancing cost considerations with essential features and reliable performance for budget-conscious users.</p>

<h2>How to Set Up ${title.split(' ').slice(0, 3).join(' ')}</h2>

<h3>Step-by-Step Installation Guide</h3>

<p>Provide detailed installation instructions (200-250 words). Use <strong>numbered steps</strong> and <strong>clear procedures</strong>. Include comprehensive setup procedures, hardware requirements, software installation steps, and configuration processes that ensure successful deployment and optimal performance.</p>

<h3>Connecting to Networks and Applications</h3>

<p>Explain the integration process with existing systems in detail (200-250 words). Include <strong>technical requirements</strong> and <strong>configuration details</strong>. Describe network setup procedures, application integration methods, API configurations, and compatibility considerations that ensure seamless operation within existing technology environments.</p>

<h3>Troubleshooting Common Issues</h3>

<p>Address common problems and their solutions comprehensively (200-250 words). Provide <strong>practical fixes</strong> and <strong>prevention tips</strong>. Include diagnostic procedures, common error resolutions, maintenance recommendations, and preventive measures that help users avoid problems and maintain optimal system performance.</p>

<h2>Privacy and Security Concerns</h2>

<h3>Protecting Your Data and Systems</h3>

<p>Discuss security measures and data protection in detail (200-250 words). Emphasize <strong>security best practices</strong> and <strong>threat prevention</strong>. Explain comprehensive security strategies, data encryption methods, access control mechanisms, and protective measures that safeguard sensitive information and system integrity.</p>

<h3>Implementing Access Controls</h3>

<p>Explain access control mechanisms and user management comprehensively (200-250 words). Include <strong>authentication methods</strong> and <strong>authorization protocols</strong>. Describe multi-factor authentication, role-based access controls, user permission management, and security protocols that ensure only authorized users can access sensitive functions and data.</p>

<h3>Ensuring Data Protection</h3>

<p>Detail compliance requirements and data protection measures extensively (200-250 words). Focus on <strong>regulatory compliance</strong> and <strong>data security</strong>. Explain how the system adheres to data protection regulations, implements privacy controls, maintains audit trails, and ensures compliance with industry standards and legal requirements.</p>

<h2>Use Cases and Applications</h2>

<h3>Business and Commercial Applications</h3>

<p>Describe business use cases and commercial applications in detail (200-250 words). Include <strong>industry examples</strong> and <strong>business benefits</strong>. Explain how this technology addresses specific business challenges, improves operational efficiency, reduces costs, and provides competitive advantages in various commercial environments.</p>

<h3>Industrial and Manufacturing Uses</h3>

<p>Explain industrial applications and manufacturing benefits comprehensively (200-250 words). Highlight <strong>production improvements</strong> and <strong>efficiency gains</strong>. Describe how this technology enhances manufacturing processes, improves quality control, increases productivity, and supports Industry 4.0 initiatives in industrial settings.</p>

<h3>Residential and Consumer Applications</h3>

<p>Discuss consumer applications and residential uses in detail (200-250 words). Include <strong>home security</strong> and <strong>personal benefits</strong>. Explain how this technology enhances home safety, provides convenience, improves quality of life, and offers peace of mind for residential users and families.</p>

<h2>Cost Breakdown and Value</h2>

<h3>Initial Investment Requirements</h3>

<p>Break down the initial costs and investment requirements comprehensively (200-250 words). Provide <strong>detailed cost analysis</strong> and <strong>budget considerations</strong>. Include hardware costs, software licenses, installation expenses, training requirements, and other upfront investments necessary for successful implementation.</p>

<h3>Ongoing Operational Costs</h3>

<p>Explain ongoing expenses and operational costs in detail (200-250 words). Include <strong>maintenance costs</strong> and <strong>subscription fees</strong>. Describe recurring expenses such as software updates, technical support, energy consumption, replacement parts, and service contracts that contribute to the total cost of ownership.</p>

<h3>Return on Investment Analysis</h3>

<p>Analyze the ROI and long-term value comprehensively (200-250 words). Use <strong>financial metrics</strong> and <strong>cost-benefit analysis</strong>. Provide detailed calculations showing how the investment pays for itself through efficiency gains, cost savings, productivity improvements, and other measurable benefits over time.</p>

<h2>Future of ${title.split(' ').slice(0, 3).join(' ')} Technology</h2>

<h3>Emerging Trends and Developments</h3>

<p>Discuss future trends and technological developments in detail (200-250 words). Include <strong>industry predictions</strong> and <strong>innovation forecasts</strong>. Explain upcoming technological advances, market trends, research developments, and innovation directions that will shape the future of this technology.</p>

<h3>Integration with Artificial Intelligence</h3>

<p>Explain AI integration and smart features comprehensively (200-250 words). Highlight <strong>AI capabilities</strong> and <strong>automation benefits</strong>. Describe how artificial intelligence enhances functionality, provides intelligent automation, improves decision-making, and creates more sophisticated and responsive systems.</p>

<h3>Sustainability and Environmental Considerations</h3>

<p>Discuss environmental impact and sustainability features in detail (200-250 words). Include <strong>green technology</strong> and <strong>eco-friendly options</strong>. Explain how this technology supports environmental sustainability, reduces carbon footprint, uses energy efficiently, and contributes to green technology initiatives.</p>

<h2>Comparison Between Traditional and Modern Systems</h2>

<h3>Performance and Reliability Differences</h3>

<p>Compare performance metrics between old and new systems comprehensively (200-250 words). Use <strong>performance data</strong> and <strong>reliability statistics</strong>. Provide detailed comparisons of speed, accuracy, reliability, efficiency, and other performance indicators that demonstrate the advantages of modern systems over traditional approaches.</p>

<h3>Installation and Maintenance Requirements</h3>

<p>Compare installation and maintenance needs in detail (200-250 words). Include <strong>time requirements</strong> and <strong>resource comparisons</strong>. Explain how modern systems reduce installation complexity, minimize maintenance requirements, lower operational costs, and provide more user-friendly management compared to traditional systems.</p>

<h2>How to Choose the Right System for You</h2>

<h3>Assessing Your Specific Needs</h3>

<p>Guide readers through the selection process comprehensively (200-250 words). Provide <strong>evaluation criteria</strong> and <strong>decision factors</strong>. Include detailed assessment frameworks, requirement analysis methods, and decision-making processes that help users identify the most suitable solution for their specific needs and circumstances.</p>

<h3>Compatibility with Existing Infrastructure</h3>

<p>Explain compatibility considerations and integration requirements in detail (200-250 words). Include <strong>technical specifications</strong> and <strong>system requirements</strong>. Describe how to evaluate compatibility with current systems, assess integration capabilities, and ensure seamless operation within existing technology environments.</p>

<h2>Tips for Maximizing Your System's Effectiveness</h2>

<h3>Optimal Configuration Strategies</h3>

<p>Provide configuration tips and optimization strategies comprehensively (200-250 words). Include <strong>best practices</strong> and <strong>performance tips</strong>. Explain advanced configuration options, optimization techniques, and customization strategies that help users maximize the performance and effectiveness of their systems.</p>

<h3>Regular Maintenance and Updates</h3>

<p>Explain maintenance schedules and update procedures in detail (200-250 words). Include <strong>maintenance checklists</strong> and <strong>update protocols</strong>. Describe preventive maintenance procedures, update management strategies, and ongoing care requirements that ensure long-term reliability and optimal performance.</p>

<h2>Conclusion</h2>

<p>Summarize the key points and provide a comprehensive conclusion about ${title} (200-250 words). Reinforce the <strong>main benefits</strong> and <strong>value propositions</strong>. Include a compelling summary of the most important points, final recommendations, and a strong call to action that encourages readers to take the next step.</p>

<h2>Frequently Asked Questions</h2>

<h3>How reliable are ${title.split(' ').slice(0, 3).join(' ')} systems?</h3>

<p>Address reliability concerns and provide comprehensive reassurance about system dependability (150-200 words). Include reliability statistics, warranty information, and quality assurance measures that demonstrate the system's dependability and long-term performance.</p>

<h3>Can ${title.split(' ').slice(0, 3).join(' ')} systems integrate with existing infrastructure?</h3>

<p>Explain integration capabilities and compatibility with current systems comprehensively (150-200 words). Include technical specifications, compatibility requirements, and integration procedures that ensure seamless operation with existing technology environments.</p>

<h3>What security measures are included in modern ${title.split(' ').slice(0, 3).join(' ')} systems?</h3>

<p>Detail the security features and protection mechanisms available extensively (150-200 words). Include comprehensive security protocols, encryption standards, access controls, and protective measures that safeguard systems and data from various threats.</p>

<h3>What are the typical costs associated with ${title.split(' ').slice(0, 3).join(' ')} systems?</h3>

<p>Provide comprehensive cost breakdown and pricing information for different options (150-200 words). Include detailed pricing structures, cost factors, and value propositions that help users understand the total investment required and the value they receive.</p>

<h3>How do I choose the right ${title.split(' ').slice(0, 3).join(' ')} system for my needs?</h3>

<p>Offer comprehensive guidance on the selection process and decision-making criteria (150-200 words). Include detailed evaluation frameworks, assessment criteria, and decision-making processes that help users identify the most suitable solution for their specific requirements.</p>

IMPORTANT FORMATTING REQUIREMENTS:
1. Use proper HTML tags: <h1>, <h2>, <h3>, <p>, <strong>, <em>
2. Each paragraph should be wrapped in <p> tags
3. Use <strong> for important terms and key concepts
4. Use <em> for emphasis and secondary important points
5. Ensure proper spacing between sections
6. Make content informative, well-structured, and engaging
7. CRITICAL: Ensure the total word count is EXACTLY ${adjustedWordCount} words
8. Use professional tone but make it accessible to general readers
9. Include specific product recommendations where appropriate
10. Add relevant statistics and data when possible
11. End with a strong conclusion that summarizes key points
12. Use proper HTML formatting for WordPress compatibility
13. DO NOT include phrases like "this HTML has X words" or similar meta-commentary
14. Focus on natural, flowing content that reads well

CRITICAL: Generate original, high-quality content with proper HTML formatting that is informative and valuable to readers. The article MUST be exactly ${adjustedWordCount} words. Do not use generic or placeholder text.`;

  // Try DeepSeek API with retries
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting DeepSeek API call (attempt ${attempt}/${maxRetries})...`);
      const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekApiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 8000, // Fixed to stay within API limits
          temperature: 0.7
        })
      });

      if (deepseekResponse.ok) {
        const data = await deepseekResponse.json();
        console.log('DeepSeek API call successful');
        const content = data.choices[0].message.content;
        
        // Clean the content to remove unwanted phrases
        const cleanedContent = cleanArticleContent(content);
        
        // Validate word count
        const actualWordCount = cleanedContent.split(/\s+/).length;
        console.log(`Generated article word count: ${actualWordCount} (target: ${adjustedWordCount})`);
        
        if (actualWordCount < adjustedWordCount * 0.9) { // If less than 90% of target
          console.warn(`Article is too short (${actualWordCount} words). Requesting additional content...`);
          // Request additional content to meet minimum word count
          const additionalPrompt = `The previous article was only ${actualWordCount} words, but we need exactly ${adjustedWordCount} words. Please expand the article significantly by adding more detailed content, additional sections, and comprehensive explanations to reach exactly ${adjustedWordCount} words. Use proper HTML formatting.`;
          
          const additionalResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${deepseekApiKey}`
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                {
                  role: 'user',
                  content: `${prompt}\n\n${additionalPrompt}`
                }
              ],
              max_tokens: 8000,
              temperature: 0.7
            })
          });

          if (additionalResponse.ok) {
            const additionalData = await additionalResponse.json();
            const expandedContent = additionalData.choices[0].message.content;
            const cleanedExpandedContent = cleanArticleContent(expandedContent);
            const expandedWordCount = cleanedExpandedContent.split(/\s+/).length;
            console.log(`Expanded article word count: ${expandedWordCount}`);
            return cleanedExpandedContent;
          }
        }
        
        return cleanedContent;
      } else {
        const errorText = await deepseekResponse.text();
        console.error(`DeepSeek API error (attempt ${attempt}): ${deepseekResponse.status} - ${errorText}`);
        
        // Provide specific error messages
        if (deepseekResponse.status === 401) {
          console.error('Authentication failed. Please check your DeepSeek API key.');
          throw new Error('DeepSeek API authentication failed. Please check your API key.');
        } else if (deepseekResponse.status === 429) {
          console.error('Rate limit exceeded. Please try again later.');
          if (attempt < maxRetries) {
            console.log(`Waiting before retry...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
            continue;
          }
        } else if (deepseekResponse.status === 500) {
          console.error('DeepSeek API server error. Please try again.');
          if (attempt < maxRetries) {
            console.log(`Waiting before retry...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
        }
        
        // If we've exhausted retries, throw the error
        if (attempt === maxRetries) {
          throw new Error(`DeepSeek API failed after ${maxRetries} attempts: ${deepseekResponse.status}`);
        }
      }
    } catch (error) {
      console.error(`DeepSeek API network error (attempt ${attempt}):`, error instanceof Error ? error : new Error(String(error)));
      if (attempt === maxRetries) {
        throw new Error(`Failed to generate article after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  // Try OpenAI as fallback only if DeepSeek completely fails
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (openaiApiKey) {
    try {
      console.log('Attempting OpenAI API call as fallback...');
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 8000,
          temperature: 0.7
        })
      });

      if (openaiResponse.ok) {
        const data = await openaiResponse.json();
        console.log('OpenAI API call successful');
        const content = data.choices[0].message.content;
        
        // Clean the content
        const cleanedContent = cleanArticleContent(content);
        
        // Validate word count
        const actualWordCount = cleanedContent.split(/\s+/).length;
        console.log(`Generated article word count: ${actualWordCount} (target: ${adjustedWordCount})`);
        
        if (actualWordCount < adjustedWordCount * 0.9) {
          console.warn(`Article is too short (${actualWordCount} words). Adding more content...`);
          return cleanedContent + generateAdditionalContent(title, adjustedWordCount - actualWordCount);
        }
        
        return cleanedContent;
      } else {
        const errorText = await openaiResponse.text();
        console.error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('OpenAI API network error:', error);
    }
  }

  // Only use mock content as absolute last resort
  console.error('Both AI APIs failed completely. Using mock content as last resort.');
  throw new Error('Failed to generate article content from AI APIs. Please check your API keys and try again.');
}

// Function to clean article content and remove unwanted phrases
function cleanArticleContent(content: string): string {
  return content
    // Remove meta-commentary about word count
    .replace(/this\s+html\s+has\s+\d+\s+words/gi, '')
    .replace(/this\s+article\s+contains\s+\d+\s+words/gi, '')
    .replace(/word\s+count:\s*\d+/gi, '')
    .replace(/total\s+words:\s*\d+/gi, '')
    .replace(/exactly\s+\d+\s+words/gi, '')
    .replace(/target\s+word\s+count:\s*\d+/gi, '')
    // Remove other unwanted phrases
    .replace(/please\s+note\s+that\s+this\s+content/gi, '')
    .replace(/this\s+content\s+has\s+been\s+generated/gi, '')
    .replace(/ai\s+generated\s+content/gi, '')
    .replace(/artificial\s+intelligence\s+generated/gi, '')
    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Function to generate long articles in chunks
async function generateChunkedArticle(
  title: string,
  targetWordCount: number,
  tone: string,
  tags: string[],
  category: string,
  additionalInstructions: string | undefined,
  apiKey: string
): Promise<string> {
  console.log(`Generating ${targetWordCount}-word article in chunks...`);
  
  const chunks = [];
  let currentWordCount = 0;
  let chunkNumber = 1;
  
  // Generate SEO metadata
  const focusKeyphrase = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const metaDescription = `Discover the best ${title.toLowerCase()} in 2025. Learn about features, benefits, and top recommendations for ${focusKeyphrase}. Expert guide with detailed reviews and comparisons.`;
  
  // Define article sections for chunking with improved word count targets
  const sections = [
    {
      name: 'Introduction and Basics',
      targetWords: Math.floor(targetWordCount * 0.15),
      prompt: `Write the introduction and basic sections for "${title}" (target: ${Math.floor(targetWordCount * 0.15)} words). Include:
      - <h1>${title}</h1>
      - <h2>Introduction to ${title.split(' ').slice(0, 3).join(' ')}</h2>
      - <h3>What is ${title.split(' ').slice(0, 2).join(' ')}?</h3>
      - <h3>How Does ${title.split(' ').slice(-2).join(' ')} Work?</h3>
      
      SEO Requirements:
      - Focus Keyphrase: "${focusKeyphrase}"
      - Meta Description: "${metaDescription}"
      - Include the focus keyphrase naturally 3-4 times
      - Use proper HTML formatting
      - Make it engaging and informative
      - Target exactly ${Math.floor(targetWordCount * 0.15)} words`
    },
    {
      name: 'Benefits and Features',
      targetWords: Math.floor(targetWordCount * 0.25),
      prompt: `Continue the article about "${title}" with benefits and key features sections (target: ${Math.floor(targetWordCount * 0.25)} words). Include:
      - <h2>Benefits of ${title.split(' ').slice(0, 3).join(' ')}</h2>
      - <h3>Enhanced Efficiency and Performance</h3>
      - <h3>Improved User Experience</h3>
      - <h3>Cost-Effective Solutions</h3>
      - <h2>Key Features to Look For in ${title.split(' ').slice(0, 3).join(' ')}</h2>
      - <h3>Advanced Technology Integration</h3>
      - <h3>Scalability and Flexibility</h3>
      - <h3>Comprehensive Security Features</h3>
      - <h3>User-Friendly Interface</h3>
      
      SEO Requirements:
      - Focus Keyphrase: "${focusKeyphrase}"
      - Include the focus keyphrase naturally 4-5 times
      - Use proper HTML formatting
      - Target exactly ${Math.floor(targetWordCount * 0.25)} words`
    },
    {
      name: 'Technology and Solutions',
      targetWords: Math.floor(targetWordCount * 0.25),
      prompt: `Continue the article about "${title}" with technology and solutions sections (target: ${Math.floor(targetWordCount * 0.25)} words). Include:
      - <h2>${title.split(' ').slice(0, 2).join(' ')} Technology – The Game Changer</h2>
      - <h3>Revolutionary Capabilities</h3>
      - <h3>Integration with Modern Systems</h3>
      - <h3>Real-Time Processing and Analytics</h3>
      - <h2>Best ${title.split(' ').slice(0, 3).join(' ')} (2025 Picks)</h2>
      - <h3>Top-Rated Professional Solutions</h3>
      - <h3>Best Enterprise-Grade Options</h3>
      - <h3>Budget-Friendly Alternatives</h3>
      
      SEO Requirements:
      - Focus Keyphrase: "${focusKeyphrase}"
      - Include the focus keyphrase naturally 4-5 times
      - Use proper HTML formatting
      - Target exactly ${Math.floor(targetWordCount * 0.25)} words`
    },
    {
      name: 'Setup and Applications',
      targetWords: Math.floor(targetWordCount * 0.2),
      prompt: `Continue the article about "${title}" with setup and applications sections (target: ${Math.floor(targetWordCount * 0.2)} words). Include:
      - <h2>How to Set Up ${title.split(' ').slice(0, 3).join(' ')}</h2>
      - <h3>Step-by-Step Installation Guide</h3>
      - <h3>Connecting to Networks and Applications</h3>
      - <h3>Troubleshooting Common Issues</h3>
      - <h2>Use Cases and Applications</h2>
      - <h3>Business and Commercial Applications</h3>
      - <h3>Industrial and Manufacturing Uses</h3>
      - <h3>Residential and Consumer Applications</h3>
      
      SEO Requirements:
      - Focus Keyphrase: "${focusKeyphrase}"
      - Include the focus keyphrase naturally 3-4 times
      - Use proper HTML formatting
      - Target exactly ${Math.floor(targetWordCount * 0.2)} words`
    },
    {
      name: 'Conclusion and FAQs',
      targetWords: Math.floor(targetWordCount * 0.15),
      prompt: `Complete the article about "${title}" with conclusion and FAQs (target: ${Math.floor(targetWordCount * 0.15)} words). Include:
      - <h2>Conclusion</h2>
      - <h2>Frequently Asked Questions</h2>
      - <h3>How reliable are ${title.split(' ').slice(0, 3).join(' ')} systems?</h3>
      - <h3>Can ${title.split(' ').slice(0, 3).join(' ')} systems integrate with existing infrastructure?</h3>
      - <h3>What security measures are included in modern ${title.split(' ').slice(0, 3).join(' ')} systems?</h3>
      - <h3>What are the typical costs associated with ${title.split(' ').slice(0, 3).join(' ')} systems?</h3>
      - <h3>How do I choose the right ${title.split(' ').slice(0, 3).join(' ')} system for my needs?</h3>
      
      SEO Requirements:
      - Focus Keyphrase: "${focusKeyphrase}"
      - Include the focus keyphrase naturally 2-3 times
      - Use proper HTML formatting
      - Target exactly ${Math.floor(targetWordCount * 0.15)} words`
    }
  ];

  for (const section of sections) {
    console.log(`Generating chunk ${chunkNumber}: ${section.name} (target: ${section.targetWords} words)`);
    
    const sectionPrompt = `Write a comprehensive article section about "${title}" with the following requirements:

Tone: ${tone}
Category: ${category}
Tags: ${tags.join(', ')}
${additionalInstructions ? `Additional instructions: ${additionalInstructions}` : ''}

${section.prompt}

IMPORTANT:
- Use proper HTML formatting (<h2>, <h3>, <p>, <strong>, <em>)
- Target exactly ${section.targetWords} words
- Make content informative and engaging
- Use professional tone but accessible to general readers
- Include specific examples and practical information
- DO NOT include phrases like "this HTML has X words" or similar meta-commentary
- Focus on natural, flowing content that reads well`;

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: sectionPrompt
            }
          ],
          max_tokens: 8000,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        const cleanedContent = cleanArticleContent(content);
        const wordCount = cleanedContent.split(/\s+/).length;
        
        console.log(`Chunk ${chunkNumber} generated: ${wordCount} words`);
        chunks.push(cleanedContent);
        currentWordCount += wordCount;
        chunkNumber++;
        
        // Add a small delay between chunks to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        const errorText = await response.text();
        console.error(`Error generating chunk ${chunkNumber}: ${response.status} - ${errorText}`);
        throw new Error(`Failed to generate chunk ${chunkNumber}: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error generating chunk ${chunkNumber}:`, error);
      throw new Error(`Failed to generate article chunk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Combine all chunks
  const fullArticle = chunks.join('\n\n');
  const finalWordCount = fullArticle.split(/\s+/).length;
  
  console.log(`Article generation complete: ${finalWordCount} words (target: ${targetWordCount})`);
  
  return fullArticle;
}

function generateAdditionalContent(title: string, additionalWords: number): string {
  const additionalSections = [
    `\n\n## Additional Considerations for ${title}

When implementing ${title}, there are several additional factors to consider that can significantly impact your success and satisfaction with the system.

### Integration with Existing Infrastructure

One of the most important considerations is how your new ${title} will integrate with your existing setup. This includes compatibility with current systems, ease of migration, and potential conflicts with existing protocols or standards.

### Scalability and Future-Proofing

As your needs grow and technology evolves, you'll want to ensure that your ${title} solution can scale accordingly. This means considering not just your current requirements, but also your projected growth and the pace of technological advancement in this field.

### Training and Support Requirements

Implementing any new system requires proper training and ongoing support. Consider the learning curve for your team, the availability of technical support, and the quality of documentation and training materials provided by the vendor.

### Compliance and Regulatory Requirements

Depending on your industry and location, there may be specific compliance requirements that affect your choice of ${title}. This could include data protection regulations, industry-specific standards, or local laws that govern the use of such systems.

### Performance Monitoring and Optimization

Once your ${title} is implemented, ongoing monitoring and optimization will be crucial for maintaining optimal performance. This includes regular system health checks, performance metrics tracking, and proactive maintenance to prevent issues before they become problems.`,

    `\n\n## Advanced Features and Capabilities

Modern ${title} systems offer a range of advanced features that can significantly enhance their effectiveness and value. Understanding these capabilities can help you make more informed decisions about your implementation.

### Automation and Smart Features

Many contemporary ${title} solutions include sophisticated automation capabilities that can reduce manual intervention and improve efficiency. These might include automated responses to certain conditions, predictive maintenance alerts, or intelligent routing of tasks and processes.

### Analytics and Reporting

Comprehensive analytics and reporting features can provide valuable insights into the performance and effectiveness of your ${title}. Look for systems that offer detailed metrics, customizable reports, and the ability to export data for further analysis.

### Customization and Flexibility

The ability to customize your ${title} to meet your specific needs is often crucial for long-term success. This includes configurable workflows, customizable interfaces, and the ability to integrate with other systems and tools that you already use.

### Security and Reliability

Given the importance of ${title} in many applications, security and reliability are paramount. Look for systems with robust security features, regular security updates, and proven reliability track records in similar environments to yours.`
  ];

  // Select appropriate additional content based on word count needed
  const selectedContent = additionalWords > 300 ? additionalSections.join('\n\n') : additionalSections[0];
  
  return selectedContent;
}

function generateMockArticle(title: string, wordCount: number, tone: string, category: string, tags: string[]): string {
  // This function should rarely be called - only as absolute last resort
  console.warn('Using mock article as absolute last resort');
  
  return `# ${title}

## Introduction to ${title.split(' ').slice(0, 3).join(' ')}

This is a placeholder article for ${title}. The AI service was unable to generate content at this time. Please check your API configuration and try again.

## Error Information

The article generation failed due to API issues. Please ensure:
1. Your DeepSeek API key is valid and properly configured
2. Your internet connection is stable
3. The DeepSeek API service is available

## Next Steps

Please try generating the article again, or contact support if the issue persists.`;
}