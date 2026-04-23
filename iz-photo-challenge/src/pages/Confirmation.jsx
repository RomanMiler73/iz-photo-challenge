export default function Confirmation({ submission, onNavigate }) {
  if (!submission) {
    onNavigate('gallery')
    return null
  }

  const { name, country, thumbnailUrl, code } = submission

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="page" style={{ maxWidth: 560 }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40, paddingTop: 16 }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🎉</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 5vw, 2.8rem)',
          fontWeight: 700,
          lineHeight: 1.1,
          marginBottom: 12,
        }}>
          Thank you,<br />{name}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.6 }}>
          Your photo has been submitted to the IŽ Photo Challenge.
        </p>
      </div>

      {/* Photo thumbnail */}
      {thumbnailUrl && (
        <div style={{
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          marginBottom: 32,
          boxShadow: 'var(--shadow)',
        }}>
          <img
            src={thumbnailUrl}
            alt="Your submission"
            style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            padding: '10px 14px',
            background: 'var(--white)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>{name}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{country}</span>
          </div>
        </div>
      )}

      {/* Confirmation code */}
      <div style={{
        background: 'var(--ink)',
        borderRadius: 'var(--radius)',
        padding: '28px 24px',
        textAlign: 'center',
        marginBottom: 20,
      }}>
        <div style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(247,244,238,0.5)',
          marginBottom: 12,
        }}>
          Your Confirmation Code
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 8vw, 3rem)',
          fontWeight: 700,
          color: 'var(--gold-light)',
          letterSpacing: '0.12em',
          marginBottom: 16,
        }}>
          {code}
        </div>
        <button
          className="btn btn-outline"
          style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--paper)', fontSize: '0.8rem', padding: '8px 20px' }}
          onClick={handleCopy}
        >
          Copy Code
        </button>
      </div>

      {/* Instructions */}
      <div style={{
        background: 'var(--cream)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '16px 20px',
        fontSize: '0.88rem',
        lineHeight: 1.65,
        color: 'var(--muted)',
        marginBottom: 32,
      }}>
        <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 6 }}>Keep this code safe.</strong>
        It confirms that you are the author of this submission. If your photo wins, you will need to present this code to claim your prize. Take a screenshot of this page or copy the code somewhere safe — it will not be shown again.
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          className="btn btn-outline"
          style={{ flex: 1 }}
          onClick={() => onNavigate('upload')}
        >
          Submit Another
        </button>
        <button
          className="btn btn-gold"
          style={{ flex: 1 }}
          onClick={() => onNavigate('gallery')}
        >
          View Gallery →
        </button>
      </div>

    </div>
  )
}
