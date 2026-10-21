import React, { useEffect, useState } from 'react';
import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import type { Quiz } from '../../data/learnTopics';
import { cn } from '../../utils/cn';

export function QuizCard({ quiz, topicId }: {quiz: Quiz;topicId: string;}) {
  const [choice, setChoice] = useState<number | null>(null);

  useEffect(() => {
    setChoice(null);
  }, [topicId]);

  const correct = choice === quiz.answer;

  return (
    <section className="rounded border border-line bg-surface2 p-4">
      <h3 className="text-2xs font-semibold uppercase tracking-[0.09em] text-faint">Knowledge check</h3>
      <p className="mt-2 text-sm text-fg">{quiz.question}</p>
      <ul className="mt-3 space-y-1.5">
        {quiz.options.map((option, index) => {
          const selected = choice === index;
          const isAnswer = index === quiz.answer;
          return (
            <li key={option}>
              <button
                type="button"
                onClick={() => setChoice(index)}
                className={cn(
                  'flex w-full items-start gap-2 rounded border px-3 py-2 text-left text-xs transition-colors duration-150 ease-out',
                  choice === null ?
                  'border-line bg-surface text-muted hover:border-line2 hover:text-fg' :
                  isAnswer ?
                  'border-ok bg-okSoft text-ok' :
                  selected ?
                  'border-danger bg-dangerSoft text-danger' :
                  'border-line bg-surface text-faint'
                )}>
                
                {choice !== null && isAnswer ?
                <CheckCircle2Icon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden /> :
                choice !== null && selected ?
                <XCircleIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden /> :

                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" aria-hidden />
                }
                {option}
              </button>
            </li>);

        })}
      </ul>
      {choice !== null ?
      <p className={cn('mt-3 text-xs leading-relaxed', correct ? 'text-ok' : 'text-muted')}>
          {correct ? 'Correct. ' : 'Not quite. '}
          {quiz.explanation}
        </p> :
      null}
    </section>);

}