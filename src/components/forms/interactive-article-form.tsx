import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Loader2, Play, CheckCircle, FileText, Settings, Upload, Sparkles, ArrowRight, Eye, BarChart3, Zap, Clock } from 'lucide-react';
import { ArticlePreviewEditor } from '../article-preview-editor';

// Calculate total parts based on word count (each part ~1000-1500 words)
function calculateTotalParts(wordCount: number): number {
  if (wordCount <= 1500) return 1;
  if (wordCount <= 3000) return 2;
  if (wordCount <= 4500) return 3;
  if (wordCount <= 6000) return 4;
  if (wordCount <= 7500) return 5;
  // For very long articles, cap at 6 parts maximum to avoid too many API calls
  return Math.min(6, Math.ceil(wordCount / 1500));
}

// Calculate progress percentage
function calculateProgress(currentPart: number, totalParts: number): number {
  return Math.min(100, Math.round((currentPart / totalParts) * 100));
}

// Generate automatic tags based on article content
function generateAutomaticTags(content: string, topic: string): string[] {
  // Extract words from content for tag generation
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Count word frequency
  const wordCount: { [key: string]: number } = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Get most frequent words (excluding common words)
  const commonWords = ['the', 'and', 'for', 'with', 'that', 'this', 'they', 'have', 'from', 'will', 'your', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'than', 'first', 'been', 'call', 'who', 'its', 'now', 'find', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part'];
  const relevantWords = Object.entries(wordCount)
    .filter(([word]) => !commonWords.includes(word))
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
  
  // Add topic-based tags
  const topicWords = topic.toLowerCase().split(' ').filter(word => word.length > 3).slice(0, 2);
  
  // Combine and limit to 5 tags
  const allTags = [...topicWords, ...relevantWords, 'ai-generated', 'technology'];
  return [...new Set(allTags)].slice(0, 5);
}

interface InteractiveArticleFormProps {
  onPreviewUpdate?: (content: string, isGenerating: boolean, currentPart: number, totalParts: number) => void
  onFormDataUpdate?: (title: string, tags: string[], category: string) => void
  onPublishDraft?: (content: string, title: string, tags: string[], category: string) => Promise<number>
}

export function InteractiveArticleForm({ onPreviewUpdate, onFormDataUpdate, onPublishDraft }: InteractiveArticleFormProps) {
  const [step, setStep] = useState<'form' | 'generating' | 'cleaning' | 'review' | 'done'>('form' as const);
  const [form, setForm] = useState({
    topic: '',
    category: '',
    tone: 'conversational',
    wordCount: 3000,
    additionalInstructions: '',
  });
  const [currentPart, setCurrentPart] = useState(1);
  const [totalParts, setTotalParts] = useState(3);
  const [parts, setParts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedId, setPublishedId] = useState<number | null>(null);
  const [currentContent, setCurrentContent] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [autoTags, setAutoTags] = useState<string[]>([]);
  const [finalWordCount, setFinalWordCount] = useState(0);

  const handleChange = (e: any) => {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
    
    // Update parent with form data (without tags initially)
    if (onFormDataUpdate) {
      onFormDataUpdate(newForm.topic, [], newForm.category);
    }
  };

  const handleStart = async (e: any) => {
    e.preventDefault();
    const calculatedParts = calculateTotalParts(form.wordCount);
    setTotalParts(calculatedParts);
    setStep('generating');
    setCurrentPart(1);
    setParts([]);
    setError(null);
    setGenerationProgress(0);
    setIsAutoGenerating(true);
    setAutoTags([]); // Clear tags initially
    
    onPreviewUpdate?.('', true, 1, calculatedParts);
    await generateAllParts();
  };

  const generateAllParts = async () => {
    setIsAutoGenerating(true);
    let allContent = '';
    let accumulatedParts: string[] = [];
    
    for (let part = 1; part <= totalParts; part++) {
      try {
        setCurrentPart(part);
        setStep('generating');
        onPreviewUpdate?.(allContent, true, part, totalParts);
        
        // Calculate target words for this part to reach the final target
        const wordsPerPart = Math.ceil(form.wordCount / totalParts);
        const targetWords = part === totalParts ? form.wordCount - (wordsPerPart * (totalParts - 1)) : wordsPerPart;
        
        // Update progress - ensure it doesn't exceed 100%
        const progress = calculateProgress(part, totalParts);
        setGenerationProgress(progress);
        
        const res = await fetch('/api/articles/part', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: form.topic,
            part,
            totalParts,
            previousContent: allContent,
            tags: [], // No tags during generation
            tone: form.tone,
            wordCount: targetWords,
            additionalInstructions: form.additionalInstructions,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate part');
        
        // Add the new part to accumulated parts
        accumulatedParts.push(data.markdown);
        setParts(accumulatedParts);
        
        // Build the complete content from all parts
        allContent = accumulatedParts.join('\n\n');
        setCurrentContent(allContent);
        onPreviewUpdate?.(allContent, false, part, totalParts);
        
        // Small delay between parts for better UX
        if (part < totalParts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (err: any) {
        setError(err.message);
        setIsAutoGenerating(false);
        return;
      }
    }
    
    setIsAutoGenerating(false);
    
    // Start automatic cleanup
    setStep('cleaning');
    await performAutomaticCleanup(allContent);
  };

  const performAutomaticCleanup = async (content: string) => {
    try {
      // Simulate cleanup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clean the content by removing unwanted elements
      let cleaned = content
        // Remove main title (usually the first line that's a heading)
        .replace(/^#\s+.*$/m, '')
        // Remove Meta Description and Tags sections but keep actual tags
        .replace(/\*\*Meta Description\*\*[\s\S]*?(?=\n\n|\n#|\n##|\n###|\n-|\n\*|\n\d+\.)/g, '')
        .replace(/\*\*Tags\*\*[\s\S]*?(?=\n\n|\n#|\n##|\n###|\n-|\n\*|\n\d+\.)/g, '')
        // Remove Word Count section
        .replace(/\*\*Word Count\*\*[\s\S]*?(?=\n\n|\n#|\n##|\n###|\n-|\n\*|\n\d+\.)/g, '')
        // Remove Custom Message section
        .replace(/\*\*Custom Message\*\*[\s\S]*?(?=\n\n|\n#|\n##|\n###|\n-|\n\*|\n\d+\.)/g, '')
        // Remove page breaks (<!--nextpage-->)
        .replace(/<!--nextpage-->/gi, '')
        // Remove "Continue Generating?" text
        .replace(/Continue Generating\?/gi, '')
        // Clean up extra whitespace
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
      
      // Calculate final word count
      const finalWords = cleaned.split(/\s+/).filter(Boolean).length;
      setFinalWordCount(finalWords);
      
      // Generate tags based on the cleaned content
      const generatedTags = generateAutomaticTags(cleaned, form.topic);
      setAutoTags(generatedTags);
      
      // Update parent with final data including tags
      if (onFormDataUpdate) {
        onFormDataUpdate(form.topic, generatedTags, form.category);
      }
      
      setCurrentContent(cleaned);
      onPreviewUpdate?.(cleaned, false, totalParts, totalParts);
      setStep('review');
    } catch (err: any) {
      setError(err.message);
      setStep('review');
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    setError(null);
    try {
      // Clean the content by removing "Continue Generating?" and similar phrases
      const cleanedContent = parts.join('\n\n').replace(/Continue Generating\?/gi, '').trim();
      
      const res = await fetch('/api/articles/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.topic,
          markdown: cleanedContent,
          tags: autoTags,
          category: form.category,
          status: 'draft',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish');
      setPublishedId(data.postId);
      setStep('done');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishDraft = async (content: string) => {
    if (onPublishDraft) {
      // Clean the content before passing to the parent handler
      const cleanedContent = content.replace(/Continue Generating\?/gi, '').trim();
      return await onPublishDraft(cleanedContent, form.topic, autoTags, form.category);
    }
    
    try {
      // Clean the content by removing "Continue Generating?" and similar phrases
      const cleanedContent = content.replace(/Continue Generating\?/gi, '').trim();
      
      const res = await fetch('/api/articles/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.topic,
          markdown: cleanedContent,
          tags: autoTags,
          category: form.category,
          status: 'draft',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish draft');
      return data.postId;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const handleContentUpdate = (newContent: string) => {
    setCurrentContent(newContent);
    // Update the parts array with the edited content
    const contentParts = newContent.split('\n\n').filter(part => part.trim());
    setParts(contentParts);
  };

  return (
    <div className="space-y-6">
      {step === 'form' && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              Automatic AI Article Generator
            </CardTitle>
            <p className="text-slate-600">
              Create comprehensive articles automatically with AI assistance. Tags will be generated based on the final article content.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStart} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Article Topic *</Label>
                  <Input 
                    id="topic"
                    name="topic" 
                    value={form.topic} 
                    onChange={handleChange} 
                    placeholder="e.g., Best Smart Home Security Cameras 2025"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input 
                    id="category"
                    name="category" 
                    value={form.category} 
                    onChange={handleChange} 
                    placeholder="e.g., Technology, Security"
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Writing Tone</Label>
                  <Input 
                    id="tone"
                    name="tone" 
                    value={form.tone} 
                    onChange={handleChange}
                    placeholder="conversational, professional, casual"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wordCount">Target Word Count</Label>
                  <Input 
                    id="wordCount"
                    name="wordCount" 
                    type="number" 
                    value={form.wordCount} 
                    onChange={handleChange} 
                    min={1000} 
                    max={10000}
                    placeholder="3000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInstructions">Additional Instructions</Label>
                <Textarea 
                  id="additionalInstructions"
                  name="additionalInstructions" 
                  value={form.additionalInstructions} 
                  onChange={handleChange}
                  placeholder="Any specific requirements, focus areas, or special instructions..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
                <Settings className="w-4 h-4 text-blue-600" />
                <div className="text-sm text-blue-700">
                  <strong>Target:</strong> {form.wordCount} words • <strong>Estimated Parts:</strong> {calculateTotalParts(form.wordCount)} parts 
                  ({Math.ceil(form.wordCount / calculateTotalParts(form.wordCount))} words per part)
                  <span className="ml-2 font-semibold text-purple-600">• Tags generated after completion</span>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting Generation...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Automatic Article Generation
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'generating' && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-8">
              {/* Loading Spinner - Smaller and properly contained */}
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              
              {/* Content Section - Properly spaced */}
              <div className="space-y-6 w-full max-w-md">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-semibold text-slate-900">
                    Auto-Generating Complete Article - Part {currentPart} of {totalParts}
                  </h3>
                  <p className="text-slate-600">
                    AI is automatically generating your complete article...
                  </p>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Progress</span>
                    <span className="text-sm font-bold text-purple-600">{generationProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${generationProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Part {currentPart}</span>
                    <span>Part {totalParts}</span>
                  </div>
                </div>
                
                {/* Badges */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">{form.topic}</Badge>
                  <Badge variant="outline" className="border-purple-200 text-purple-600">{form.wordCount} target words</Badge>
                  <Badge variant="outline" className="border-green-200 text-green-600 bg-green-50">
                    <Zap className="w-3 h-3 mr-1" />
                    Auto Mode
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'cleaning' && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-8">
              {/* Cleaning Spinner */}
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                <Sparkles className="w-6 h-6 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              
              {/* Content Section */}
              <div className="space-y-6 w-full max-w-md">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-semibold text-slate-900">
                    Cleaning Up Article Content
                  </h3>
                  <p className="text-slate-600">
                    Please wait while we clean up, format your article, and generate relevant tags...
                  </p>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Cleanup Progress</span>
                    <span className="text-sm font-bold text-green-600">Processing...</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                {/* Badges */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Cleaning
                  </Badge>
                  <Badge variant="outline" className="border-green-200 text-green-600 bg-green-50">
                    Auto Cleanup
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'review' && (
        <div className="space-y-6">
          {/* Progress Header */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Article Complete!
                    </h3>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Complete
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <BarChart3 className="w-4 h-4" />
                  <span>Progress:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: totalParts }, (_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          i < currentPart ? 'bg-green-500' : 'bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-purple-600">100%</span>
                </div>
              </div>

              {/* Article Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{finalWordCount}</div>
                    <div className="text-sm text-blue-600 font-medium">Final Words</div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{form.wordCount}</div>
                    <div className="text-sm text-purple-600 font-medium">Target Words</div>
                  </div>
                </div>
              </div>

              {/* Auto-generated Tags Display */}
              {autoTags.length > 0 && (
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-3 block">Auto-Generated Tags (Based on Content)</Label>
                  <div className="flex flex-wrap gap-2 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200/50">
                    {autoTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Overall Progress</span>
                  <span className="text-sm font-bold text-purple-600">100% Complete</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: '100%' }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Started</span>
                  <span>Complete</span>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handlePublish} 
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing to WordPress...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Publish Complete Article (100%)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'done' && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold text-green-700">Article Published Successfully!</h3>
                <p className="text-slate-600">Your article has been published to WordPress</p>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  WordPress Post ID: {publishedId}
                </Badge>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="text-left">
              <h4 className="font-semibold mb-4 text-slate-900">Complete Article Preview</h4>
              <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-mono text-slate-700">{parts.join('\n\n')}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && step === 'form' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
} 