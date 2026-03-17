'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-2xl border-2 border-light-300',
          'bg-white px-4 py-3 text-base text-slate-700',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400',
          'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-50',
          'transition-all duration-200',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[140px] w-full rounded-2xl border-2 border-light-300',
          'bg-white px-4 py-3 text-base text-slate-700',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400',
          'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-50',
          'transition-all duration-200',
          'resize-none',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
