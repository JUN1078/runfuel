import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]',
        secondary: 'bg-[var(--color-surface-light)] text-[var(--color-text-secondary)]',
        accent: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]',
        warning: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]',
        danger: 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]',
        purple: 'bg-[var(--color-purple)]/15 text-[var(--color-purple)]',
        orange: 'bg-[var(--color-orange)]/15 text-[var(--color-orange)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
