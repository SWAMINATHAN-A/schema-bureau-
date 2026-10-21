import React, { useState } from 'react';
import { ChevronDownIcon, DownloadIcon, FileJsonIcon, FileTextIcon, ImageIcon, PrinterIcon } from 'lucide-react';
import { Dropdown } from '../common/Dropdown';
import { ExportService, type DiagramGeometry } from '../../services/exportService';
import type { ParsedSchema } from '../../types/schema';
import { useTheme } from '../../contexts/ThemeContext';

interface ExportMenuProps {
  schema: ParsedSchema | null;
  geometry: DiagramGeometry;
  name: string;
  onError: (message: string) => void;
  notation?: 'modern' | 'chen';
}

export function ExportMenu({ schema, geometry, name, onError, notation = 'modern' }: ExportMenuProps) {
  const { theme } = useTheme();
  const [busy, setBusy] = useState(false);
  const disabled = !schema || schema.tables.length === 0;

  const guard = (fn: () => void) => () => {
    if (!schema) return;
    try {
      fn();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Export failed.');
    }
  };

  return (
    <Dropdown
      label="Export"
      width="w-60"
      items={[
      {
        id: 'json',
        label: 'Parsed schema (JSON)',
        icon: <FileJsonIcon className="h-3.5 w-3.5" />,
        disabled,
        onSelect: guard(() => ExportService.exportJson(schema as ParsedSchema, name))
      },
      {
        id: 'sql',
        label: 'Source SQL (.sql)',
        icon: <FileTextIcon className="h-3.5 w-3.5" />,
        disabled: !schema,
        onSelect: guard(() => ExportService.exportSql(schema as ParsedSchema, name))
      },
      {
        id: 'svg',
        label: 'Diagram (SVG)',
        icon: <ImageIcon className="h-3.5 w-3.5" />,
        disabled: disabled || geometry.nodes.length === 0,
        onSelect: guard(() => ExportService.exportSvg(schema as ParsedSchema, geometry, theme, name, notation))
      },
      {
        id: 'png',
        label: busy ? 'Rendering PNG…' : 'Diagram (PNG)',
        icon: <ImageIcon className="h-3.5 w-3.5" />,
        disabled: disabled || geometry.nodes.length === 0 || busy,
        onSelect: () => {
          if (!schema) return;
          setBusy(true);
          ExportService.exportPng(schema, geometry, theme, name, 2, notation).
          catch((error: unknown) => onError(error instanceof Error ? error.message : 'PNG export failed.')).
          finally(() => setBusy(false));
        }
      },
      {
        id: 'report',
        label: 'Schema report (HTML)',
        icon: <FileTextIcon className="h-3.5 w-3.5" />,
        disabled,
        onSelect: guard(() => ExportService.exportReport(schema as ParsedSchema, name))
      },
      {
        id: 'print',
        label: 'Print report',
        icon: <PrinterIcon className="h-3.5 w-3.5" />,
        disabled,
        onSelect: guard(() => ExportService.printReport(schema as ParsedSchema, name))
      }]
      }
      trigger={({ toggle, open }) =>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        disabled={!schema}
        className="inline-flex h-7 items-center gap-1.5 rounded border border-line bg-surface2 px-2.5 text-xs text-fg transition-colors duration-150 ease-out hover:border-line2 disabled:opacity-40">
        
          <DownloadIcon className="h-3.5 w-3.5" aria-hidden />
          Export
          <ChevronDownIcon className="h-3 w-3 text-faint" aria-hidden />
        </button>
      } />);


}