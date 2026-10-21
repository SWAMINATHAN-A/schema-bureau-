import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRightIcon, PlayIcon } from 'lucide-react';
import { EXAMPLES } from '../data/examples';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useSchema } from '../contexts/SchemaContext';
import { highlightSql } from '../utils/highlight';

export function Examples() {
  const navigate = useNavigate();
  const { loadExample } = useSchema();
  return <div className="nx-scroll h-full overflow-auto">
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
      <div className="mb-9 grid gap-8 border-b border-line pb-8 lg:grid-cols-[1.1fr_.9fr]">
        <div><p className="foundry-overline">02 / BLUEPRINTS</p><h1 className="mt-3 text-5xl font-bold leading-[.86] tracking-[-.06em] text-fg lg:text-7xl">START WITH<br/><span className="text-accent">STRUCTURE.</span></h1></div>
        <div className="flex items-end"><p className="max-w-xl font-mono text-xs leading-6 text-muted">Real SQL. Real parsing. No hidden diagrams. Pick a blueprint, send it through the same parser, then switch between relational and Chen notation in the workbench.</p></div>
      </div>
      <div className="grid gap-px border border-line bg-line lg:grid-cols-2">
        {EXAMPLES.map((example, index) => <article key={example.id} className="group bg-surface transition-transform duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between gap-4 border-b border-line p-5">
            <div><span className="font-mono text-[9px] text-faint">B-{String(index + 1).padStart(2,'0')} · {example.domain.toUpperCase()}</span><h2 className="mt-2 text-2xl font-bold tracking-tight text-fg">{example.name}</h2></div>
            <Button size="sm" variant="primary" icon={<PlayIcon className="h-3 w-3" />} onClick={() => { loadExample(example); navigate('/app'); }}>OPEN</Button>
          </div>
          <div className="p-5"><p className="text-sm leading-6 text-muted">{example.summary}</p><div className="mt-4 flex flex-wrap gap-1">{example.tables.map(t => <Badge key={t} mono>{t}</Badge>)}</div><div className="mt-2 flex flex-wrap gap-1">{example.concepts.map(c => <Badge key={c} tone="accent">{c}</Badge>)}</div></div>
          <pre className="nx-scroll max-h-64 overflow-auto border-t border-line bg-bg p-5 font-mono text-[11px] leading-[18px] text-fg"><code dangerouslySetInnerHTML={{__html: highlightSql(example.sql)}} /></pre>
          <button className="flex w-full items-center justify-between border-t border-line px-5 py-3 font-mono text-[9px] tracking-[.12em] text-faint transition-colors hover:bg-surface2 hover:text-fg" onClick={() => { loadExample(example); navigate('/app'); }}>LOAD BLUEPRINT <ArrowUpRightIcon className="h-3.5 w-3.5"/></button>
        </article>)}
      </div>
    </div>
  </div>;
}
