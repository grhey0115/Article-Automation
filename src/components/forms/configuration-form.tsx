'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Settings, CheckCircle, AlertCircle } from 'lucide-react'

interface ConfigFormData {
  aiApiKey: string
  wordpressUrl: string
  wordpressUsername: string
  wordpressPassword: string
}

export function ConfigurationForm() {
  const { toast } = useToast()
  const { register, handleSubmit } = useForm<ConfigFormData>()

  const onSubmit = (data: ConfigFormData) => {
    toast({
      title: 'Configuration Note',
      description: 'In Next.js version, configuration is handled via environment variables. Please set them in your deployment environment.',
      variant: 'default'
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5" />
            <h3 className="text-lg font-semibold">System Configuration</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">AI Provider</span>
                <Badge variant="secondary">DeepSeek</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">AI API Key</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <Badge variant="outline">Configured</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">WordPress URL</span>
                <Badge variant="secondary">allactionalarm.com</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">WordPress Auth</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <Badge variant="outline">Connected</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                  Environment Configuration
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  In the Next.js version, configuration is managed through environment variables:
                </p>
                <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1 ml-4">
                  <li>• DEEPSEEK_API_KEY - Your DeepSeek API key</li>
                  <li>• OPENAI_API_KEY - Your OpenAI API key (optional)</li>
                  <li>• DATABASE_URL - PostgreSQL connection (optional)</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aiApiKey">AI API Key</Label>
                <Input
                  id="aiApiKey"
                  type="password"
                  {...register('aiApiKey')}
                  placeholder="Configure in environment variables"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wordpressUrl">WordPress URL</Label>
                <Input
                  id="wordpressUrl"
                  {...register('wordpressUrl')}
                  placeholder="https://your-site.com"
                  disabled
                  defaultValue="https://allactionalarm.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wordpressUsername">WordPress Username</Label>
                <Input
                  id="wordpressUsername"
                  {...register('wordpressUsername')}
                  placeholder="WordPress username"
                  disabled
                  defaultValue="Mae Amarillo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wordpressPassword">WordPress Password</Label>
                <Input
                  id="wordpressPassword"
                  type="password"
                  {...register('wordpressPassword')}
                  placeholder="WordPress app password"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button type="submit" className="w-full" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Configuration Managed via Environment
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/test-wordpress');
                      const data = await response.json();
                      
                      if (data.success) {
                        toast({
                          title: 'WordPress Test Successful',
                          description: 'WordPress connection is working properly!',
                          variant: 'default'
                        });
                      } else {
                        toast({
                          title: 'WordPress Test Failed',
                          description: data.error || 'Connection failed. Check your configuration.',
                          variant: 'destructive'
                        });
                      }
                    } catch (error) {
                      toast({
                        title: 'WordPress Test Error',
                        description: 'Failed to test WordPress connection. Check your .env.local file.',
                        variant: 'destructive'
                      });
                    }
                  }}
                >
                  Test WordPress Connection
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/debug-config');
                      const data = await response.json();
                      
                      if (data.success) {
                        console.log('Configuration Debug:', data);
                        toast({
                          title: 'Configuration Debug',
                          description: `Check console for details. Issues: ${data.issues.urlIssues.length + (data.issues.missingConfig ? 1 : 0)}`,
                          variant: data.issues.missingConfig || data.issues.urlIssues.length > 0 ? 'destructive' : 'default'
                        });
                      }
                    } catch (error) {
                      toast({
                        title: 'Debug Error',
                        description: 'Failed to get configuration debug info.',
                        variant: 'destructive'
                      });
                    }
                  }}
                >
                  Debug Config
                </Button>
              </div>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}