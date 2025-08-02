'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Play, 
  SkipForward, 
  SkipBack, 
  X, 
  HelpCircle, 
  Lightbulb,
  MousePointer,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react'

interface WalkthroughStep {
  id: string
  title: string
  description: string
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: () => void
  completed?: boolean
}

interface WalkthroughProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Article Automation! 🎉',
    description: 'This powerful tool helps you create high-quality, SEO-optimized articles using AI. Let\'s take a quick tour to get you started.',
    position: 'top'
  },
  {
    id: 'form-overview',
    title: 'Article Configuration',
    description: 'Start by filling out the article details. Enter a compelling topic, choose your target word count, and add relevant tags. The system will generate a comprehensive article based on your specifications.',
    target: 'interactive-form',
    position: 'bottom'
  },
  {
    id: 'word-count',
    title: 'Word Count Strategy',
    description: 'Choose your target word count carefully. For SEO, aim for 1000+ words. The system will break longer articles into manageable parts for better quality.',
    target: 'word-count-field',
    position: 'top'
  },
  {
    id: 'tags-category',
    title: 'SEO Optimization',
    description: 'Add relevant tags and select a category. The system will automatically generate additional tags if needed to ensure optimal SEO performance.',
    target: 'tags-category-section',
    position: 'bottom'
  },
  {
    id: 'generation-process',
    title: 'Interactive Generation',
    description: 'Click "Start Generating" to begin. The AI will create your article in parts, pausing for your review. You can continue or modify at each step.',
    target: 'generate-button',
    position: 'top'
  },
  {
    id: 'preview-editor',
    title: 'Live Preview & Editor',
    description: 'Watch your article come to life in real-time. Use the editing tools to refine content, add formatting, or clean up AI artifacts.',
    target: 'preview-section',
    position: 'left'
  },
  {
    id: 'cleanup-tools',
    title: 'Content Cleanup',
    description: 'Use the "Clean Up" button to remove AI metadata, page breaks, and formatting artifacts. This ensures your content is publication-ready.',
    target: 'cleanup-button',
    position: 'bottom'
  },
  {
    id: 'publishing',
    title: 'WordPress Publishing',
    description: 'Once satisfied, publish your article as a WordPress draft. You\'ll get a direct link to the WordPress editor for final review and publishing.',
    target: 'publish-button',
    position: 'top'
  },
  {
    id: 'success-modal',
    title: 'Success & Next Steps',
    description: 'After publishing, you\'ll see a success modal with a link to your WordPress draft. Click "Open in New Tab" to access the full WordPress editor.',
    position: 'top'
  },
  {
    id: 'completion',
    title: 'You\'re All Set! 🚀',
    description: 'Congratulations! You now know how to create professional articles with AI assistance. The system handles SEO optimization, content structure, and WordPress integration automatically.',
    position: 'top'
  }
]

export function Walkthrough({ isOpen, onClose, onComplete }: WalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setCurrentStep(0)
      setCompletedSteps(new Set())
    }
  }, [isOpen])

  const handleNext = () => {
    const currentStepData = WALKTHROUGH_STEPS[currentStep]
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]))
    
    if (currentStep < WALKTHROUGH_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(() => {
      onComplete()
      onClose()
    }, 300)
  }

  const currentStepData = WALKTHROUGH_STEPS[currentStep]
  const progress = ((currentStep + 1) / WALKTHROUGH_STEPS.length) * 100

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
      
      {/* Walkthrough Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Interactive Walkthrough</h2>
                  <p className="text-blue-100 text-sm">Step {currentStep + 1} of {WALKTHROUGH_STEPS.length}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleComplete}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Step Icon & Title */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {currentStepData.id === 'welcome' && <Sparkles className="w-8 h-8 text-blue-600" />}
                  {currentStepData.id === 'form-overview' && <MousePointer className="w-8 h-8 text-blue-600" />}
                  {currentStepData.id === 'word-count' && <Lightbulb className="w-8 h-8 text-blue-600" />}
                  {currentStepData.id === 'tags-category' && <CheckCircle className="w-8 h-8 text-blue-600" />}
                  {currentStepData.id === 'generation-process' && <Play className="w-8 h-8 text-blue-600" />}
                  {currentStepData.id === 'preview-editor' && <ArrowRight className="w-8 h-8 text-blue-600" />}
                  {currentStepData.id === 'cleanup-tools' && <Sparkles className="w-8 h-8 text-blue-600" />}
                  {currentStepData.id === 'publishing' && <CheckCircle className="w-8 h-8 text-blue-600" />}
                  {currentStepData.id === 'success-modal' && <Lightbulb className="w-8 h-8 text-blue-600" />}
                  {currentStepData.id === 'completion' && <Sparkles className="w-8 h-8 text-blue-600" />}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{currentStepData.title}</h3>
                <p className="text-slate-600 text-lg leading-relaxed">{currentStepData.description}</p>
              </div>

              {/* Step-specific tips */}
              {currentStepData.id === 'welcome' && (
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <strong>Pro Tip:</strong> This walkthrough will show you how to create professional articles in minutes. You can skip it anytime and access help later.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStepData.id === 'form-overview' && (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <strong>Best Practice:</strong> Be specific with your topic. Instead of "marketing," try "digital marketing strategies for small businesses in 2025."
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStepData.id === 'word-count' && (
                <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div className="text-sm text-orange-800">
                        <strong>SEO Tip:</strong> Articles with 1000+ words typically rank better. The system will break longer content into manageable parts.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStepData.id === 'generation-process' && (
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Play className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div className="text-sm text-purple-800">
                        <strong>Interactive Process:</strong> Review each part before continuing. You can edit content at any time during generation.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStepData.id === 'preview-editor' && (
                <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <MousePointer className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <div className="text-sm text-indigo-800">
                        <strong>Editing Features:</strong> Use the rich text toolbar for formatting, full-screen mode for detailed editing, and cleanup tools for final polish.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStepData.id === 'publishing' && (
                <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div className="text-sm text-emerald-800">
                        <strong>WordPress Integration:</strong> Articles are saved as drafts, so you can review and publish when ready. The system handles SEO metadata automatically.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStepData.id === 'completion' && (
                <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <strong>Ready to Create:</strong> You now have all the tools to create professional, SEO-optimized articles efficiently. Start with a simple topic and experiment!
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <SkipBack className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
              >
                Skip Walkthrough
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {currentStep + 1} / {WALKTHROUGH_STEPS.length}
              </Badge>
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {currentStep === WALKTHROUGH_STEPS.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Get Started
                  </>
                ) : (
                  <>
                    <SkipForward className="w-4 h-4 mr-2" />
                    Next
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 