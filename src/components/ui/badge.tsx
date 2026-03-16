import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        'transition-colors duration-200',
        {
          'bg-primary-500/20 text-primary-300 border border-primary-500/30':
            variant === 'default',
          'bg-dark-700/50 text-dark-200 border border-dark-600/50':
            variant === 'secondary',
          'bg-green-500/20 text-green-300 border border-green-500/30':
            variant === 'success',
          'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30':
            variant === 'warning',
          'bg-red-500/20 text-red-300 border border-red-500/30':
            variant === 'destructive',
        },
        className
      )}
      {...props}
    />
  )
}
