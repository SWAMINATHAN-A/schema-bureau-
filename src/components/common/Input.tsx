import React, { useId } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  trailing?: React.ReactNode;
}

export function Input({ label, hint, error, trailing, className, id, ...rest }: InputProps) {
  const generated = useId();
  const inputId = id ?? generated;

  return (
    <div className="w-full">
      {label ?
      <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-muted">
          {label}
        </label> :
      null}
      <div className="relative">
        <input
          {...rest}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            'h-10 w-full rounded border bg-surface2 px-3 text-sm text-fg placeholder:text-faint transition-colors duration-150 ease-out',
            'border-line hover:border-line2 focus:border-accent focus:outline-none',
            error && 'border-danger',
            trailing && 'pr-10',
            className
          )} />
        
        {trailing ? <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">{trailing}</div> : null}
      </div>
      {error ?
      <p id={`${inputId}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p> :
      hint ?
      <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-faint">
          {hint}
        </p> :
      null}
    </div>);

}