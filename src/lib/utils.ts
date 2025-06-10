import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(date: Date | string) {
  const d = new Date(date)
  return d.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export function formatDate(date: Date | string) {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) {
    return 'Aujourd\'hui'
  } else if (d.toDateString() === yesterday.toDateString()) {
    return 'Hier'
  } else {
    return d.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    })
  }
}