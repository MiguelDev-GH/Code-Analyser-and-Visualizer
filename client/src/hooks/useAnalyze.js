import { useState } from 'react';
import { getLayoutedElements } from '../lib/layout';
import { validateCode } from '../lib/codeValidator';

export function useAnalyze({ inputCode, language, layoutDirection, showNodeDescriptions }) {
  const [loading, setLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [lineCount, setLineCount] = useState(0);
  const [codeTitle, setCodeTitle] = useState('Code #1');
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const clearValidationError = () => setValidationError(null);

  const analyze = async (onSuccess) => {
    if (!inputCode.trim()) return;

    // Client-side validation (JS only) — no AI tokens spent
    const result = validateCode(inputCode);
    if (!result.valid) {
      setValidationError(result);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCode, language }),
      });
      const data = await response.json();

      const { nodes: ln, edges: le } = getLayoutedElements(
        data.nodes || [], data.edges || [], layoutDirection, showNodeDescriptions,
      );

      setCodeTitle(data.title || 'Code #1');
      setDetectedLanguage(data.detectedLanguage || 'Unknown');
      setLineCount(inputCode.split('\n').filter(l => l.trim() !== '').length);
      setIsAnalyzed(true);
      onSuccess(ln, le);
    } catch (error) {
      console.error('Error analyzing the code:', error);
      alert('Error analyzing the code. Verify that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return { loading, detectedLanguage, lineCount, codeTitle, isAnalyzed, analyze, validationError, clearValidationError };
}
