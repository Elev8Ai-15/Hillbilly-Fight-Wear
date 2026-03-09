// ============================================
// Shared HTML utility helpers (server-side)
// Used by: index.tsx, email-receipt.ts, pages.ts
// ============================================

/**
 * HTML-escape a string for safe insertion into HTML attributes and content.
 * Prevents XSS by encoding &, <, >, ", and '.
 */
export function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
