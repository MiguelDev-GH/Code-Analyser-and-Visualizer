export default function Header({
  codeTitle,
  detectedLanguage, lineCount, loading,
  handleAutoFormat, layoutDirection, changeLayoutDirection,
  isExceptionFilterActive, setIsExceptionFilterActive,
  setIsSettingsOpen,
}) {
  return (
    <header className="header">
      <div className="header-logo-area">
        <span className="logo-dots">:::</span>
        <h1 className="logo-text">{codeTitle}</h1>
        {detectedLanguage && (
          <div className="language-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            <span>{detectedLanguage}</span>
            <span className="language-lines">• {lineCount} linhas</span>
          </div>
        )}
      </div>

      <div className="header-actions">
        {loading && <span className="loading-text">Analyzing architecture with AI...</span>}

        <button className="filter-header-btn" onClick={handleAutoFormat} title="Reorganize/Auto-format Nodes">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
          </svg>
          <span>Organize</span>
        </button>

        <div className="direction-select-wrapper">
          <select
            className="direction-select"
            value={layoutDirection}
            onChange={(e) => changeLayoutDirection(e.target.value)}
            title="Layout Direction"
          >
            <option value="LR">Horizontal (L → R)</option>
            <option value="RL">Horizontal (R → L)</option>
            <option value="TB">Vertical (T → B)</option>
            <option value="BT">Vertical (B → T)</option>
          </select>
        </div>

        <button
          className={`filter-header-btn ${isExceptionFilterActive ? 'active' : ''}`}
          onClick={() => setIsExceptionFilterActive(!isExceptionFilterActive)}
          title="Main path (Hide exceptions)"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span>Main path</span>
        </button>

        <button className="settings-btn" onClick={() => setIsSettingsOpen(true)} title="Configurations">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </header>
  );
}
