'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          'disabled:pointer-events-none disabled:opacity-50',
          // Variants
          {
            'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/25':
              variant === 'default',
            'bg-dark-800/80 backdrop-blur-xl text-dark-100 hover:bg-dark-700/80 border border-dark-700/50':
              variant === 'secondary',
            'border border-dark-600/50 bg-transparent hover:bg-dark-800/50 text-dark-100':
              variant === 'outline',
            'hover:bg-dark-800/50 text-dark-200 hover:text-dark-100':
              variant === 'ghost',
            'bg-red-600/90 hover:bg-red-700 text-white':
              variant === 'destructive',
          },
          // Sizes
          {
            'h-11 px-6 py-2 text-sm': size === 'default',
            'h-9 px-4 text-xs': size === 'sm',
            'h-12 px-8 text-base': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
