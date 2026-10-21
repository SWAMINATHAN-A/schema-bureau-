import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenIcon, ClockIcon, LayersIcon, SearchIcon } from 'lucide-react';
import { EXAMPLES } from '../../data/examples';
import { LEARN_TOPICS } from '../../data/learnTopics';
import { StorageService } from '../../services/storageService';
import { useSchema } from '../../contexts/SchemaContext';
import { Modal } from '../common/Modal';
import { cn } from '../../utils/cn';

interface Command {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  run: () => void;
}

export function CommandPalette({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const navigate = useNavigate();
  const { loadExample, loadHistoryEntry } = useSchema();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
    }
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = [
    { id: 'nav-workspace', label: 'Go to Workspace', hint: 'Navigate', icon: <LayersIcon className="h-3.5 w-3.5" />, run: () => navigate('/app') },
    { id: 'nav-learn', label: 'Go to Learn', hint: 'Navigate', icon: <BookOpenIcon className="h-3.5 w-3.5" />, run: () => navigate('/app/learn') },
    { id: 'nav-examples', label: 'Go to Examples', hint: 'Navigate', icon: <LayersIcon className="h-3.5 w-3.5" />, run: () => navigate('/app/examples') },
    { id: 'nav-history', label: 'Go to History', hint: 'Navigate', icon: <ClockIcon className="h-3.5 w-3.5" />, run: () => navigate('/app/history') },
    { id: 'nav-insights', label: 'Go to Insights', hint: 'Navigate', icon: <LayersIcon className="h-3.5 w-3.5" />, run: () => navigate('/app/insights') }];

    const examples: Command[] = EXAMPLES.map((example) => ({
      id: `ex-${example.id}`,
      label: `Load example — ${example.name}`,
      hint: 'Example',
      icon: <LayersIcon className="h-3.5 w-3.5" />,
      run: () => {
        loadExample(example);
        navigate('/app');
      }
    }));
    const topics: Command[] = LEARN_TOPICS.map((topic) => ({
      id: `topic-${topic.id}`,
      label: `Learn — ${topic.title}`,
      hint: topic.group,
      icon: <BookOpenIcon className="h-3.5 w-3.5" />,
      run: () => navigate(`/app/learn?topic=${topic.id}`)
    }));
    const history: Command[] = StorageService.getHistory().
    slice(0, 8).
    map((entry) => ({
      id: `hist-${entry.id}`,
      label: `Open saved — ${entry.name}`,
      hint: 'History',
      icon: <ClockIcon className="h-3.5 w-3.5" />,
      run: () => {
        loadHistoryEntry(entry);
        navigate('/app');
      }
    }));
    return [...nav, ...examples, ...topics, ...history];
  }, [navigate, loadExample, loadHistoryEntry]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands.slice(0, 9);
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q)).slice(0, 9);
  }, [commands, query]);

  const runAt = (index: number) => {
    const command = filtered[index];
    if (!command) return;
    command.run();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Search SCHEMA BUREAU" description="Jump to a page, example, topic or saved schema." width="max-w-lg">
      <div className="flex items-center gap-2 rounded border border-line bg-surface2 px-2.5">
        <SearchIcon className="h-3.5 w-3.5 shrink-0 text-faint" aria-hidden />
        <input
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setCursor(0);
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setCursor((c) => Math.min(filtered.length - 1, c + 1));
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setCursor((c) => Math.max(0, c - 1));
            } else if (event.key === 'Enter') {
              event.preventDefault();
              runAt(cursor);
            }
          }}
          placeholder="Type to search…"
          aria-label="Search commands"
          className="h-9 min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-faint focus:outline-none" />
        
      </div>

      <ul className="mt-2 max-h-72 overflow-auto">
        {filtered.length === 0 ?
        <li className="px-2 py-6 text-center text-xs text-faint">No matches.</li> :

        filtered.map((command, index) =>
        <li key={command.id}>
              <button
            type="button"
            onMouseEnter={() => setCursor(index)}
            onClick={() => runAt(index)}
            className={cn(
              'flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-left text-[13px] transition-colors duration-100 ease-out',
              index === cursor ? 'bg-surface2 text-fg' : 'text-muted hover:bg-surface2'
            )}>
            
                <span className="text-faint">{command.icon}</span>
                <span className="flex-1 truncate">{command.label}</span>
                <span className="shrink-0 text-2xs text-faint">{command.hint}</span>
              </button>
            </li>
        )
        }
      </ul>
    </Modal>);

}