export default function SettingsPanel({
  isOpen, onClose,
  theme, setTheme,
  showNodeDescriptions, setShowNodeDescriptions,
  edgeType, setEdgeType,
  edgeWidth, setEdgeWidth,
}) {
  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2 className="info-title">Settings</h2>
          <button className="close-settings" onClick={onClose}>&times;</button>
        </div>

        <div className="settings-content">
          <div className="setting-item">
            <span className="setting-label">Theme</span>
            <div className="theme-toggle-group">
              <div className={`theme-option ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                <span>Light</span>
              </div>
              <div className={`theme-option ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                <span>Dark</span>
              </div>
            </div>
          </div>

          <div className="setting-item">
            <span className="setting-label">Node Details</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={showNodeDescriptions}
                onChange={e => setShowNodeDescriptions(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
              />
              Show descriptions inside nodes
            </label>
          </div>

          <div className="setting-item">
            <span className="setting-label">Line Style</span>
            <select className="settings-select" value={edgeType} onChange={e => setEdgeType(e.target.value)}>
              <option value="default">Bezier (Curved)</option>
              <option value="straight">Straight</option>
              <option value="step">Step</option>
              <option value="smoothstep">Smooth Step</option>
            </select>
          </div>

          <div className="setting-item">
            <span className="setting-label">Line Thickness: {edgeWidth}px</span>
            <input
              type="range" min="1" max="10" step="1"
              value={edgeWidth}
              onChange={e => setEdgeWidth(Number(e.target.value))}
              className="settings-slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
