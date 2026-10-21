import React, { useMemo, useState } from 'react';
import { EraserIcon, FileCode2Icon, PlayIcon, SparklesIcon, WrapTextIcon } from 'lucide-react';
import { SqlEditor } from './SqlEditor';
import { ValidationList } from './ValidationList';
import { Panel } from '../common/Panel';
import { Button } from '../common/Button';
import { IconButton } from '../common/IconButton';
import { Dropdown } from '../common/Dropdown';
import { Tabs } from '../common/Tabs';
import { EXAMPLES, type ExampleSchema } from '../../data/examples';
import { formatSql } from '../../utils/sqlFormat';
import type { ParsedSchema } from '../../types/schema';

interface EditorPanelProps {
  sql: string;
  onChange: (sql: string) => void;
  onGenerate: () => void;
  onClear: () => void;
  onLoadExample: (example: ExampleSchema) => void;
  schema: ParsedSchema | null;
  busy: boolean;
  className?: string;
}

export function EditorPanel({
  sql,
  onChange,
  onGenerate,
  onClear,
  onLoadExample,
  schema,
  busy,
  className
}: EditorPanelProps) {
  const [bottomTab, setBottomTab] = useState('validation');

  const errorLines = useMemo(
    () => (schema?.diagnostics ?? []).filter((d) => d.severity === 'error' && d.line).map((d) => d.line as number),
    [schema]
  );
  const warningLines = useMemo(
    () => (schema?.diagnostics ?? []).filter((d) => d.severity === 'warning' && d.line).map((d) => d.line as number),
    [schema]
  );

  const errors = schema?.diagnostics.filter((d) => d.severity === 'error').length ?? 0;
  const warnings = schema?.diagnostics.filter((d) => d.severity === 'warning').length ?? 0;

  return (
    <Panel
      title="SQL Schema"
      subtitle={`${sql.split('\n').length} lines`}
      className={className}
      actions={
      <>
          <IconButton label="Format SQL" size="sm" onClick={() => onChange(formatSql(sql))}>
            <WrapTextIcon className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton label="Clear editor" size="sm" onClick={onClear}>
            <EraserIcon className="h-3.5 w-3.5" />
          </IconButton>
          <Dropdown
          label="Load example schema"
          width="w-64"
          items={EXAMPLES.map((example) => ({
            id: example.id,
            label: example.name,
            hint: `${example.tables.length}t`,
            onSelect: () => onLoadExample(example)
          }))}
          trigger={({ toggle }) =>
          <IconButton label="Load example" size="sm" onClick={toggle}>
                <FileCode2Icon className="h-3.5 w-3.5" />
              </IconButton>
          } />
        
        </>
      }
      bodyClassName="flex min-h-0 flex-col">
      
      <div className="min-h-0 flex-1">
        <SqlEditor
          value={sql}
          onChange={onChange}
          errorLines={errorLines}
          warningLines={warningLines}
          onSubmit={onGenerate} />
        
      </div>

      <div className="flex shrink-0 flex-col border-t border-line">
        <div className="flex h-9 items-center justify-between gap-2 px-2">
          <Tabs
            ariaLabel="Editor output"
            size="sm"
            value={bottomTab}
            onChange={setBottomTab}
            items={[
            { id: 'validation', label: 'Validation', count: errors + warnings },
            { id: 'tips', label: 'Supported syntax' }]
            } />
          
          <span className="shrink-0 font-mono text-2xs text-faint">
            {errors > 0 ? <span className="text-danger">{errors} error</span> : null}
            {errors > 0 && warnings > 0 ? ' · ' : null}
            {warnings > 0 ? <span className="text-warn">{warnings} warning</span> : null}
          </span>
        </div>

        <div className="nx-scroll h-36 overflow-auto border-t border-line bg-surface">
          {bottomTab === 'validation' ?
          <ValidationList diagnostics={schema?.diagnostics ?? []} hasSchema={Boolean(schema)} /> :

          <div className="space-y-2 px-3 py-3 text-xs text-muted">
              <p className="text-fg">SCHEMA BUREAU parses CREATE TABLE definitions from MySQL, PostgreSQL, SQLite and SQL Server dialects.</p>
              <ul className="space-y-1 font-mono text-2xs text-muted">
                <li>id INT PRIMARY KEY AUTO_INCREMENT</li>
                <li>PRIMARY KEY (student_id, course_id)</li>
                <li>email VARCHAR(100) NOT NULL UNIQUE</li>
                <li>price DECIMAL(10,2) DEFAULT 0.00</li>
                <li>dept_id INT REFERENCES Department(dept_id)</li>
                <li>FOREIGN KEY (dept_id) REFERENCES Department(dept_id) ON DELETE CASCADE</li>
              </ul>
              <p className="text-2xs text-faint">
                Statements other than CREATE TABLE (INSERT, ALTER, CREATE INDEX…) are reported as skipped rather than
                silently dropped.
              </p>
            </div>
          }
        </div>

        <div className="flex items-center gap-2 border-t border-line p-2">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={onGenerate}
            loading={busy}
            icon={<PlayIcon className="h-3.5 w-3.5" />}>
            
            Generate ER Diagram
          </Button>
          <span className="hidden shrink-0 items-center gap-1 font-mono text-2xs text-faint sm:flex">
            <SparklesIcon className="h-3 w-3" aria-hidden />
            ⌘↵
          </span>
        </div>
      </div>
    </Panel>);

}