import EditorModule from 'react-simple-code-editor';
import PrismCore from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

const Editor = EditorModule.default || EditorModule;

const LINE_HEIGHT = 21;
const PADDING = 16;

export default function Sidebar({ inputCode, setInputCode, textareaRef, highlightLines, loading, onAnalyze }) {
  return (
    <aside className="sidebar">
      <label className="sidebar-label">Code</label>

      <div ref={textareaRef} className="sidebar-textarea" style={{ overflow: 'auto', padding: 0, position: 'relative' }}>
        {highlightLines && (
          <div
            style={{
              position: 'absolute',
              top: `${PADDING + (highlightLines.startLine - 1) * LINE_HEIGHT}px`,
              left: 0,
              right: 0,
              height: `${(highlightLines.endLine - highlightLines.startLine + 1) * LINE_HEIGHT}px`,
              backgroundColor: 'rgba(255, 109, 90, 0.13)',
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
          padding={PADDING}
          textareaId="sidebar-code-area"
          style={{
            fontFamily: '"Inter", ui-monospace, SFMono-Regular, monospace',
            fontSize: '0.875rem',
            minHeight: '100%',
            backgroundColor: 'transparent',
          }}
          textareaClassName="sidebar-code-textarea"
          placeholder="function start() { }"
        />
      </div>

      <button onClick={onAnalyze} disabled={loading || !inputCode.trim()} className="analyze-btn">
        {loading ? 'Processing...' : 'Analyze Architecture'}
      </button>
    </aside>
  );
}
