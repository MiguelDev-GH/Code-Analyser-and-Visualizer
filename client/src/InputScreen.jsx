import React from 'react';
import './InputScreen.css';
import logo from "./assets/logowb.png"

const LANGUAGES = [
  { value: 'english',    label: 'English',    flag: '🇺🇸' },
  { value: 'portuguese', label: 'Português',  flag: '🇧🇷' },
  { value: 'spanish',    label: 'Español',    flag: '🇪🇸' },
];

export default function InputScreen({ inputCode, setInputCode, onAnalyze, loading, language, setLanguage }) {
  return (
    <div className="input-screen-container">
      <div className="input-screen-header">
        <span className="logo-dots" style={{ color: 'var(--text-muted)', letterSpacing: '0.2em', fontWeight: 'bold', fontSize: '1.25rem' }}>:::</span>
        <img src={logo} alt="Logo" width={50} />
      </div>

      <div className="input-screen-content">
        {loading ? (
          <div className="loading-wrapper">
            <div className="modern-spinner"></div>
            <div className="loading-text">Analyzing architecture with AI...</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '-1rem' }}>Please wait while we process the structure</p>
          </div>
        ) : (
          <div className="input-box-wrapper">
            <div className="input-top-bar">
              <label className="input-label">CODE TO ANALYSE</label>

              {/* Language selector */}
              <div className="language-selector-group">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    className={`lang-option-btn ${language === lang.value ? 'active' : ''}`}
                    onClick={() => setLanguage(lang.value)}
                    title={lang.label}
                  >
                    <span className="lang-flag">{lang.flag}</span>
                    <span className="lang-label">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="input-textarea-wrapper">
              <textarea
                className="main-codeInput"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                spellCheck="false"
                autoCorrect="off"
                placeholder={"Paste your source code here...\ne.g., function start() { ... }"}
              />
            </div>
            <button
              className="analyze-submit-btn"
              onClick={onAnalyze}
              disabled={!inputCode.trim()}
            >
              <span>Analyse</span>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
