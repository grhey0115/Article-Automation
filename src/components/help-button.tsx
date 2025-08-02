'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { 
  HelpCircle, 
  Play, 
  BookOpen, 
  Lightbulb,
  Sparkles
} from 'lucide-react'

interface HelpButtonProps {
  onStartWalkthrough: () => void
}

export function HelpButton({ onStartWalkthrough }: HelpButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="fixed top-4 right-4 z-40">
      <Button
        size="sm"
        variant="outline"
        className={`bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg transition-all duration-300 hover:shadow-xl ${
          isHovered ? 'scale-105' : 'scale-100'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onStartWalkthrough}
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Help & Tutorial
      </Button>
      
      {/* Floating tip */}
      {isHovered && (
        <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl border border-slate-200 p-3 w-64">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 rounded">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-sm">
              <div className="font-semibold text-slate-900 mb-1">Interactive Tutorial</div>
              <div className="text-slate-600">
                Learn how to create professional articles with AI assistance. Step-by-step guidance through the entire process.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 