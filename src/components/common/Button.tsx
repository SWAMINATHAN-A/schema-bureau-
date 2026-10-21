import React from 'react';
import { Loader2Icon } from 'lucide-react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-accentFg border border-accent hover:opacity-90',
  secondary: 'bg-surface2 text-fg border border-line hover:border-line2 hover:bg-elevated',
  ghost: 'bg-transparent text-muted border border-transparent hover:text-fg hover:bg-surface2',
  danger: 'bg-dangerSoft text-danger border border-danger hover:bg-danger hover:text-white'
};

const SIZES: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-[13px] gap-2',
  lg: 'h-11 px-5 text-sm gap-2'
};

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  fullWidth,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded font-medium transition-[background-color,border-color,color,opacity] duration-150 ease-out disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className
      )}>
      
      {loading ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden /> : icon}
      {children}
    </button>);

}