import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from 'lucide-react';
import { LEARN_GROUPS, LEARN_TOPICS } from '../data/learnTopics';
import { TopicVisual } from '../components/learn/TopicVisual';
import { QuizCard } from '../components/learn/QuizCard';
import { Button } from '../components/common/Button';
import { useSchema } from '../contexts/SchemaContext';
import { highlightSql } from '../utils/highlight';

export function Learn() {
  const [params, setParams] = useSearchParams(); const navigate = useNavigate(); const { setSql, setSchemaName } = useSchema();
  const [activeId, setActiveId] = useState(params.get('topic') ?? LEARN_TOPICS[0].id);
  const topic = useMemo(() => LEARN_TOPICS.find(t => t.id === activeId) ?? LEARN_TOPICS[0], [activeId]);
  const select = (id:string) => { setActiveId(id); setParams({topic:id}); };
  const idx = LEARN_TOPICS.findIndex(t => t.id === topic.id);
  return <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[240px_1fr]">
    <nav className="nx-scroll overflow-auto border-r border-line bg-surface p-4"><div className="foundry-overline mb-5">01 / FIELD GUIDE</div>{LEARN_GROUPS.map(group => <div key={group} className="mb-6"><div className="mb-2 font-mono text-[8px] tracking-[.15em] text-faint">{group}</div>{LEARN_TOPICS.filter(t=>t.group===group).map(item=><button key={item.id} onClick={()=>select(item.id)} className={`mb-1 w-full border px-3 py-2 text-left font-mono text-[10px] transition-all ${item.id===topic.id?'border-line2 bg-bg text-fg shadow-[3px_3px_0_var(--nx-accent)]':'border-transparent text-muted hover:border-line hover:bg-surface2'}`}>{item.title}</button>)}</div>)}</nav>
    <article className="nx-scroll overflow-auto"><div className="mx-auto max-w-4xl px-6 py-9 lg:px-12 lg:py-12"><div className="grid gap-7 border-b border-line pb-8 lg:grid-cols-[1fr_280px]"><div><p className="foundry-overline">{topic.group}</p><h1 className="mt-3 text-5xl font-bold leading-[.86] tracking-[-.06em] text-fg lg:text-7xl">{topic.title}</h1></div><p className="font-mono text-xs leading-6 text-muted lg:pt-8">{topic.oneLiner}</p></div>
      <div className="mt-8 space-y-4">{topic.body.map(p=><p key={p.slice(0,20)} className="max-w-3xl text-[14px] leading-7 text-muted">{p}</p>)}</div>
      {topic.visual ? <div className="mt-8 border border-line bg-surface p-6"><TopicVisual visual={topic.visual}/></div> : null}
      {topic.sql ? <div className="mt-8 overflow-hidden border border-line bg-surface"><div className="flex items-center justify-between border-b border-line px-4 py-3"><span className="font-mono text-[9px] tracking-[.15em] text-faint">WORKING SQL</span><Button size="sm" variant="ghost" icon={<ArrowUpRightIcon className="h-3.5 w-3.5"/>} onClick={()=>{setSql(topic.sql as string);setSchemaName(`${topic.title} example`);navigate('/app')}}>SEND TO WORKBENCH</Button></div><pre className="nx-scroll overflow-auto p-4 font-mono text-xs leading-5"><code dangerouslySetInnerHTML={{__html:highlightSql(topic.sql)}}/></pre></div>:null}
      {topic.quiz ? <div className="mt-8"><QuizCard quiz={topic.quiz} topicId={topic.id}/></div>:null}
      <section className="mt-10 border border-line bg-surface p-5">
        <p className="foundry-overline">WATCH / VISUAL EXPLANATION</p>
        <h2 className="mt-3 text-xl font-bold">SQL & RELATIONAL DATABASES</h2>
        <p className="mt-2 text-sm leading-6 text-muted">A visual companion to the concept notes. The embedded educational video is hosted on YouTube.</p>
        <div className="mt-4 aspect-video overflow-hidden border border-line bg-bg"><iframe className="h-full w-full" src="https://www.youtube-nocookie.com/embed/HXV3zeQKqGY" title="SQL tutorial for beginners" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
      </section>
      <section className="mt-5 border border-line p-5">
        <p className="foundry-overline">REFERENCES / LEARNING SOURCES</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
          <li>Ramez Elmasri and Shamkant B. Navathe, <i>Fundamentals of Database Systems</i>.</li>
          <li>Abraham Silberschatz, Henry F. Korth and S. Sudarshan, <i>Database System Concepts</i>.</li>
          <li><a className="text-accent underline" href="https://www.postgresql.org/docs/" target="_blank" rel="noreferrer">PostgreSQL Official Documentation</a>.</li>
          <li><a className="text-accent underline" href="https://www.youtube.com/watch?v=HXV3zeQKqGY" target="_blank" rel="noreferrer">SQL Tutorial for Beginners — YouTube</a>.</li>
          <li><a className="text-accent underline" href="https://gate2026.iitg.ac.in/" target="_blank" rel="noreferrer">GATE 2026 Official Portal</a> for exam notices and official resources.</li>
        </ul>
      </section>
      <div className="mt-10 flex justify-between border-t border-line pt-4">{idx>0?<Button size="sm" variant="ghost" icon={<ArrowLeftIcon className="h-3 w-3"/>} onClick={()=>select(LEARN_TOPICS[idx-1].id)}>PREVIOUS</Button>:<span/>}{idx<LEARN_TOPICS.length-1?<Button size="sm" variant="ghost" icon={<ArrowRightIcon className="h-3 w-3"/>} onClick={()=>select(LEARN_TOPICS[idx+1].id)}>NEXT</Button>:<span/>}</div>
    </div></article></div>;
}
