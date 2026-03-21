import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

function ConnectionsBar({ previousNodes, nextDirectNodes, nextExceptionNodes }) {
  return (
    <div className="connections-status-bar">
      {previousNodes.length > 0 && (
        <div className="status-category-block category-previous">
          {previousNodes.map(node => (
            <div key={node.id} className="status-item">
              <span className="status-text">{node.data.rawLabel || node.data.label}</span>
              <div className="status-icon status-icon-incoming">
                <svg viewBox="0 0 16 16" width="16" height="16">
                  <path d="M 0 8 L 8 0 L 8 6 L 16 6 L 16 10 L 8 10 L 8 16 L 0 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {nextExceptionNodes.length > 0 && (
        <div className="status-category-block category-exception">
          {nextExceptionNodes.map(node => (
            <div key={node.id} className="status-item">
              <span className="status-text">{node.data.rawLabel || node.data.label}</span>
              <div className="status-icon status-icon-up">
                <svg viewBox="0 0 16 16" width="16" height="16">
                  <path d="M 6 16 L 10 16 L 10 8 L 16 8 L 8 0 L 0 8 L 6 8 L 6 16" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {nextDirectNodes.length > 0 && (
        <div className="status-category-block category-next">
          {nextDirectNodes.map(node => (
            <div key={node.id} className="status-item">
              <span className="status-text">{node.data.rawLabel || node.data.label}</span>
              <div className="status-icon status-icon-direct">
                <svg viewBox="0 0 16 16" width="16" height="16">
                  <path d="M 0 6 L 8 6 L 8 0 L 16 8 L 8 16 L 8 10 L 0 10 L 0 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ selectedNode, previousNodes, nextDirectNodes, nextExceptionNodes, theme, detectedLanguage }) {
  return (
    <footer className="dashboard">
      <div className="dashboard-content">

        <section className="info-section">
          <div className="description-container">
            <h2 className="info-title">
              {selectedNode ? (selectedNode.data.rawLabel || selectedNode.data.label) : 'Select a node'}
            </h2>
            <p className="info-desc">
              {selectedNode ? selectedNode.data.description : 'Waiting for selection...'}
            </p>
          </div>
          {selectedNode && (
            <ConnectionsBar
              previousNodes={previousNodes}
              nextDirectNodes={nextDirectNodes}
              nextExceptionNodes={nextExceptionNodes}
            />
          )}
        </section>

        <section className="functions-section">
          <div className="section-title">Functions</div>
          <div className="functions-list">
            {selectedNode?.data.functions?.length > 0 ? (
              selectedNode.data.functions.map((fn, i) => (
                <div key={i} className="function-item">{fn}</div>
              ))
            ) : (
              <div className="function-empty">No functions detected</div>
            )}
          </div>
        </section>

        <section className="code-section">
          <div className="section-title">Code</div>
          {selectedNode?.data.code ? (
            <SyntaxHighlighter
              language={detectedLanguage?.toLowerCase() || 'javascript'}
              style={theme === 'dark' ? vscDarkPlus : prism}
              customStyle={{
                margin: 0,
                padding: '1rem',
                backgroundColor: 'transparent',
                fontSize: '0.75rem',
                fontFamily: 'inherit',
                flex: 1,
                overflowY: 'auto',
                minHeight: 0,
              }}
              className="code-block"
              wrapLines={true}
              wrapLongLines={true}
            >
              {selectedNode.data.code}
            </SyntaxHighlighter>
          ) : (
            <pre className="code-block"></pre>
          )}
        </section>

      </div>

      <div className="status-bar">
        <div className="status-item">
          <span>Status</span>
          <span className="status-arrow">→</span>
          <span className="status-active">{selectedNode ? 'Active Node' : 'Waiting'}</span>
        </div>
      </div>
    </footer>
  );
}
