'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ConfigurationForm } from '@/components/forms/configuration-form'
import { ArticleList } from '@/components/article-list'
import { StatusIndicator } from '@/components/status-indicator'
import { Brain, FileText, Settings, Upload, Zap, Eye } from 'lucide-react'
import { InteractiveArticleForm } from '@/components/forms/interactive-article-form';
import { ArticlePreviewEditor } from '@/components/article-preview-editor';
import { Walkthrough } from '@/components/walkthrough';
import { HelpButton } from '@/components/help-button';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('interactive')
  const [previewContent, setPreviewContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentPart, setCurrentPart] = useState(1)
  const [totalParts, setTotalParts] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    tags: [] as string[],
    category: ''
  })
  const [showWalkthrough, setShowWalkthrough] = useState(false)

  

  // Fetch configuration status
  const { data: config } = useQuery({
    queryKey: ['/api/configuration'],
    queryFn: () => fetch('/api/configuration').then(res => res.json()),
  })

  // Fetch usage statistics
  const { data: usage } = useQuery({
    queryKey: ['/api/usage'],
    queryFn: () => fetch('/api/usage').then(res => res.json()),
  })

  const isConfigured = config?.isConfigured

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Help Button */}
      <HelpButton onStartWalkthrough={() => setShowWalkthrough(true)} />
      
      {/* Walkthrough */}
      <Walkthrough 
        isOpen={showWalkthrough}
        onClose={() => setShowWalkthrough(false)}
        onComplete={() => {
          setShowWalkthrough(false)
          // Mark walkthrough as completed in localStorage
          localStorage.setItem('walkthroughCompleted', 'true')
        }}
      />
      {/* Modern Header */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-lg shadow-blue-500/25">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20"></div>
              </div>
              <div>
                <h3 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  Article Automation
                </h3>
                <p className="text-lg text-slate-600 mt-2">AI-Powered Content Creation Platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="relative overflow-hidden border-0 shadow-lg shadow-blue-500/10 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <StatusIndicator status={isConfigured} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">System Status</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {isConfigured ? 'Ready' : 'Setup Required'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-0 shadow-lg shadow-purple-500/10 bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">AI Provider</p>
                  <p className="text-lg font-semibold text-slate-900">{config?.aiProvider || 'DeepSeek'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg shadow-green-500/10 bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Articles Generated</p>
                  <p className="text-lg font-semibold text-slate-900">{usage?.articlesGenerated || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg shadow-indigo-500/10 bg-gradient-to-br from-indigo-50 to-indigo-100/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <Upload className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">WordPress</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {config?.hasWordPressCredentials ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Left Column - Article Generator */}
          <div className="xl:col-span-2">
            <Card className="sticky top-8 border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  Article Generator
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Create comprehensive articles with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 p-1 rounded-lg">
                    <TabsTrigger value="interactive" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Interactive AI
                    </TabsTrigger>
                    <TabsTrigger value="config" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Settings
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="interactive" className="mt-6">
                    <InteractiveArticleForm 
                      onPreviewUpdate={(content, isGenerating, currentPart, totalParts) => {
                        setPreviewContent(content);
                        setIsGenerating(isGenerating);
                        setCurrentPart(currentPart);
                        setTotalParts(totalParts);
                      }}
                      onFormDataUpdate={(title, tags, category) => {
                        setFormData({ title, tags, category });
                      }}
                      onPublishDraft={async (content, title, tags, category) => {
                        try {
                          console.log('Attempting to publish draft...', { title, tags, category });
                          const res = await fetch('/api/articles/publish', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              title: title || 'Generated Article',
                              markdown: content,
                              tags: tags || ['ai-generated'],
                              category: category || 'Technology',
                              status: 'draft',
                            }),
                          });
                          
                          console.log('Publish response status:', res.status);
                          
                          if (!res.ok) {
                            const errorText = await res.text();
                            console.error('Publish error response:', errorText);
                            
                            if (errorText.includes('<!DOCTYPE')) {
                              throw new Error('Publish endpoint returned HTML instead of JSON. This usually means the endpoint is not found (404).');
                            }
                            
                            try {
                              const errorData = JSON.parse(errorText);
                              throw new Error(errorData.error || 'Failed to publish draft');
                            } catch {
                              throw new Error(`HTTP ${res.status}: ${errorText.substring(0, 200)}`);
                            }
                          }
                          
                          const data = await res.json();
                          console.log('Publish successful:', data);
                          return data.url || `${process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://allactionalarm.com/'}/wp-admin/post.php?post=${data.postId}&action=edit`;
                        } catch (err: any) {
                          console.error('Publish error:', err);
                          throw new Error(err.message);
                        }
                      }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="config" className="mt-6">
                    <ConfigurationForm />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Live Preview & Editor */}
          <div className="xl:col-span-3">
            {activeTab === 'interactive' && previewContent ? (
              <ArticlePreviewEditor
                currentContent={previewContent}
                isGenerating={isGenerating}
                currentPart={currentPart}
                totalParts={totalParts}
                onPublishDraft={async (content) => {
                  try {
                    console.log('Attempting to publish draft from preview editor...', formData);
                    const res = await fetch('/api/articles/publish', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title: formData.title || 'Generated Article',
                        markdown: content,
                        tags: formData.tags.length > 0 ? formData.tags : ['ai-generated'],
                        category: formData.category || 'Technology',
                        status: 'draft',
                      }),
                    });
                    
                    console.log('Publish response status:', res.status);
                    
                    if (!res.ok) {
                      const errorText = await res.text();
                      console.error('Publish error response:', errorText);
                      
                      if (errorText.includes('<!DOCTYPE')) {
                        throw new Error('Publish endpoint returned HTML instead of JSON. This usually means the endpoint is not found (404).');
                      }
                      
                      try {
                        const errorData = JSON.parse(errorText);
                        throw new Error(errorData.error || 'Failed to publish draft');
                      } catch {
                        throw new Error(`HTTP ${res.status}: ${errorText.substring(0, 200)}`);
                      }
                    }
                    
                    const data = await res.json();
                    console.log('Publish successful:', data);
                    return data.url || `${process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://allactionalarm.com/'}/wp-admin/post.php?post=${data.postId}&action=edit`;
                  } catch (err: any) {
                    console.error('Publish error:', err);
                    throw new Error(err.message);
                  }
                }}
                onContentUpdate={(content) => setPreviewContent(content)}
              />
            ) : (
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    Live Preview
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Start generating an article to see the live preview and editing tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-16 text-slate-500">
                    <div className="relative">
                      <FileText className="w-20 h-20 mx-auto mb-6 opacity-30" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No Content to Preview</h3>
                    <p className="text-slate-500">Fill out the form and start generating to see your article here</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}