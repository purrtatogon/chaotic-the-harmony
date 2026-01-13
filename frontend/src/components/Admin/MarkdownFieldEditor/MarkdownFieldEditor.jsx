import { useId, useRef, useLayoutEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { productMarkdownRemarkPlugins } from '../../../utils/markdownGfm';
import {
  wrapDelimiters,
  insertAt,
  toggleLinePrefix,
  toggleOrderedListLine,
  insertLink,
  insertCodeBlock,
} from './markdownToolbarUtils';
import markdownFieldStyles from './MarkdownFieldEditor.module.css';

const DEFAULT_HINT =
  'Use the toolbar to insert bold, lists, and links, or type Markdown. Strikethrough and tables: GitHub-Flavored Markdown.';

const TOOL_ACTIONS = [
  { id: 'bold', label: 'Bold', wrap: (v, s, e) => wrapDelimiters(v, s, e, '**', '**') },
  { id: 'italic', label: 'Italic', wrap: (v, s, e) => wrapDelimiters(v, s, e, '*', '*') },
  { id: 'strike', label: 'Strikethrough', wrap: (v, s, e) => wrapDelimiters(v, s, e, '~~', '~~') },
  { id: 'code', label: 'Inline code', wrap: (v, s, e) => wrapDelimiters(v, s, e, '`', '`') },
  { id: 'link', label: 'Link', run: (v, s, e) => insertLink(v, s, e) },
  { id: 'h2', label: 'Heading', run: (v, s) => toggleLinePrefix(v, s, '## ') },
  { id: 'quote', label: 'Blockquote', run: (v, s) => toggleLinePrefix(v, s, '> ') },
  { id: 'ul', label: 'Bullet list', run: (v, s) => toggleLinePrefix(v, s, '- ') },
  { id: 'ol', label: 'Numbered list', run: (v, s) => toggleOrderedListLine(v, s) },
  { id: 'para', label: 'New paragraph (blank line)', run: (v, s, e) => insertAt(v, s, e, '\n\n') },
  { id: 'fenced', label: 'Code block', run: (v, s, e) => insertCodeBlock(v, s, e) },
];

/**
 * Formatted long-text field: assistive toolbar + Markdown source + GFM live preview.
 */
function MarkdownFieldEditor({
  label,
  name,
  value,
  onChange,
  rows = 5,
  disabled = false,
  hint = DEFAULT_HINT,
  previewEmptyText = '_Nothing to preview yet._',
}) {
  const baseId = useId();
  const fieldId = `${baseId}-md`;
  const hintId = `${baseId}-hint`;
  const toolbarId = `${baseId}-tools`;
  const taRef = useRef(null);
  const pendingSelectRef = useRef(null);
  const raw = value ?? '';

  const commit = useCallback(
    (next) => {
      if (disabled) return;
      onChange({ target: { name, value: next.newValue } });
      pendingSelectRef.current = {
        start: next.selectionStart,
        end: next.selectionEnd,
      };
    },
    [disabled, name, onChange]
  );

  useLayoutEffect(() => {
    const el = taRef.current;
    const p = pendingSelectRef.current;
    if (!el || !p) return;
    el.focus();
    const max = el.value.length;
    el.setSelectionRange(Math.min(p.start, max), Math.min(p.end, max));
    pendingSelectRef.current = null;
  }, [raw]);

  const runTool = useCallback(
    (action) => (e) => {
      e.preventDefault();
      if (disabled) return;
      const el = taRef.current;
      if (!el) return;
      const v = el.value;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = action.run
        ? action.run(v, start, end)
        : action.wrap
          ? action.wrap(v, start, end)
          : null;
      if (next) commit(next);
    },
    [commit, disabled]
  );

  const handleToolbarPointerDown = (e) => {
    e.preventDefault();
  };

  return (
    <div className={markdownFieldStyles.mdField}>
      <label className={markdownFieldStyles.mdFieldLabel} htmlFor={fieldId}>
        {label}
      </label>
      <p id={hintId} className={markdownFieldStyles.mdFieldHint}>
        {hint}
      </p>
      <div
        className={markdownFieldStyles.mdToolbar}
        id={toolbarId}
        role="toolbar"
        aria-label="Text formatting"
        onPointerDown={handleToolbarPointerDown}
      >
        {TOOL_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className={markdownFieldStyles.mdToolBtn}
            onClick={runTool(action)}
            disabled={disabled}
            aria-label={action.label}
            title={action.label}
          >
            <span className={markdownFieldStyles.mdToolBtnText} aria-hidden="true">
              {getToolAbbr(action.id)}
            </span>
          </button>
        ))}
      </div>
      <div className={markdownFieldStyles.mdFieldGrid}>
        <div>
          <textarea
            id={fieldId}
            name={name}
            ref={taRef}
            className={markdownFieldStyles.mdTextarea}
            value={raw}
            onChange={onChange}
            rows={rows}
            disabled={disabled}
            spellCheck
            aria-describedby={hintId}
          />
        </div>
        <div>
          <p className={markdownFieldStyles.mdPreviewLabel}>Preview</p>
          <div className={markdownFieldStyles.mdPreviewBox}>
            <ReactMarkdown remarkPlugins={productMarkdownRemarkPlugins}>
              {String(raw).trim() !== '' ? raw : previewEmptyText}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

function getToolAbbr(id) {
  const map = {
    bold: 'B',
    italic: 'I',
    strike: 'S',
    code: '<>',
    link: 'A',
    h2: 'H2',
    quote: '>',
    ul: '•',
    ol: '1.',
    para: '¶',
    fenced: '` `',
  };
  return map[id] || id;
}

export default MarkdownFieldEditor;
