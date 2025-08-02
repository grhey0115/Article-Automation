'use client'

// This is a simplified toast implementation for Next.js
// In a real app, you'd use a proper toast library like react-hot-toast or sonner

import { useState } from 'react'

interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({ title, description, variant = 'default' }: Toast) => {
    // Simple console logging for now
    // In production, you'd integrate with a proper toast system
    if (variant === 'destructive') {
      console.error(`${title}: ${description}`)
    } else {
      console.log(`${title}: ${description}`)
    }
    
    // You could also show browser notifications here
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: description })
    }
  }

  return { toast }
}