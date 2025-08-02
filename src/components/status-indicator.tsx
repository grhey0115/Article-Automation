'use client'

import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface StatusIndicatorProps {
  status: boolean | undefined
  className?: string
}

export function StatusIndicator({ status, className = '' }: StatusIndicatorProps) {
  if (status === undefined) {
    return <AlertCircle className={`w-4 h-4 text-yellow-500 ${className}`} />
  }
  
  if (status) {
    return <CheckCircle className={`w-4 h-4 text-green-500 ${className}`} />
  }
  
  return <XCircle className={`w-4 h-4 text-red-500 ${className}`} />
}