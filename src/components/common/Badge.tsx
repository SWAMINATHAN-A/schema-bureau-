import React from 'react';
import { cn } from '../../utils/cn';

type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'danger';

const TONES: Record<Tone, string> = {
  neutral: 'border-line bg-surface2 text-muted',
  accent: 'border-accent bg-accentSoft text-accent',
  ok: 'border-ok bg-okSoft text-ok',
  warn: 'border-warn bg-warnSoft text-warn',
  danger: 'border-danger bg-dangerSoft text-danger'
};

export function Badge({
  tone = 'neutral',
  mono,
  className,
  children





}: {tone?: Tone;mono?: boolean;className?: string;children: React.ReactNode;}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-2xs font-medium leading-none',
        mono && 'font-mono',
        TONES[tone],
        className
      )}>
      
      {children}
    </span>);

}