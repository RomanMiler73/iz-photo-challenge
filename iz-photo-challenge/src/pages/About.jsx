export default function About() {
  return (
    <div className="page" style={{ maxWidth: 680 }}>

      <div style={{ marginBottom: 48, paddingTop: 16 }}>
        <div style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: 14,
        }}>
          About
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 6vw, 3.2rem)',
          fontWeight: 700,
          lineHeight: 1.05,
          marginBottom: 20,
          color: 'var(--ink)',
          letterSpacing: '0.04em',
        }}>
          // RUTNJAK STUDIO //
        </h1>
        <div style={{
          width: 48,
          height: 3,
          background: 'var(--gold)',
          borderRadius: 2,
        }} />
      </div>

      <div style={{
        fontSize: '1.08rem',
        lineHeight: 1.85,
        color: '#3a3830',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>
        <p>
          A small group of lifelong friends from the island of Iž. We make things — visual, sonic, digital. Art when called for, sound when it moves us, code when needed. Often all at once.
        </p>
        <p>
          We build for people and places we care about. This is one of those projects.
        </p>
      </div>

      <div style={{
        marginTop: 56,
        paddingTop: 32,
        borderTop: '1px solid var(--border)',
        fontFamily: 'var(--font-display)',
        fontSize: '1.3rem',
        fontStyle: 'italic',
        color: 'var(--muted)',
      }}>
        For the island that connects us.
      </div>

    </div>
  )
}
