'use client';

/**
 * Root-level error boundary for admin panel. Catches unhandled errors that escape the tree.
 * Must define its own <html> and <body> (Next.js requirement).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === 'development';
  const msg = error?.message ?? 'Unknown error';
  const stack = error?.stack ?? '';

  return (
    <html lang="tr">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '48rem', margin: '0 auto', background: '#f5f5f5' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#dc2626' }}>Admin Panel - Kritik Hata</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya ana sayfaya dönün.
          </p>
          {isDev && (
            <details style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#991b1b' }}>Hata detayı (sadece development)</summary>
              <pre style={{ marginTop: '0.5rem', fontSize: '12px', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {msg}
              </pre>
              {stack ? (
                <pre style={{ marginTop: '0.5rem', fontSize: '11px', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#555' }}>
                  {stack}
                </pre>
              ) : null}
              {error?.digest ? <p style={{ marginTop: '0.5rem', fontSize: '12px', color: '#888' }}>Digest: {error.digest}</p> : null}
            </details>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={reset}
              style={{ padding: '0.5rem 1rem', background: '#006AFF', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
            >
              Tekrar Dene
            </button>
            <a
              href="/tr/dashboard"
              style={{ padding: '0.5rem 1rem', background: '#eee', color: '#333', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}
            >
              Dashboard'a Dön
            </a>
            <a
              href="/tr/login"
              style={{ padding: '0.5rem 1rem', background: '#f3f4f6', color: '#333', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}
            >
              Giriş Yap
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
