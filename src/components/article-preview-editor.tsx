'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { 
  Eye, 
  Edit3, 
  Save, 
  Upload, 
  FileText, 
  CheckCircle, 
  Loader2,
  Copy,
  Download,
  Settings,
  X,
  Maximize2,
  Minimize2,
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Link,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Sparkles,
  ExternalLink
} from 'lucide-react'

interface ArticlePreviewEditorProps {
  currentContent: string
  isGenerating: boolean
  currentPart: number
  totalParts: number
  onPublishDraft: (content: string, title?: string, tags?: string[], category?: string) => Promise<number | string>
  onContentUpdate?: (content: string) => void
}

export function ArticlePreviewEditor({
  currentContent,
  isGenerating,
  currentPart,
  totalParts,
  onPublishDraft,
  onContentUpdate
}: ArticlePreviewEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [editedContent, setEditedContent] = useState(currentContent)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState('')
  const [fontSize, setFontSize] = useState(14)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Calculate progress percentage
  const calculateProgress = (current: number, total: number): number => {
    return Math.min(100, Math.round((current / total) * 100));
  };

  // Update edited content when currentContent changes
  useEffect(() => {
    setEditedContent(currentContent)
  }, [currentContent])

  const handleEdit = () => {
    setEditedContent(currentContent)
    setIsEditing(true)
  }

  const handleSave = () => {
    onContentUpdate?.(editedContent)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedContent(currentContent)
    setIsEditing(false)
  }

  const handlePublishDraft = async () => {
    setIsPublishing(true)
    try {
      // Clean the content before publishing
      const cleanedContent = editedContent.replace(/Continue Generating\?/gi, '').trim()
      const result = await onPublishDraft(cleanedContent)
      
      // Extract the URL from the result
      if (typeof result === 'string') {
        setPublishedUrl(result)
      } else if (typeof result === 'number') {
        // Generate a default URL based on WordPress site
        const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://your-wordpress-site.com'
        setPublishedUrl(`${wpUrl}/?p=${result}`)
      } else {
        // Fallback URL
        setPublishedUrl('https://your-wordpress-site.com')
      }
      
      setShowSuccess(true)
    } catch (error) {
      console.error('Failed to publish draft:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleCopyContent = () => {
    navigator.clipboard.writeText(cleanedContent)
  }

  const handleDownloadMarkdown = () => {
    const blob = new Blob([cleanedContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'article.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

    const handleCleanupContent = () => {
    // Clean up the content by removing unwanted elements
    let cleaned = editedContent
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
      .trim()
   
    setEditedContent(cleaned)
    onContentUpdate?.(cleaned)
  }

  // Rich text formatting functions
  const insertText = (text: string) => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = editedContent.substring(0, start)
    const after = editedContent.substring(end)
    
    setEditedContent(before + text + after)
    
    // Set cursor position after inserted text
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = start + text.length
        textareaRef.current.selectionEnd = start + text.length
        textareaRef.current.focus()
      }
    }, 0)
  }

  const formatText = (format: string) => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = editedContent.substring(start, end)
    
    let formattedText = ''
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        break
      case 'h1':
        formattedText = `# ${selectedText}`
        break
      case 'h2':
        formattedText = `## ${selectedText}`
        break
      case 'h3':
        formattedText = `### ${selectedText}`
        break
      case 'quote':
        formattedText = `> ${selectedText}`
        break
      case 'list':
        formattedText = `- ${selectedText}`
        break
      case 'link':
        formattedText = `[${selectedText}](url)`
        break
    }
    
    const before = editedContent.substring(0, start)
    const after = editedContent.substring(end)
    setEditedContent(before + formattedText + after)
  }

  // Clean the content for display by removing "Continue Generating?" and similar phrases
  const cleanedContent = currentContent.replace(/Continue Generating\?/gi, '').trim()
  const wordCount = cleanedContent.split(/\s+/).filter(Boolean).length
  const charCount = cleanedContent.length

  if (isFullScreen && isEditing) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
        {/* Full Screen Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Full Screen Editor</h2>
            <Badge variant="outline">{wordCount} words</Badge>
            <Badge variant="outline">{charCount} characters</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Font Size Control */}
            <div className="flex items-center gap-2">
              <Label className="text-sm">Font:</Label>
              <select 
                value={fontSize} 
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value={12}>12px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
                <option value={20}>20px</option>
              </select>
            </div>
            
            <Button size="sm" variant="outline" onClick={() => setIsFullScreen(false)}>
              <Minimize2 className="w-4 h-4 mr-2" />
              Exit Full Screen
            </Button>
          </div>
        </div>

        {/* Rich Text Toolbar */}
        <div className="flex items-center gap-2 p-4 border-b bg-gray-50 dark:bg-gray-800">
          <Button size="sm" variant="outline" onClick={() => formatText('h1')} title="Heading 1">
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => formatText('h2')} title="Heading 2">
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => formatText('h3')} title="Heading 3">
            <Heading3 className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button size="sm" variant="outline" onClick={() => formatText('bold')} title="Bold">
            <Bold className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => formatText('italic')} title="Italic">
            <Italic className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button size="sm" variant="outline" onClick={() => formatText('list')} title="List">
            <List className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => formatText('quote')} title="Quote">
            <Quote className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => formatText('link')} title="Link">
            <Link className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button size="sm" variant="outline" onClick={handleCopyContent} title="Copy">
            <Copy className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadMarkdown} title="Download">
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* Full Screen Editor */}
        <div className="flex-1 p-4">
          <Textarea
            ref={textareaRef}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="Edit your article content here..."
            className="w-full h-full min-h-[calc(100vh-200px)] font-mono resize-none border-0 focus:ring-0"
            style={{ fontSize: `${fontSize}px` }}
          />
        </div>

        {/* Full Screen Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
          
          <Button 
            onClick={handlePublishDraft}
            disabled={isPublishing || !editedContent.trim()}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Publish to WordPress
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Live Preview Header */}
      <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
              <Eye className="w-5 h-5 text-white" />
            </div>
            Live Article Preview
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="font-medium">{wordCount} words</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="font-medium">{charCount} characters</span>
            </div>
            {isGenerating && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                Generating Part {currentPart}/{totalParts} ({calculateProgress(currentPart, totalParts)}%)
              </Badge>
            )}
          </div>
          
          {/* Generation Progress Bar */}
          {isGenerating && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Generation Progress</span>
                <span className="text-sm font-bold text-blue-600">{calculateProgress(currentPart, totalParts)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${calculateProgress(currentPart, totalParts)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Part 1</span>
                <span>Part {totalParts}</span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Edit Article Content</Label>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsFullScreen(true)}
                    title="Full Screen Editor"
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Full Screen
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
              
              {/* Rich Text Toolbar */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                <Button size="sm" variant="outline" onClick={() => formatText('h1')} title="Heading 1">
                  <Heading1 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => formatText('h2')} title="Heading 2">
                  <Heading2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => formatText('h3')} title="Heading 3">
                  <Heading3 className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button size="sm" variant="outline" onClick={() => formatText('bold')} title="Bold">
                  <Bold className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => formatText('italic')} title="Italic">
                  <Italic className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button size="sm" variant="outline" onClick={() => formatText('list')} title="List">
                  <List className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => formatText('quote')} title="Quote">
                  <Quote className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => formatText('link')} title="Link">
                  <Link className="w-4 h-4" />
                </Button>
              </div>
              
              <Textarea
                ref={textareaRef}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Edit your article content here..."
                className="min-h-[400px] font-mono text-sm"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Article Content</Label>
                                 <div className="flex gap-2">
                   <Button 
                     size="sm" 
                     variant="outline" 
                     onClick={handleCopyContent}
                   >
                     <Copy className="w-4 h-4 mr-2" />
                     Copy
                   </Button>
                   <Button 
                     size="sm" 
                     variant="outline" 
                     onClick={handleDownloadMarkdown}
                   >
                     <Download className="w-4 h-4 mr-2" />
                     Download
                   </Button>
                   <Button 
                     size="sm" 
                     variant="outline" 
                     onClick={handleCleanupContent}
                     className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                   >
                     <Sparkles className="w-4 h-4 mr-2" />
                     Clean Up
                   </Button>
                   <Button 
                     size="sm" 
                     variant="outline" 
                     onClick={handleEdit}
                   >
                     <Edit3 className="w-4 h-4 mr-2" />
                     Edit
                   </Button>
                 </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">{cleanedContent}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publishing Tools */}
      <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
              <Upload className="w-5 h-5 text-white" />
            </div>
            Publishing Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <div className="text-sm text-blue-700">
              <strong>Ready to publish?</strong> Your article will be saved as a draft in WordPress.
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handlePublishDraft}
              disabled={isPublishing || !currentContent.trim()}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing Draft...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Publish Draft to WordPress
                </>
              )}
            </Button>
          </div>

          {showSuccess && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  Draft published successfully to WordPress!
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Article Statistics */}
      <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Article Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50">
              <div className="text-3xl font-bold text-purple-600">{wordCount}</div>
              <div className="text-sm text-purple-600 font-medium">Words</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
              <div className="text-3xl font-bold text-blue-600">{charCount}</div>
              <div className="text-sm text-blue-600 font-medium">Characters</div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Estimated reading time:</span>
              <span className="font-semibold text-slate-900">{Math.ceil(wordCount / 200)} minutes</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Current parts:</span>
              <span className="font-semibold text-slate-900">{currentPart} of {totalParts} ({calculateProgress(currentPart, totalParts)}%)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Status:</span>
              <Badge variant={isGenerating ? "secondary" : "default"} className={isGenerating ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-green-100 text-green-700 border-green-200"}>
                {isGenerating ? "Generating" : "Ready"}
              </Badge>
            </div>
            {!isGenerating && currentPart === totalParts && (
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-700">Generation complete:</span>
                <span className="font-semibold text-green-700">100%</span>
              </div>
            )}
          </div>
                 </CardContent>
       </Card>

       {/* Success Modal */}
       {showSuccess && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
             <div className="text-center space-y-6">
               {/* Success Icon */}
               <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                 <CheckCircle className="w-12 h-12 text-green-600" />
               </div>
               
               {/* Success Message */}
               <div className="space-y-3">
                 <h3 className="text-2xl font-bold text-slate-900">Published Successfully!</h3>
                 <p className="text-slate-600">Your article has been published to WordPress as a draft.</p>
               </div>
               
               {/* Article Link */}
               <div className="space-y-3">
                 <div className="flex items-center justify-center gap-2">
                   <Link className="w-4 h-4 text-blue-600" />
                   <span className="text-sm font-medium text-slate-700">Article Link:</span>
                 </div>
                 <div className="bg-slate-50 rounded-lg p-3 border">
                   <a 
                     href={publishedUrl} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-blue-600 hover:text-blue-700 text-sm break-all"
                   >
                     {publishedUrl}
                   </a>
                 </div>
               </div>
               
               {/* Action Buttons */}
               <div className="flex gap-3 pt-4">
                 <Button
                   onClick={() => window.open(publishedUrl, '_blank')}
                   className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                 >
                   <ExternalLink className="w-4 h-4 mr-2" />
                   Open in New Tab
                 </Button>
                 <Button
                   onClick={() => setShowSuccess(false)}
                   variant="outline"
                   className="flex-1"
                 >
                   Close
                 </Button>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   )
 } 