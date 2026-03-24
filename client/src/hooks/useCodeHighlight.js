import { useState, useEffect } from 'react';

export function useCodeHighlight(selectedNode, inputCode) {
  const [highlightLines, setHighlightLines] = useState(null);

  useEffect(() => {
    if (!selectedNode?.data.code || !inputCode) {
      setHighlightLines(null);
      return;
    }

    const snippet = selectedNode.data.code.trim();
    const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    try {
      const regex = new RegExp(escapeRegExp(snippet).replace(/\s+/g, '\\s+'));
      const match = inputCode.match(regex);

      const startIdx = match ? match.index : inputCode.indexOf(snippet);
      if (startIdx === -1) {
        setHighlightLines(null);
        return;
      }

      const endIdx = match ? match.index + match[0].length : startIdx + snippet.length;
      const startLine = inputCode.substring(0, startIdx).split('\n').length;
      const endLine = inputCode.substring(0, endIdx).split('\n').length;

      setHighlightLines({ startLine, endLine });
    } catch (e) {
      console.error('Error highlighting code:', e);
      setHighlightLines(null);
    }
  }, [selectedNode, inputCode]);

  return highlightLines;
}
