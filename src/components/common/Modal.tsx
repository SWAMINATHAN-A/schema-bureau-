import React, { useEffect } from 'react';
import { XIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconButton } from './IconButton';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

export function Modal({ open, onClose, title, description, children, footer, width = 'max-w-md' }: ModalProps) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ?
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0 bg-black/60"
          onClick={onClose} />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0, scale: 0.97, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 6 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className={`relative w-full ${width} rounded-lg border border-line bg-surface shadow-2xl`}>
          
            <header className="flex items-start justify-between gap-4 border-b border-line px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-fg">{title}</h2>
                {description ? <p className="mt-0.5 text-xs text-muted">{description}</p> : null}
              </div>
              <IconButton label="Close" size="sm" onClick={onClose}>
                <XIcon className="h-3.5 w-3.5" />
              </IconButton>
            </header>
            <div className="px-4 py-4">{children}</div>
            {footer ? <footer className="flex justify-end gap-2 border-t border-line px-4 py-3">{footer}</footer> : null}
          </motion.div>
        </div> :
      null}
    </AnimatePresence>);

}