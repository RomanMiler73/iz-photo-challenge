export default function Terms() {
  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <h1 className="page-title">Contest Terms</h1>
      <p className="page-subtitle">IŽ Photo Challenge — please read before submitting</p>

      <div style={{ lineHeight: 1.8, fontSize: '0.97rem' }}>

        <p style={{ color: 'var(--muted)', marginBottom: 28 }}>
          By submitting a photo to the IŽ Photo Challenge you confirm that you have read and agree to the following terms.
        </p>

        <Section number="1" title="Voluntary Participation">
          Participation is entirely voluntary. By uploading a photo you are entering the competition and agreeing to these terms.
        </Section>

        <Section number="2" title="Your Rights — You Keep Them">
          You retain full copyright of your photo. Submitting a photo to this competition does not transfer ownership or copyright to the organisers in any way.
        </Section>

        <Section number="3" title="Your Photo">
          <p style={{ marginBottom: 8 }}>By submitting you confirm that:</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li>You are the author of the photo</li>
            <li>You have the right to submit it</li>
            <li>The photo does not infringe on the rights of any third party</li>
            <li>The photo does not contain offensive, inappropriate or illegal content</li>
          </ul>
        </Section>

        <Section number="4" title="Publication and Display">
          By entering you grant the organisers a non-exclusive, royalty-free licence to publish your photo on the IŽ Photo Challenge website, in the Facebook group <em>Iz misto moje od dva slova</em>, and to display it publicly on the Island of Iž — whether digitally (screens, presentations) or in physical form (prints, posters, exhibitions).
        </Section>

        <Section number="5" title="Attribution">
          Your photo will always be displayed with your name and country as submitted. It will never be published anonymously or attributed to someone else.
        </Section>

        <Section number="6" title="Limited Use">
          Your photo will not be used for any commercial purpose, sold, licensed to third parties, or used in any context beyond this competition and its associated displays without your explicit consent.
        </Section>

        <Section number="7" title="Privacy">
          Only your name and country are collected and displayed publicly. No other personal data is shared with third parties.
        </Section>

        <Section number="8" title="One Submission">
          Each participant may submit one photo. The organisers reserve the right to remove submissions that violate these terms.
        </Section>

        <Section number="9" title="Decision">
          The winners are determined by votes cast by members of the Facebook group <em>Iz misto moje od dva slova</em>. The organisers' decision on any matter not covered by these terms is final.
        </Section>

        <div style={{
          marginTop: 40,
          padding: '16px 20px',
          background: 'var(--cream)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          fontSize: '0.85rem',
          color: 'var(--muted)',
        }}>
          Designed by <strong>// RUTNJAK LABS //</strong> for <strong>Iž u srcu</strong>
        </div>

      </div>
    </div>
  )
}

function Section({ number, title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.2rem',
        fontWeight: 600,
        marginBottom: 8,
        display: 'flex',
        gap: 10,
        alignItems: 'baseline',
      }}>
        <span style={{
          fontSize: '0.75rem',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          color: 'var(--gold)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          minWidth: 24,
        }}>{number}.</span>
        {title}
      </h2>
      <div style={{ color: 'var(--ink)', paddingLeft: 34 }}>{children}</div>
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginTop: 24 }} />
    </div>
  )
}
