import { useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading2,
  Heading3,
  Quote,
  Undo2,
  Redo2,
  Eraser,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
  minHeight?: number;
}

/**
 * Minimal, dependency-free WYSIWYG editor for bilingual news content.
 * Uses a contentEditable surface + the browser's built-in execCommand
 * formatting (still broadly supported for this basic toolbar) instead of
 * pulling in a third-party rich-text library.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  dir = 'ltr',
  minHeight = 220,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isFocused = useRef(false);

  // Sync external value changes (e.g. loading an article to edit) into the
  // DOM, but never while the user is actively typing — that would reset
  // their cursor position on every keystroke.
  useEffect(() => {
    const el = editorRef.current;
    if (!el || isFocused.current) return;
    if (el.innerHTML !== (value || '')) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const emitChange = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const handleLink = () => {
    const url = window.prompt('Enter a URL');
    if (url) runCommand('createLink', url);
  };

  const toolbarButtons: Array<{
    icon: React.ReactNode;
    label: string;
    action: () => void;
  }> = [
    { icon: <Bold className="w-4 h-4" />, label: 'Bold', action: () => runCommand('bold') },
    { icon: <Italic className="w-4 h-4" />, label: 'Italic', action: () => runCommand('italic') },
    { icon: <Underline className="w-4 h-4" />, label: 'Underline', action: () => runCommand('underline') },
    { icon: <Heading2 className="w-4 h-4" />, label: 'Heading', action: () => runCommand('formatBlock', 'H2') },
    { icon: <Heading3 className="w-4 h-4" />, label: 'Subheading', action: () => runCommand('formatBlock', 'H3') },
    { icon: <List className="w-4 h-4" />, label: 'Bullet list', action: () => runCommand('insertUnorderedList') },
    { icon: <ListOrdered className="w-4 h-4" />, label: 'Numbered list', action: () => runCommand('insertOrderedList') },
    { icon: <Quote className="w-4 h-4" />, label: 'Quote', action: () => runCommand('formatBlock', 'BLOCKQUOTE') },
    { icon: <LinkIcon className="w-4 h-4" />, label: 'Link', action: handleLink },
    { icon: <Undo2 className="w-4 h-4" />, label: 'Undo', action: () => runCommand('undo') },
    { icon: <Redo2 className="w-4 h-4" />, label: 'Redo', action: () => runCommand('redo') },
    { icon: <Eraser className="w-4 h-4" />, label: 'Clear formatting', action: () => runCommand('removeFormat') },
  ];

  const isEmpty = !value || value === '<br>' || value === '<p></p>';

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
        {toolbarButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            title={button.label}
            aria-label={button.label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={button.action}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
          >
            {button.icon}
          </button>
        ))}
      </div>

      <div className="relative">
        {isEmpty && placeholder && (
          <span className="pointer-events-none absolute start-4 top-3 text-sm text-gray-400">
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          contentEditable
          dir={dir}
          onFocus={() => {
            isFocused.current = true;
          }}
          onBlur={() => {
            isFocused.current = false;
          }}
          onInput={emitChange}
          className="prose prose-sm max-w-none px-4 py-3 text-[15px] leading-6 text-gray-800 outline-none [&_blockquote]:border-s-4 [&_blockquote]:border-gray-300 [&_blockquote]:ps-4 [&_blockquote]:italic [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:ps-6 [&_ul]:list-disc [&_ul]:ps-6"
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}
