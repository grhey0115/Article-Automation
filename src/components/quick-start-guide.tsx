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
         <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white relative">
           <Button
             variant="ghost"
             size="sm"
             onClick={handleClose}
             className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:bg-white/20"
           >
             <X className="w-4 h-4 sm:w-5 sm:h-5" />
           </Button>
           
           <div className="text-center">
             <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
               <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
             </div>
             <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Welcome to Article Automation!</h2>
             <p className="text-blue-100 text-sm sm:text-base lg:text-lg">Create professional, SEO-optimized articles in minutes</p>
           </div>
         </div>

                 {/* Content */}
         <div className="p-4 sm:p-6 lg:p-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
             {/* Quick Start Steps */}
             <div>
               <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
                 <Play className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                 Quick Start Guide
               </h3>
               
               <div className="space-y-3 sm:space-y-4">
                 {QUICK_STEPS.map((step, index) => (
                   <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-lg">
                     <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                       <span className="text-blue-600 font-semibold text-xs sm:text-sm">{index + 1}</span>
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-1">
                         <div className="text-blue-600">
                           {step.icon}
                         </div>
                         <h4 className="font-semibold text-slate-900 text-sm sm:text-base">{step.title}</h4>
                       </div>
                       <p className="text-slate-600 text-xs sm:text-sm">{step.description}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* Features & Benefits */}
             <div>
               <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
                 <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                 Key Features
               </h3>
               
               <div className="space-y-3 sm:space-y-4">
                 <Card className="border-blue-200 bg-blue-50">
                   <CardContent className="p-3 sm:p-4">
                     <div className="flex items-start gap-3">
                       <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                       <div className="min-w-0">
                         <h4 className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">AI-Powered Generation</h4>
                         <p className="text-blue-800 text-xs sm:text-sm">Advanced AI creates high-quality, unique content tailored to your specifications</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 <Card className="border-green-200 bg-green-50">
                   <CardContent className="p-3 sm:p-4">
                     <div className="flex items-start gap-3">
                       <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                       <div className="min-w-0">
                         <h4 className="font-semibold text-green-900 mb-1 text-sm sm:text-base">SEO Optimization</h4>
                         <p className="text-green-800 text-xs sm:text-sm">Automatic SEO metadata, focus keyphrases, and tag generation</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 <Card className="border-purple-200 bg-purple-50">
                   <CardContent className="p-3 sm:p-4">
                     <div className="flex items-start gap-3">
                       <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                       <div className="min-w-0">
                         <h4 className="font-semibold text-purple-900 mb-1 text-sm sm:text-base">Interactive Editing</h4>
                         <p className="text-purple-800 text-xs sm:text-sm">Real-time preview with rich text editing and content cleanup tools</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 <Card className="border-orange-200 bg-orange-50">
                   <CardContent className="p-3 sm:p-4">
                     <div className="flex items-start gap-3">
                       <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                       <div className="min-w-0">
                         <h4 className="font-semibold text-orange-900 mb-1 text-sm sm:text-base">WordPress Integration</h4>
                         <p className="text-orange-800 text-xs sm:text-sm">Direct publishing to WordPress with draft management and editor access</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               </div>
             </div>
           </div>

                     {/* Action Buttons */}
           <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200">
             <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
               <Button
                 onClick={onStartWalkthrough}
                 className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
               >
                 <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                 Start Interactive Tutorial
               </Button>
               
               <Button
                 onClick={handleClose}
                 variant="outline"
                 className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
               >
                 <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                 Start Creating Now
               </Button>
             </div>
             
             <div className="text-center mt-3 sm:mt-4">
               <p className="text-slate-500 text-xs sm:text-sm">
                 Need help? Click the "Help & Tutorial" button in the top-right corner anytime
               </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
} 