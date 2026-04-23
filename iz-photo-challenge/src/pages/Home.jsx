import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function formatDate(isoString) {
  if (!isoString) return null
  const d = new Date(isoString)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Home({ onNavigate }) {
  const [submissionDeadline, setSubmissionDeadline] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    supabase
      .from('settings')
      .select('vote_start')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        setSubmissionDeadline(data?.vote_start ? formatDate(data.vote_start) : null)
        setLoaded(true)
      })
  }, [])

  const deadline = submissionDeadline || 'date to be announced'

  return (
    <div className="page" style={{ maxWidth: 680 }}>

      {/* Hero */}
      <div style={{ marginBottom: 56, paddingTop: 16 }}>
        <div style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: 14,
        }}>
          Summer 2026 — Island of Iž, Croatia
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.6rem, 8vw, 4.4rem)',
          fontWeight: 700,
          lineHeight: 1.05,
          marginBottom: 20,
          color: 'var(--ink)',
        }}>
          IŽ Photo<br />Challenge
        </h1>
        <div style={{
          width: 48,
          height: 3,
          background: 'var(--gold)',
          borderRadius: 2,
        }} />
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

        <Section number="1" title="What is it?">
          A photo competition open to everyone who has set foot on our little island. If you've wandered its paths, swum in its waters, or simply sat watching the sun go down — this is your chance to share what you saw.
        </Section>

        <Section number="2" title="How does it work?">
          Submit one photo taken anywhere on Iž by <strong>{deadline}</strong>. It can be a landscape, a detail, a moment, a face — anything that captures your Iž.
          <br /><br />
          Once submissions close, members of the Facebook group <em>Iz misto moje od dva slova</em> will vote for their favourites. The photos with the most votes win.
        </Section>

        <Section number="3" title="The prizes">
          The King of Iž, Rava and Lavdara will personally award the prizes to the winners. Time and place will be announced in the Facebook group.
        </Section>

      </div>

      {/* CTA */}
      <div style={{ marginTop: 56, paddingTop: 40, borderTop: '1px solid var(--border)' }}>
        <button
          className="btn btn-gold"
          style={{ fontSize: '1.05rem', padding: '16px 40px' }}
          onClick={() => onNavigate('upload')}
        >
          Submit your photo →
        </button>
        <p style={{
          marginTop: 14,
          fontSize: '0.82rem',
          color: 'var(--muted)',
        }}>
          By submitting you agree to the{' '}
          <a
            href="/#terms"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--muted)', textDecoration: 'underline' }}
          >
            contest terms
          </a>.
        </p>
      </div>

    </div>
  )
}

function Section({ number, title, children }) {
  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2.8rem',
        fontWeight: 700,
        color: 'var(--cream)',
        lineHeight: 1,
        minWidth: 40,
        userSelect: 'none',
        marginTop: 2,
      }}>
        {number}
      </div>
      <div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.35rem',
          fontWeight: 600,
          marginBottom: 10,
          color: 'var(--ink)',
        }}>
          {title}
        </h2>
        <p style={{
          color: '#3a3830',
          lineHeight: 1.75,
          fontSize: '1rem',
        }}>
          {children}
        </p>
      </div>
    </div>
  )
}
