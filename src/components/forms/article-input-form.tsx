'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Sparkles } from 'lucide-react'

interface ArticleFormData {
  title: string
  category: string
  tags: string
  wordCount: number
  tone: string
  additionalInstructions?: string
}

export function ArticleInputForm() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, setValue, watch } = useForm<ArticleFormData>({
    defaultValues: {
      wordCount: 6000,
      tone: 'professional'
    }
  })

  const createArticle = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to create article')
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: 'Article generation started',
        description: 'Your article is being generated with AI. This may take a few minutes.'
      })
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] })
      reset()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to start article generation. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const onSubmit = (data: ArticleFormData) => {
    createArticle.mutate(data)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Article Title *</Label>
              <Input
                id="title"
                {...register('title', { required: true })}
                placeholder="Enter your article title..."
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                {...register('category', { required: true })}
                placeholder="e.g., Technology, Health, Business"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wordCount">Word Count</Label>
              <Select onValueChange={(value) => setValue('wordCount', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select word count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3000">3,000 words</SelectItem>
                  <SelectItem value="5000">5,000 words</SelectItem>
                  <SelectItem value="6000">6,000 words</SelectItem>
                  <SelectItem value="7000">7,000 words</SelectItem>
                  <SelectItem value="10000">10,000 words</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select onValueChange={(value) => setValue('tone', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                {...register('tags')}
                placeholder="tag1, tag2, tag3"
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInstructions">Additional Instructions</Label>
            <Textarea
              id="additionalInstructions"
              {...register('additionalInstructions')}
              placeholder="Any specific requirements or guidelines for the article..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            disabled={createArticle.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {createArticle.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Article...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Article with AI
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}