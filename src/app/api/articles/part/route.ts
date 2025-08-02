import { NextRequest, NextResponse } from 'next/server';

// Helper to build the prompt for a specific part
function buildPartPrompt({ topic, part, totalParts, previousContent, tags, tone, wordCount, additionalInstructions }: any) {
  // Use the wordCount directly as it's already calculated for this specific part
  const actualTargetWords = wordCount;
  const focusKeyphrase = topic.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const metaDescription = `Discover the best ${topic.toLowerCase()} in 2025. Learn about features, benefits, and top recommendations for ${focusKeyphrase}. Expert guide with detailed reviews and comparisons.`;

  // Define section prompts based on part number
  const sectionPrompts = {
    1: `Write a ${actualTargetWords} word, 100% unique, SEO-optimized, human-written article section in English on the topic "${topic}".

Follow these steps:

1. First, create an outline with at least 15 headings and subheadings (including H1, H2, H3, and H4).
2. Then, begin writing the article section by section.
3. For every heading and subheading, write a detailed paragraph of 300–350+ words.
4. For Part 1: Write content for Headings 1–5 and then stop with the message **"Continue Generating?"**

CRITICAL: You must write EXACTLY ${actualTargetWords} words - no more, no less. Count your words carefully and ensure the total word count matches this target exactly.

Write in a human-like, conversational tone using active voice, contractions, informal style, rhetorical questions, personal pronouns, etc. Avoid sounding robotic or like AI-generated text.

SEO Requirements:
- Focus Keyphrase: "${focusKeyphrase}"
- Meta Description: "${metaDescription}"
- Tags: ${tags ? tags.join(', ') : ''}
- Tone: ${tone || 'conversational'}
- Additional Instructions: ${additionalInstructions || ''}
- Target exactly ${actualTargetWords} words

Use proper Markdown formatting with # for headings. At the end of this part, say only: "Continue Generating?"`,
    
    2: `Continue the article about "${topic}" with Part 2 (target: ${actualTargetWords} words).

For Part 2: Continue with Headings 6–10 and stop again with the message **"Continue Generating?"**

Previous content for context:
${previousContent || ''}

CRITICAL: You must write EXACTLY ${actualTargetWords} words - no more, no less. Count your words carefully and ensure the total word count matches this target exactly.

Write in a human-like, conversational tone using active voice, contractions, informal style, rhetorical questions, personal pronouns, etc. Avoid sounding robotic or like AI-generated text.

SEO Requirements:
- Focus Keyphrase: "${focusKeyphrase}"
- Meta Description: "${metaDescription}"
- Tags: ${tags ? tags.join(', ') : ''}
- Tone: ${tone || 'conversational'}
- Additional Instructions: ${additionalInstructions || ''}
- Target exactly ${actualTargetWords} words

Use proper Markdown formatting with # for headings. At the end of this part, say only: "Continue Generating?"`,
    
    3: `Continue the article about "${topic}" with Part 3 (target: ${actualTargetWords} words).

For Part 3: Continue with Headings 11–15, same pause.

Previous content for context:
${previousContent || ''}

CRITICAL: You must write EXACTLY ${actualTargetWords} words - no more, no less. Count your words carefully and ensure the total word count matches this target exactly.

Write in a human-like, conversational tone using active voice, contractions, informal style, rhetorical questions, personal pronouns, etc. Avoid sounding robotic or like AI-generated text.

SEO Requirements:
- Focus Keyphrase: "${focusKeyphrase}"
- Meta Description: "${metaDescription}"
- Tags: ${tags ? tags.join(', ') : ''}
- Tone: ${tone || 'conversational'}
- Additional Instructions: ${additionalInstructions || ''}
- Target exactly ${actualTargetWords} words

Use proper Markdown formatting with # for headings. At the end of this part, say only: "Continue Generating?"`,
    
    4: `Continue the article about "${topic}" with Part 4 (target: ${actualTargetWords} words).

For Part 4: Continue with additional sections and stop with the message **"Continue Generating?"**

Previous content for context:
${previousContent || ''}

CRITICAL: You must write EXACTLY ${actualTargetWords} words - no more, no less. Count your words carefully and ensure the total word count matches this target exactly.

Write in a human-like, conversational tone using active voice, contractions, informal style, rhetorical questions, personal pronouns, etc. Avoid sounding robotic or like AI-generated text.

SEO Requirements:
- Focus Keyphrase: "${focusKeyphrase}"
- Meta Description: "${metaDescription}"
- Tags: ${tags ? tags.join(', ') : ''}
- Tone: ${tone || 'conversational'}
- Additional Instructions: ${additionalInstructions || ''}
- Target exactly ${actualTargetWords} words

Use proper Markdown formatting with # for headings. At the end of this part, say only: "Continue Generating?"`
  };

  // Handle parts beyond 4 dynamically
  if (part > 4 && part < totalParts) {
    return `Continue the article about "${topic}" with Part ${part} (target: ${actualTargetWords} words).

For Part ${part}: Continue with additional sections and stop with the message **"Continue Generating?"**

Previous content for context:
${previousContent || ''}

CRITICAL: You must write EXACTLY ${actualTargetWords} words - no more, no less. Count your words carefully and ensure the total word count matches this target exactly.

Write in a human-like, conversational tone using active voice, contractions, informal style, rhetorical questions, personal pronouns, etc. Avoid sounding robotic or like AI-generated text.

SEO Requirements:
- Focus Keyphrase: "${focusKeyphrase}"
- Meta Description: "${metaDescription}"
- Tags: ${tags ? tags.join(', ') : ''}
- Tone: ${tone || 'conversational'}
- Additional Instructions: ${additionalInstructions || ''}
- Target exactly ${actualTargetWords} words

Use proper Markdown formatting with # for headings. At the end of this part, say only: "Continue Generating?"`;
  }

  // Final part (when part === totalParts)
  if (part === totalParts) {
    return `Complete the article about "${topic}" with Part ${part} (target: ${actualTargetWords} words).

For Part ${part}: Finish with a Conclusion + 5 unique FAQs + this custom message at the end.

Previous content for context:
${previousContent || ''}

CRITICAL: You must write EXACTLY ${actualTargetWords} words - no more, no less. Count your words carefully and ensure the total word count matches this target exactly.

Write in a human-like, conversational tone using active voice, contractions, informal style, rhetorical questions, personal pronouns, etc. Avoid sounding robotic or like AI-generated text.

SEO Requirements:
- Focus Keyphrase: "${focusKeyphrase}"
- Meta Description: "${metaDescription}"
- Tags: ${tags ? tags.join(', ') : ''}
- Tone: ${tone || 'conversational'}
- Additional Instructions: ${additionalInstructions || ''}
- Target exactly ${actualTargetWords} words

Use proper Markdown formatting with # for headings. This is the final part, so do NOT include "Continue Generating?" at the end.`;
  }

  const sectionPrompt = sectionPrompts[part as keyof typeof sectionPrompts] || sectionPrompts[4];

  return sectionPrompt;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, part, totalParts, previousContent, tags, tone, wordCount, additionalInstructions } = body;

    const prompt = buildPartPrompt({ topic, part, totalParts, previousContent, tags, tone, wordCount, additionalInstructions });

    // Call DeepSeek API
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'DeepSeek API key not configured' }, { status: 500 });
    }

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
            content: prompt
          }
        ],
        max_tokens: 8000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: 500 });
    }

    const data = await response.json();
    const markdown = data.choices[0].message.content;

    return NextResponse.json({ markdown });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 