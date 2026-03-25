import * as acorn from 'acorn';

/**
 * Detects languages OTHER than JS that share keywords with JS.
 * If matched, we skip acorn validation and let the AI handle the code.
 */
function looksLikeNonJavaScript(code) {
  const patterns = [
    /^\s*package\s+\w+/m,                    // Go
    /^\s*#\s*include\s+[<"]/m,               // C / C++
    /^\s*(def|elif|lambda)\s+\w+/m,          // Python
    /^\s*fn\s+\w+\s*\(/m,                    // Rust
    /^\s*(public|private|protected)\s+class\s+\w+/m, // Java / C#
    /^\s*using\s+namespace\s+/m,             // C++
    /^\s*<?php\b/m,                          // PHP
    /^\s*require\s+['"]/m,                   // Ruby
    /^\s*(fun|val|var)\s+\w+.*:\s*\w+/m,     // Kotlin / Swift
    /^\s*module\s+\w+\s*where/m,             // Haskell
    /^\s*SELECT\s+/im,                       // SQL
  ];
  return patterns.some((r) => r.test(code));
}

/**
 * Returns true if the code has TypeScript-specific syntax that acorn cannot parse.
 */
function looksLikeTypeScript(code) {
  const tsPatterns = [
    /^\s*interface\s+\w+/m,
    /:\s*(string|number|boolean|void|any|never|unknown)\s*[;,)={|&\]>]/,
    /:\s*Promise\s*</,
    /\bprivate\b|\bpublic\b|\bprotected\b|\breadonly\b/,
    /<\w[\w\s,|&]*>\s*{/,
    /:\s*\w+\[\]/,
    /\btype\s+\w+\s*=/,
    /as\s+\w+(\[\])?[;,)]/,
  ];
  return tsPatterns.some((r) => r.test(code));
}

/**
 * Returns true when we are confident the code is plain JavaScript.
 */
function looksLikeJavaScript(code) {
  const js = [
    /\b(const|let|var|function|class|import|export|require|module\.exports|=>\s*[{(])/,
    /\b(async|await|Promise|fetch|console\.log)\b/,
  ];
  return js.some((r) => r.test(code));
}

/**
 * Validate the given source code.
 * Returns { valid: true } or { valid: false, language, message, line }.
 */
export function validateCode(code) {
  if (!code || !code.trim()) return { valid: true };

  // Check non-JS languages FIRST (they may contain JS-like keywords)
  if (looksLikeNonJavaScript(code)) return { valid: true };

  // TypeScript cannot be validated by acorn — skip and let the AI handle it
  if (looksLikeTypeScript(code)) return { valid: true };

  if (looksLikeJavaScript(code)) {
    // Try module mode first, then fall back to script mode
    const attempts = [
      { sourceType: 'module', ecmaVersion: 'latest' },
      { sourceType: 'script', ecmaVersion: 'latest' },
    ];

    for (const opts of attempts) {
      try {
        acorn.parse(code, { ...opts, locations: true });
        return { valid: true };
      } catch (e) {
        if (opts.sourceType === 'script') {
          return {
            valid: false,
            language: 'JavaScript',
            message: e.message || 'Syntax error',
            line: e.loc?.line ?? null,
          };
        }
      }
    }
  }

  // Language not validated client-side → let the AI handle it
  return { valid: true };
}
