import React, { useEffect, useRef, useState } from 'react';
import { SendIcon, SparklesIcon } from 'lucide-react';
import { aiService, type AIMessage } from '../../services/aiService';
import type { ParsedSchema } from '../../types/schema';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';
import { uid } from '../../utils/id';

const SUGGESTIONS = [
"Explain this schema like I'm a beginner.",
'Why is this relationship many-to-one?',
'What is a composite key?',
'Find possible schema issues.',
'Explain normalization.'];


export function TutorPanel({ schema, className }: {schema: ParsedSchema | null;className?: string;}) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    setInput('');
    const userMessage: AIMessage = { id: uid('msg'), role: 'user', content: trimmed, source: 'local', at: Date.now() };
    setMessages((m) => [...m, userMessage]);
    setBusy(true);
    try {
      const { content, source } = await aiService.ask(trimmed, { schema });
      setMessages((m) => [...m, { id: uid('msg'), role: 'assistant', content, source, at: Date.now() }]);
    } catch (error) {
      setMessages((m) => [
      ...m,
      {
        id: uid('msg'),
        role: 'assistant',
        content: `Something went wrong reaching the provider: ${
        error instanceof Error ? error.message : 'unknown error'}. Local explanations are still available — try asking again.`,

        source: 'local',
        at: Date.now()
      }]
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn('flex min-h-0 flex-col bg-surface', className)}>
      <header className="shrink-0 border-b border-line px-3 py-2.5">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-3.5 w-3.5 text-accent" aria-hidden />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-fg">Schema Intelligence</h2>
        </div>
        <p className="mt-0.5 text-2xs text-muted">Ask about your schema, relationships, normalization, keys, or SQL design.</p>
      </header>

      {!aiService.remoteConfigured ?
      <p className="shrink-0 border-b border-line bg-surface2 px-3 py-2 text-2xs leading-relaxed text-muted">
          Advanced AI analysis can be connected through an API provider. Core schema explanations remain available
          locally.
        </p> :
      null}

      <div ref={scrollRef} className="nx-scroll min-h-0 flex-1 space-y-3 overflow-auto p-3">
        {messages.length === 0 ?
        <div>
            <p className="text-xs leading-relaxed text-muted">
              {schema ?
            `I can reason over the ${schema.stats.tables} entit${
            schema.stats.tables === 1 ? 'y' : 'ies'} currently on the canvas.` :

            'Generate a diagram and I can answer against your actual schema.'}
            </p>
            <ul className="mt-3 space-y-1">
              {SUGGESTIONS.map((s) =>
            <li key={s}>
                  <button
                type="button"
                onClick={() => ask(s)}
                className="w-full rounded border border-line px-2.5 py-1.5 text-left text-2xs text-muted transition-colors duration-150 ease-out hover:border-line2 hover:bg-surface2 hover:text-fg">
                
                    {s}
                  </button>
                </li>
            )}
            </ul>
          </div> :

        messages.map((message) =>
        <div key={message.id} className={cn(message.role === 'user' ? 'pl-6' : '')}>
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-faint">
                {message.role === 'user' ? 'You' : message.source === 'remote' ? 'Schema Bureau · Groq' : 'Schema Bureau · local'}
              </p>
              <div
            className={cn(
              'whitespace-pre-wrap rounded border px-2.5 py-2 text-xs leading-relaxed',
              message.role === 'user' ?
              'border-line bg-surface2 text-fg' :
              'border-line bg-bg text-muted'
            )}>
            
                {message.content}
              </div>
            </div>
        )
        }
        {busy ? <p className="text-2xs text-faint">Reasoning over the parsed schema…</p> : null}
      </div>

      <form
        className="flex shrink-0 items-center gap-2 border-t border-line p-2"
        onSubmit={(event) => {
          event.preventDefault();
          ask(input);
        }}>
        
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about your schema…"
          aria-label="Ask Schema Intelligence"
          className="h-8 min-w-0 flex-1 rounded border border-line bg-surface2 px-2.5 text-xs text-fg placeholder:text-faint focus:border-accent focus:outline-none" />
        
        <Button type="submit" size="sm" variant="primary" loading={busy} icon={<SendIcon className="h-3 w-3" />}>
          Ask
        </Button>
      </form>
    </div>);

}