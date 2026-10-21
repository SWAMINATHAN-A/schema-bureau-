import React, { useMemo, useState } from 'react';
import { ArrowUpRightIcon, BookOpenIcon, CheckCircle2Icon, Clock3Icon, ExternalLinkIcon, ListVideoIcon, PlayIcon, SearchIcon } from 'lucide-react';

type Video = {
  id: string;
  title: string;
  creator: string;
  category: 'SQL' | 'DBMS' | 'ER MODEL';
  level: 'BEGINNER' | 'INTERMEDIATE';
  duration: string;
  description: string;
  videoId?: string;
  playlistId?: string;
  featured?: boolean;
};

const VIDEOS: Video[] = [
  {
    id: 'sql-full-course', title: 'SQL Tutorial — Full Database Course for Beginners', creator: 'freeCodeCamp.org', category: 'SQL', level: 'BEGINNER', duration: '4+ HOURS',
    description: 'Start with tables and keys, then work through SQL queries, joins, constraints, triggers and ER diagrams.', videoId: 'HXV3zeQKqGY', featured: true,
  },
  {
    id: 'dbms-intro', title: 'Introduction to Database Management Systems', creator: 'Neso Academy', category: 'DBMS', level: 'BEGINNER', duration: '10 MIN',
    description: 'A clear introduction to DBMS fundamentals, database properties and the database system environment.', videoId: '6Iu45VZGQDk',
  },
  {
    id: 'dbms-playlist', title: 'Database Management Systems — Complete Playlist', creator: 'Neso Academy', category: 'ER MODEL', level: 'INTERMEDIATE', duration: 'PLAYLIST',
    description: 'A structured series covering relational databases, ER modeling, SQL and normalization.', playlistId: 'PLBlnK6fEyqRiyryTrbKHX1Sh9luYI0dhX',
  },
  {
    id: 'gatesmashers-dbms', title: 'DBMS Complete Course', creator: 'Gate Smashers', category: 'DBMS', level: 'INTERMEDIATE', duration: 'PLAYLIST',
    description: 'A broad course covering schema, keys, ER models, normalization, SQL, transactions and indexing.', playlistId: 'PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y',
  },
];

const CATEGORIES = ['ALL', 'SQL', 'DBMS', 'ER MODEL'] as const;

type Category = typeof CATEGORIES[number];

export function VideoLibrary() {
  const [activeId, setActiveId] = useState(VIDEOS[0].id);
  const [category, setCategory] = useState<Category>('ALL');
  const [query, setQuery] = useState('');
  const [completed, setCompleted] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('sb-video-completed') ?? '[]') as string[]; } catch { return []; }
  });

  const filtered = useMemo(() => VIDEOS.filter(video =>
    (category === 'ALL' || video.category === category) &&
    `${video.title} ${video.creator} ${video.description} ${video.category}`.toLowerCase().includes(query.toLowerCase())
  ), [category, query]);
  const active = filtered.find(video => video.id === activeId) ?? filtered[0] ?? VIDEOS[0];
  const embedUrl = active.playlistId
    ? `https://www.youtube-nocookie.com/embed/videoseries?list=${active.playlistId}`
    : `https://www.youtube-nocookie.com/embed/${active.videoId}`;
  const toggleCompleted = (id: string) => {
    const next = completed.includes(id) ? completed.filter(item => item !== id) : [...completed, id];
    setCompleted(next);
    try { localStorage.setItem('sb-video-completed', JSON.stringify(next)); } catch { /* progress is optional when storage is unavailable */ }
  };
  const openYoutube = active.playlistId
    ? `https://www.youtube.com/playlist?list=${active.playlistId}`
    : `https://www.youtube.com/watch?v=${active.videoId}`;

  return <div className="nx-scroll h-full overflow-auto">
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 grid gap-7 border-b border-line pb-8 lg:grid-cols-[1fr_330px] lg:items-end">
        <div>
          <p className="foundry-overline">06 / VIDEO LIBRARY · LEARN BY WATCHING</p>
          <h1 className="mt-4 text-5xl font-bold leading-[.86] tracking-[-.065em] text-fg lg:text-7xl">THE DATABASE<br/><span className="text-accent">CLASSROOM.</span></h1>
        </div>
        <div>
          <p className="max-w-xl text-sm leading-6 text-muted">A curated shelf of SQL and DBMS lessons. Watch selected YouTube lessons right here, then return to the workbench and put the concept into practice.</p>
          <div className="mt-5 flex items-center gap-4 border-t border-line pt-4 font-mono text-[9px] tracking-[.12em] text-faint"><span>{VIDEOS.length} CURATED RESOURCES</span><span>·</span><span>{completed.length} COMPLETED</span></div>
        </div>
      </header>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.8fr)]">
        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3"><span className="foundry-overline">NOW PLAYING / {active.category}</span><span className="font-mono text-[9px] text-faint">YOUTUBE EMBED</span></div>
          <div className="overflow-hidden border border-line bg-black shadow-[6px_6px_0_var(--nx-accent)]">
            <div className="aspect-video w-full bg-black">
              <iframe key={active.id} className="h-full w-full" src={embedUrl} title={active.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
            </div>
          </div>
          <div className="mt-5 border-b border-line pb-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl"><p className="font-mono text-[9px] tracking-[.16em] text-accent">{active.creator.toUpperCase()} / {active.level}</p><h2 className="mt-2 text-2xl font-bold leading-tight tracking-[-.035em] text-fg lg:text-3xl">{active.title}</h2><p className="mt-3 text-sm leading-6 text-muted">{active.description}</p></div>
              <a href={openYoutube} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 border border-line px-3 py-2 font-mono text-[9px] tracking-[.1em] text-fg transition-colors hover:border-accent hover:bg-surface2">OPEN ON YOUTUBE <ExternalLinkIcon size={13}/></a>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 font-mono text-[9px] text-faint"><span className="inline-flex items-center gap-1.5"><Clock3Icon size={12}/>{active.duration}</span><span className="inline-flex items-center gap-1.5"><BookOpenIcon size={12}/>{active.category}</span></div>
              <button onClick={() => toggleCompleted(active.id)} className={`inline-flex items-center gap-2 border px-3 py-2 font-mono text-[9px] tracking-[.1em] transition-colors ${completed.includes(active.id) ? 'border-accent bg-accent/10 text-fg' : 'border-line text-muted hover:border-line2 hover:text-fg'}`}>
                <CheckCircle2Icon size={13}/>{completed.includes(active.id) ? 'MARKED COMPLETE' : 'MARK AS COMPLETE'}
              </button>
            </div>
          </div>
          <div className="mt-6 border border-line bg-surface p-5"><div className="flex items-start gap-3"><div className="border border-line p-2 text-accent"><ListVideoIcon size={18}/></div><div><h3 className="font-bold text-fg">Make it practical</h3><p className="mt-1 text-sm leading-6 text-muted">After watching, open the Workbench and try the concept on a real schema. For ER modeling lessons, switch between Modern and Chen notation to compare the representations.</p><a href="/app" className="mt-3 inline-flex items-center gap-2 font-mono text-[9px] tracking-[.12em] text-accent hover:text-fg">OPEN WORKBENCH <ArrowUpRightIcon size={13}/></a></div></div></div>
        </section>

        <aside className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3"><span className="foundry-overline">THE SHELF / {filtered.length} RESULTS</span><div className="relative"><SearchIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a lesson" aria-label="Search video lessons" className="w-44 border border-line bg-surface py-2 pl-8 pr-3 font-mono text-[10px] text-fg outline-none placeholder:text-faint focus:border-accent"/></div></div>
          <div className="nx-scroll mt-4 flex gap-1 overflow-x-auto pb-2">{CATEGORIES.map(item => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 border px-2.5 py-2 font-mono text-[8px] tracking-[.1em] transition-colors ${category === item ? 'border-line2 bg-fg text-bg' : 'border-line text-muted hover:text-fg'}`}>{item}</button>)}</div>
          <div className="mt-2 border-t border-line">
            {filtered.length ? filtered.map((video, index) => <button key={video.id} onClick={() => setActiveId(video.id)} className={`group block w-full border-b border-line p-4 text-left transition-colors ${active.id === video.id ? 'bg-surface2' : 'hover:bg-surface'}`}>
              <div className="flex gap-3"><div className={`relative flex h-[68px] w-[98px] shrink-0 items-center justify-center border border-line ${active.id === video.id ? 'bg-accent text-white' : 'bg-surface text-muted group-hover:text-fg'}`}><PlayIcon size={21} fill="currentColor"/><span className="absolute bottom-1 right-1 font-mono text-[8px]">{String(index + 1).padStart(2, '0')}</span></div><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2 font-mono text-[8px] tracking-[.1em] text-faint"><span>{video.category}</span><span>·</span><span>{video.duration}</span></div><h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-fg">{video.title}</h3><p className="mt-1 font-mono text-[9px] text-muted">{video.creator}</p></div></div>
              <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted">{video.description}</p>
              <div className="mt-3 flex items-center justify-between"><span className="font-mono text-[8px] tracking-[.12em] text-faint">{video.level}</span>{completed.includes(video.id) ? <span className="inline-flex items-center gap-1 font-mono text-[8px] text-accent"><CheckCircle2Icon size={11}/> COMPLETE</span> : <span className="font-mono text-[8px] tracking-[.12em] text-accent">{active.id === video.id ? 'PLAYING' : 'WATCH'} ↗</span>}</div>
            </button>) : <div className="border-b border-line py-12 text-center"><p className="font-mono text-[10px] text-muted">NO LESSONS FOUND</p><p className="mt-2 text-xs text-faint">Try another topic or search term.</p></div>}
          </div>
          <p className="mt-4 font-mono text-[9px] leading-5 text-faint">Videos are hosted by YouTube and embedded here. Availability, ads and playback restrictions are controlled by YouTube and each publisher.</p>
        </aside>
      </div>
    </div>
  </div>;
}
