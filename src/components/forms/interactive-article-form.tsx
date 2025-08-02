import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Loader2, Play, CheckCircle, FileText, Settings, Upload, Sparkles, ArrowRight, Eye } from 'lucide-react';
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

interface InteractiveArticleFormProps {
  onPreviewUpdate?: (content: string, isGenerating: boolean, currentPart: number, totalParts: number) => void
  onFormDataUpdate?: (title: string, tags: string[], category: string) => void
  onPublishDraft?: (content: string, title: string, tags: string[], category: string) => Promise<number>
}

export function InteractiveArticleForm({ onPreviewUpdate, onFormDataUpdate, onPublishDraft }: InteractiveArticleFormProps) {
  const [step, setStep] = useState<'form' | 'generating' | 'review' | 'done'>('form' as const);
  const [form, setForm] = useState({
    topic: '',
    tags: '',
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

  const handleChange = (e: any) => {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
    
    // Update parent with form data
    if (onFormDataUpdate) {
      const tags = newForm.tags.split(',').map((t) => t.trim()).slice(0, 5);
      onFormDataUpdate(newForm.topic, tags, newForm.category);
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
    onPreviewUpdate?.('', true, 1, calculatedParts);
    await fetchPart(1, '');
  };

  const fetchPart = async (part: number, previousContent: string) => {
    setLoading(true);
    setError(null);
    try {
      // Calculate target words for this part
      const wordsPerPart = Math.ceil(form.wordCount / totalParts);
      const targetWords = part === totalParts ? form.wordCount - (wordsPerPart * (totalParts - 1)) : wordsPerPart;
      
      const res = await fetch('/api/articles/part', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: form.topic,
          part,
          totalParts,
          previousContent,
          tags: form.tags.split(',').map((t) => t.trim()).slice(0, 5),
          tone: form.tone,
          wordCount: targetWords,
          additionalInstructions: form.additionalInstructions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate part');
      setParts((prev) => [...prev, data.markdown]);
      setCurrentPart(part);
      const newContent = parts.join('\n\n') + '\n\n' + data.markdown;
      setCurrentContent(newContent);
      onPreviewUpdate?.(newContent, false, part, totalParts);
      setStep('review');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (currentPart < totalParts) {
      setStep('generating');
      onPreviewUpdate?.(currentContent, true, currentPart + 1, totalParts);
      await fetchPart(currentPart + 1, parts.join('\n\n'));
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
          tags: form.tags.split(',').map((t) => t.trim()).slice(0, 5),
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
      const tags = form.tags.split(',').map((t) => t.trim()).slice(0, 5);
      return await onPublishDraft(cleanedContent, form.topic, tags, form.category);
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
          tags: form.tags.split(',').map((t) => t.trim()).slice(0, 5),
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
              Interactive AI Article Generator
            </CardTitle>
            <p className="text-slate-600">
              Create comprehensive articles step-by-step with AI assistance. Each part will be generated and reviewed before continuing.
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

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated, up to 5)</Label>
                <Input 
                  id="tags"
                  name="tags" 
                  value={form.tags} 
                  onChange={handleChange} 
                  placeholder="smart home, security, cameras, technology, automation"
                />
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
                  <strong>Estimated Parts:</strong> {calculateTotalParts(form.wordCount)} parts 
                  ({Math.ceil(form.wordCount / calculateTotalParts(form.wordCount))} words per part)
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
                    Start Interactive Article Generation
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'generating' && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <Sparkles className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold text-slate-900">Generating Part {currentPart} of {totalParts}</h3>
                <p className="text-slate-600">AI is creating your article content...</p>
                <div className="flex items-center justify-center gap-3">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">{form.topic}</Badge>
                  <Badge variant="outline" className="border-purple-200 text-purple-600">{form.wordCount} words</Badge>
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
                    <h3 className="text-xl font-semibold text-slate-900">Part {currentPart} of {totalParts}</h3>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Generated
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
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
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {currentPart < totalParts ? (
                  <Button 
                    onClick={handleContinue} 
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Next Part...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Continue Generating Part {currentPart + 1}
                      </>
                    )}
                  </Button>
                ) : (
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
                        Publish Complete Article
                      </>
                    )}
                  </Button>
                )}
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