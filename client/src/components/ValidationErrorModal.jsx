export default function ValidationErrorModal({ error, onClose }) {
  if (!error) return null;

  return (
    <div className="validation-modal-overlay" onClick={onClose}>
      <div className="validation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="validation-modal-icon">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h2 className="validation-modal-title">This code has errors</h2>

        <p className="validation-modal-lang">
          Detected: <strong>{error.language}</strong>
        </p>

        <div className="validation-modal-message">
          {error.line && (
            <span className="validation-modal-line">Line {error.line}:</span>
          )}
          <span>{error.message}</span>
        </div>

        <p className="validation-modal-hint">
          Fix the errors before analyzing.
        </p>

        <button className="validation-modal-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
