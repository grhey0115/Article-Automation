'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Play, 
  FileText, 
  Edit3, 
  Upload, 
  CheckCircle,
  Sparkles,
  X,
  ArrowRight,
  Lightbulb
} from 'lucide-react'

interface QuickStartGuideProps {
  isVisible: boolean
  onClose: () => void
  onStartWalkthrough: () => void
}

const QUICK_STEPS = [
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'Fill the Form',
    description: 'Enter your topic, word count, and tags'
  },
  {
    icon: <Play className="w-5 h-5" />,
    title: 'Start Generating',
    description: 'Click generate and review each part'
  },
  {
    icon: <Edit3 className="w-5 h-5" />,
    title: 'Edit & Refine',
    description: 'Use the preview editor to polish content'
  },
  {
    icon: <Upload className="w-5 h-5" />,
    title: 'Publish to WordPress',
    description: 'Save as draft and access WordPress editor'
  }
]

export function QuickStartGuide({ isVisible, onClose, onStartWalkthrough }: QuickStartGuideProps) {
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
      isClosing ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="bg-black/50 backdrop-blur-sm absolute inset-0" onClick={handleClose} />
      
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Welcome to Article Automation!</h2>
            <p className="text-blue-100 text-lg">Create professional, SEO-optimized articles in minutes</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Quick Start Steps */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                Quick Start Guide
              </h3>
              
              <div className="space-y-4">
                {QUICK_STEPS.map((step, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-blue-600">
                          {step.icon}
                        </div>
                        <h4 className="font-semibold text-slate-900">{step.title}</h4>
                      </div>
                      <p className="text-slate-600 text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features & Benefits */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Key Features
              </h3>
              
              <div className="space-y-4">
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">AI-Powered Generation</h4>
                        <p className="text-blue-800 text-sm">Advanced AI creates high-quality, unique content tailored to your specifications</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-900 mb-1">SEO Optimization</h4>
                        <p className="text-green-800 text-sm">Automatic SEO metadata, focus keyphrases, and tag generation</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1">Interactive Editing</h4>
                        <p className="text-purple-800 text-sm">Real-time preview with rich text editing and content cleanup tools</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-orange-900 mb-1">WordPress Integration</h4>
                        <p className="text-orange-800 text-sm">Direct publishing to WordPress with draft management and editor access</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onStartWalkthrough}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Interactive Tutorial
              </Button>
              
              <Button
                onClick={handleClose}
                variant="outline"
                className="px-8 py-3"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Start Creating Now
              </Button>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-slate-500 text-sm">
                Need help? Click the "Help & Tutorial" button in the top-right corner anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 