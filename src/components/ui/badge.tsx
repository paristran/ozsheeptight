import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info' | 'purple' | 'pink'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium',
        'transition-all duration-200',
        {
          'bg-primary-100 text-primary-700 border border-primary-200':
            variant === 'default',
          'bg-slate-100 text-slate-600 border border-slate-200':
            variant === 'secondary',
          'bg-accent-100 text-accent-700 border border-accent-200':
            variant === 'success',
          'bg-secondary-100 text-secondary-700 border border-secondary-200':
            variant === 'warning',
          'bg-coral-100 text-coral-700 border border-coral-200':
            variant === 'destructive',
          'bg-sky-100 text-sky-700 border border-sky-200':
            variant === 'info',
          'bg-purple-100 text-purple-700 border border-purple-200':
            variant === 'purple',
          'bg-pink-100 text-pink-700 border border-pink-200':
            variant === 'pink',
        },
        className
      )}
      {...props}
    />
  )
}
