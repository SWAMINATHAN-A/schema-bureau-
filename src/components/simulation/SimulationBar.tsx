import React from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  XIcon,
  WandSparklesIcon } from
'lucide-react';
import { motion } from 'framer-motion';
import type { SimulationStep } from '../../types/schema';
import { Button } from '../common/Button';
import { IconButton } from '../common/IconButton';
import { cn } from '../../utils/cn';

interface SimulationBarProps {
  steps: SimulationStep[];
  index: number;
  active: boolean;
  playing: boolean;
  onStart: () => void;
  onExit: () => void;
  onIndex: (index: number) => void;
  onPlayToggle: () => void;
  onRestart: () => void;
  disabled: boolean;
}

export function SimulationBar({
  steps,
  index,
  active,
  playing,
  onStart,
  onExit,
  onIndex,
  onPlayToggle,
  onRestart,
  disabled
}: SimulationBarProps) {
  const step = steps[index];

  if (!active) {
    return (
      <div className="flex h-11 items-center justify-between gap-3 border-t border-line bg-surface px-3">
        <div className="flex min-w-0 items-center gap-2">
          <WandSparklesIcon className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
          <p className="truncate text-xs text-muted">
            SQL → ER transformation simulation
            <span className="ml-2 text-faint">
              Walk through how your schema becomes a diagram, one derivation at a time.
            </span>
          </p>
        </div>
        <Button size="sm" onClick={onStart} disabled={disabled}>
          Start simulation
        </Button>
      </div>);

  }

  return (
    <div className="border-t border-line bg-surface">
      <div className="flex h-11 items-center gap-3 px-3">
        <div className="flex items-center gap-0.5">
          <IconButton label="Previous step" size="sm" onClick={() => onIndex(Math.max(0, index - 1))} disabled={index === 0}>
            <ChevronLeftIcon className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton label={playing ? 'Pause' : 'Play'} size="sm" onClick={onPlayToggle} active={playing}>
            {playing ? <PauseIcon className="h-3.5 w-3.5" /> : <PlayIcon className="h-3.5 w-3.5" />}
          </IconButton>
          <IconButton
            label="Next step"
            size="sm"
            onClick={() => onIndex(Math.min(steps.length - 1, index + 1))}
            disabled={index >= steps.length - 1}>
            
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton label="Restart" size="sm" onClick={onRestart}>
            <RotateCcwIcon className="h-3.5 w-3.5" />
          </IconButton>
        </div>

        <ol className="flex min-w-0 flex-1 items-center gap-1" aria-label="Simulation steps">
          {steps.map((s, i) =>
          <li key={s.id} className="min-w-0 flex-1">
              <button
              type="button"
              onClick={() => onIndex(i)}
              aria-current={i === index}
              title={`Step ${i + 1}: ${s.title}`}
              className="group block w-full text-left">
              
                <span
                className={cn(
                  'block h-1 rounded-full transition-colors duration-150 ease-out',
                  i < index ? 'bg-accent' : i === index ? 'bg-accent' : 'bg-line2 group-hover:bg-muted'
                )} />
              
                <span
                className={cn(
                  'mt-1 block truncate text-2xs',
                  i === index ? 'text-fg' : 'text-faint group-hover:text-muted'
                )}>
                
                  {i + 1}. {s.title}
                </span>
              </button>
            </li>
          )}
        </ol>

        <span className="shrink-0 font-mono text-2xs text-faint">
          {index + 1}/{steps.length}
        </span>
        <IconButton label="Exit simulation" size="sm" onClick={onExit}>
          <XIcon className="h-3.5 w-3.5" />
        </IconButton>
      </div>

      {step ?
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="nx-scroll max-h-40 overflow-auto border-t border-line px-3 py-3">
        
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-[13px] font-semibold text-fg">
              Step {index + 1} · {step.title}
            </h3>
            <span className="text-2xs text-accent">{step.subtitle}</span>
          </div>
          <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-muted">{step.body}</p>
          {step.bullets.length > 0 ?
        <ul className="mt-2 grid gap-1 md:grid-cols-2">
              {step.bullets.map((bullet) =>
          <li key={bullet} className="flex gap-2 text-2xs leading-relaxed text-muted">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                  <span className="min-w-0 font-mono">{bullet}</span>
                </li>
          )}
            </ul> :
        null}
        </motion.div> :
      null}
    </div>);

}