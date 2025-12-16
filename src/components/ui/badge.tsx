/* eslint-disable react-refresh/only-export-components -- Variant function export needed by shadcn/ui */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary',
  {
    variants: {
      variant: {
        default: 'border-ember-gold/30 bg-ember-gold/15 text-ember-gold hover:bg-ember-gold/25',
        secondary: 'border-white/20 bg-white/10 text-cream hover:bg-white/20',
        destructive:
          'border-status-danger/30 bg-status-danger/15 text-status-danger hover:bg-status-danger/25',
        success: 'border-ember-sage/30 bg-ember-sage/15 text-ember-sage hover:bg-ember-sage/25',
        outline: 'border-white/20 text-foreground hover:bg-white/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
