import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { highlightSql } from '../../utils/highlight';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  errorLines?: number[];
  warningLines?: number[];
  onSubmit?: () => void;
}

export function SqlEditor({ value, onChange, errorLines = [], warningLines = [], onSubmit }: SqlEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const stripesRef = useRef<HTMLDivElement>(null);
  const [activeLine, setActiveLine] = useState(1);

  const lines = useMemo(() => value.split('\n'), [value]);
  const html = useMemo(() => highlightSql(value), [value]);

  const syncScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
    if (stripesRef.current) stripesRef.current.scrollTop = ta.scrollTop;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = ta.scrollTop;
      highlightRef.current.scrollLeft = ta.scrollLeft;
    }
  }, []);

  const updateActiveLine = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const upto = ta.value.slice(0, ta.selectionStart);
    setActiveLine(upto.split('\n').length);
  }, []);

  useEffect(() => {
    syncScroll();
  }, [value, syncScroll]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      onSubmit?.();
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      const ta = event.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = `${value.slice(0, start)}    ${value.slice(end)}`;
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = start + 4;
        ta.selectionEnd = start + 4;
      });
    }
  };

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden bg-surface font-mono text-[12.5px] leading-[20px]">
      <div
        ref={gutterRef}
        aria-hidden
        className="w-11 shrink-0 select-none overflow-hidden border-r border-line bg-surface py-3 text-right">
        
        {lines.map((_, index) => {
          const line = index + 1;
          const isError = errorLines.includes(line);
          const isWarning = !isError && warningLines.includes(line);
          return (
            <div
              key={line}
              className={cn(
                'relative pr-2.5 tabular-nums',
                isError ? 'text-danger' : isWarning ? 'text-warn' : line === activeLine ? 'text-fg' : 'text-faint'
              )}>
              
              {(isError || isWarning) &&
              <span
                className={cn(
                  'absolute left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full',
                  isError ? 'bg-danger' : 'bg-warn'
                )} />

              }
              {line}
            </div>);

        })}
      </div>

      <div className="relative min-w-0 flex-1">
        <div ref={stripesRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden py-3">
          {lines.map((_, index) => {
            const line = index + 1;
            const isError = errorLines.includes(line);
            const isWarning = !isError && warningLines.includes(line);
            return (
              <div
                key={line}
                className={cn(
                  'h-5',
                  isError ? 'bg-dangerSoft' : isWarning ? 'bg-warnSoft' : line === activeLine ? 'bg-surface2' : ''
                )} />);


          })}
        </div>

        <pre
          ref={highlightRef}
          aria-hidden
          className="nx-scroll pointer-events-none absolute inset-0 overflow-auto whitespace-pre px-3 py-3 text-fg">
          
          <code dangerouslySetInnerHTML={{ __html: `${html}\n` }} />
        </pre>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onScroll={syncScroll}
          onKeyUp={updateActiveLine}
          onClick={updateActiveLine}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="SQL schema editor"
          placeholder="CREATE TABLE ..."
          className="nx-scroll absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent px-3 py-3 text-transparent caret-accent outline-none placeholder:text-faint" />
        
      </div>
    </div>);

}