import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'error' | 'warning'
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border p-4 text-sm',
          {
            'border-ink/10 bg-white/80 text-ink': variant === 'default',
            'border-[hsl(var(--accent-emerald))]/30 bg-[hsl(var(--accent-emerald))]/10 text-[hsl(var(--accent-emerald))]':
              variant === 'success',
            'border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]':
              variant === 'error',
            'border-[hsl(var(--accent-amber))]/30 bg-[hsl(var(--accent-amber))]/10 text-[hsl(var(--accent-amber))]':
              variant === 'warning',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Alert.displayName = 'Alert'

