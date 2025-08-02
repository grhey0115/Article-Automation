'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FileText, ExternalLink, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Article {
  id: string
  title: string
  status: string
  wordCount: number
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
  wordpressId?: string
}

export function ArticleList() {
  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ['/api/articles'],
    queryFn: () => fetch('/api/articles').then(res => res.json()),
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading articles...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        Failed to load articles
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No articles yet</p>
        <p className="text-sm">
          Create your first article using AI generation or ChatGPT import
        </p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'generating':
      case 'publishing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'failed':
        return <AlertCircle className="w-4 h-4" />
      case 'generating':
      case 'publishing':
        return <Loader2 className="w-4 h-4 animate-spin" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-4">
      {articles.map((article: Article) => (
        <Card key={article.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-sm leading-tight line-clamp-2">
                  {article.title}
                </h4>
                <Badge 
                  className={`ml-2 shrink-0 ${getStatusColor(article.status)}`}
                  variant="secondary"
                >
                  <span className="flex items-center gap-1">
                    {getStatusIcon(article.status)}
                    {article.status}
                  </span>
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{article.category}</span>
                <span>•</span>
                <span>{article.wordCount} words</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}</span>
              </div>

              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {article.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {article.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{article.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {article.status === 'completed' && article.wordpressId && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Published as Draft #{article.wordpressId}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 text-xs"
                      onClick={() => window.open('https://allactionalarm.com/wp-admin/edit.php', '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View in WordPress
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}