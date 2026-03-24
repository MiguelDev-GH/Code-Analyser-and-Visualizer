import { useRef, useState, useEffect, useCallback } from 'react';
import EditorModule from 'react-simple-code-editor';
import PrismCore from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

const Editor = EditorModule.default || EditorModule;

const MIN_WIDTH = 160;
const MAX_WIDTH = 700;
const DEFAULT_WIDTH = 352; // 22rem @ 16px

export default function Sidebar({ inputCode, setInputCode, textareaRef, highlightLines, loading, onAnalyze }) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // ---------- resize drag ----------
  const onMouseDown = useCallback((e) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isResizing.current) return;
      const delta = e.clientX - startX.current;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta));
      setWidth(newWidth);
    };
    const onMouseUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // ---------- highlight: measure real line height from the editor DOM ----------
  const editorWrapperRef = useRef(null);

  const getHighlightStyle = useCallback(() => {
    if (!highlightLines || !editorWrapperRef.current) return null;

    // Find the <pre> element rendered by react-simple-code-editor.
    const pre = editorWrapperRef.current.querySelector('pre');
    if (!pre) return null;

    // Read the actual line height from the browser — most accurate approach.
    // getComputedStyle returns the resolved px value (e.g. "21px").
    const lineHeight = parseFloat(getComputedStyle(pre).lineHeight);
    // The editor uses padding={16} → 16px on all sides
    const PADDING = 16;

    const top = PADDING + (highlightLines.startLine - 1) * lineHeight;
    const height = (highlightLines.endLine - highlightLines.startLine + 1) * lineHeight;

    return { top, height };
  }, [highlightLines, inputCode]);

  // Scroll to highlighted region
  useEffect(() => {
    if (!highlightLines || !textareaRef.current || !editorWrapperRef.current) return;
    const pre = editorWrapperRef.current.querySelector('pre');
    if (!pre) return;
    const lineHeight = parseFloat(getComputedStyle(pre).lineHeight);
    const PADDING = 16;
    const scrollTarget = Math.max(0, PADDING + (highlightLines.startLine - 3) * lineHeight);
    textareaRef.current.scrollTop = scrollTarget;
  }, [highlightLines, inputCode, textareaRef]);

  const highlightStyle = getHighlightStyle();

  return (
    <aside className="sidebar" style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}>
      <label className="sidebar-label">Code</label>

      <div
        ref={textareaRef}
        className="sidebar-textarea"
        style={{ overflow: 'auto', padding: 0, position: 'relative' }}
      >
        {/* Highlight overlay — positioned relative to the editor scroll container */}
        <div ref={editorWrapperRef} style={{ position: 'relative' }}>
          {highlightStyle && (
            <div
              style={{
                position: 'absolute',
                top: `${highlightStyle.top}px`,
                left: 0,
                right: 0,
                height: `${highlightStyle.height}px`,
                backgroundColor: 'rgba(255, 109, 90, 0.15)',
                borderLeft: '3px solid #ff6d5a',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
          )}
          <Editor
            value={inputCode}
            onValueChange={setInputCode}
            highlight={code => PrismCore.highlight(code, PrismCore.languages.javascript, 'javascript')}
            padding={16}
            textareaId="sidebar-code-area"
            style={{
              fontFamily: '"Inter", ui-monospace, SFMono-Regular, monospace',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              minHeight: '100%',
              backgroundColor: 'transparent',
            }}
            textareaClassName="sidebar-code-textarea"
            placeholder="function start() { }"
          />
        </div>
      </div>

      <button onClick={onAnalyze} disabled={loading || !inputCode.trim()} className="analyze-btn">
        {loading ? 'Processing...' : 'Analyze Architecture'}
      </button>

      {/* Drag handle */}
      <div className="sidebar-resizer" onMouseDown={onMouseDown} title="Drag to resize" />
    </aside>
  );
}
