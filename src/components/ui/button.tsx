import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-soft hover:shadow-glow-blue hover:scale-105 active:scale-95',
        secondary: 'bg-white text-slate-700 border-2 border-light-300 shadow-soft hover:border-primary-300 hover:bg-primary-50 hover:scale-105 active:scale-95',
        destructive: 'bg-gradient-to-r from-coral-400 to-coral-500 text-white shadow-soft hover:from-coral-500 hover:to-coral-600 hover:scale-105 active:scale-95',
        outline: 'border-2 border-primary-300 text-primary-600 bg-transparent hover:bg-primary-50 hover:border-primary-400 hover:scale-105 active:scale-95',
        ghost: 'text-slate-600 hover:bg-light-200 hover:text-slate-800 hover:scale-105 active:scale-95',
        link: 'text-primary-600 underline-offset-4 hover:underline hover:text-primary-700',
        yellow: 'bg-gradient-to-r from-secondary-300 to-secondary-400 text-slate-800 shadow-soft hover:from-secondary-400 hover:to-secondary-500 hover:shadow-glow-yellow hover:scale-105 active:scale-95',
        green: 'bg-gradient-to-r from-accent-300 to-accent-400 text-white shadow-soft hover:from-accent-400 hover:to-accent-500 hover:shadow-glow-green hover:scale-105 active:scale-95',
        purple: 'bg-gradient-to-r from-purple-300 to-purple-400 text-white shadow-soft hover:from-purple-400 hover:to-purple-500 hover:shadow-glow-purple hover:scale-105 active:scale-95',
        pink: 'bg-gradient-to-r from-pink-300 to-pink-400 text-white shadow-soft hover:from-pink-400 hover:to-pink-500 hover:shadow-glow-pink hover:scale-105 active:scale-95',
      },
      size: {
        default: 'h-12 px-6 py-2.5 text-base',
        sm: 'h-10 rounded-xl px-4 text-sm',
        lg: 'h-14 rounded-2xl px-8 text-lg',
        xl: 'h-16 rounded-3xl px-10 text-lg',
        icon: 'h-12 w-12 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
