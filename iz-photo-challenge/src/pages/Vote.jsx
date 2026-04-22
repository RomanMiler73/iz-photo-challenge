import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MAX_VOTES = 5

export default function Vote() {
  const [user, setUser] = useState(null)
  const [photos, setPhotos] = useState([])
  const [settings, setSettings] = useState(null)
  const [existingVotes, setExistingVotes] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    // Check auth
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user || null)

    // Load settings
    const { data: settingsData } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()
    setSettings(settingsData)

    // Load photos
    const { data: photosData } = await supabase
      .from('photos')
      .select('*')
      .order('submitted_at', { ascending: false })
    setPhotos(photosData || [])

    // If logged in, check existing votes
    if (session?.user) {
      const fbId = session.user.user_metadata?.provider_id || session.user.id
      const { data: votesData } = await supabase
        .from('votes')
        .select('photo_id')
        .eq('voter_fb_id', fbId)
      if (votesData && votesData.length > 0) {
        setExistingVotes(votesData.map(v => v.photo_id))
        setSubmitted(true)
      }
    }

    setLoading(false)
  }

const loginWithFacebook = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname}#vote`,
        scopes: 'public_profile',
      },
    })
  }

  const togglePhoto = (photoId) => {
    if (submitted) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(photoId)) {
        next.delete(photoId)
      } else {
        if (next.size >= MAX_VOTES) return prev
        next.add(photoId)
      }
      return next
    })
  }

  const handleSubmit = async () => {
    if (selected.size === 0) return
    setSubmitting(true)
    setError(null)
    try {
      const fbId = user.user_metadata?.provider_id || user.id
      const inserts = Array.from(selected).map(photo_id => ({
        voter_fb_id: fbId,
        photo_id,
      }))
      const { error: insertError } = await supabase.from('votes').insert(inserts)
      if (insertError) throw insertError
      setExistingVotes(Array.from(selected))
      setSubmitted(true)
      setShowConfirm(false)
    } catch (err) {
      setError('Failed to submit votes. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  // Voting window logic
  const now = new Date()
  const voteStart = settings?.vote_start ? new Date(settings.vote_start) : null
  const voteEnd = settings?.vote_end ? new Date(settings.vote_end) : null
  const votingOpen = voteStart && voteEnd && now >= voteStart && now <= voteEnd
  const votingNotStarted = voteStart && now < voteStart
  const votingClosed = voteEnd && now > voteEnd

  if (loading) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
        <span className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div className="page">
        <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🗳️</div>
          <h1 className="page-title">Cast Your Vote</h1>
          <p className="page-subtitle" style={{ marginBottom: 32 }}>
            Members of <em>Iz misto moje od dva slova</em> can vote for their favourite photos.
            Login with Facebook to continue.
          </p>
          <button className="btn btn-fb" onClick={loginWithFacebook}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Login with Facebook
          </button>
        </div>
      </div>
    )
  }

  // Voting window states
  if (!settings?.vote_start) {
    return (
      <div className="page">
        <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⏳</div>
          <h1 className="page-title">Voting not configured</h1>
          <p className="page-subtitle">The admin has not set voting dates yet. Please check back later.</p>
        </div>
      </div>
    )
  }

  if (votingNotStarted) {
    return (
      <div className="page">
        <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📅</div>
          <h1 className="page-title">Voting opens soon</h1>
          <p className="page-subtitle">
            Voting opens on <strong>{voteStart.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
          </p>
        </div>
      </div>
    )
  }

  if (votingClosed) {
    return (
      <div className="page">
        <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔒</div>
          <h1 className="page-title">Voting closed</h1>
          <p className="page-subtitle">
            Voting closed on <strong>{voteEnd.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
          </p>
        </div>
      </div>
    )
  }

  // Already voted — show read-only
  if (submitted) {
    const votedPhotos = photos.filter(p => existingVotes.includes(p.id))
    return (
      <div className="page">
        <div className="alert alert-success">
          ✓ Your votes have been submitted. Thank you for participating!
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: 20 }}>
          Your {votedPhotos.length} selected photo{votedPhotos.length !== 1 ? 's' : ''}:
        </h2>
        <div className="masonry">
          {votedPhotos.map(photo => (
            <div key={photo.id} className="masonry-item" style={{ cursor: 'default' }}>
              <img src={photo.thumbnail_url} alt={photo.name} />
              <div className="masonry-caption">
                <div className="masonry-name">{photo.name}</div>
                <div className="masonry-country">{photo.country}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Active voting UI
  return (
    <div className="page">
      <div className="section-header">
        <div>
          <h1 className="page-title">Vote</h1>
          <p className="page-subtitle">Choose up to 5 photos. Voting closes {voteEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div>
          <div className="vote-counter">
            <div className="vote-counter-dots">
              {Array.from({ length: MAX_VOTES }).map((_, i) => (
                <div key={i} className={`vote-dot ${i < selected.size ? 'filled' : ''}`} />
              ))}
            </div>
            <span>{selected.size} of {MAX_VOTES} selected</span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {selected.size === MAX_VOTES && (
        <div className="alert alert-info">Maximum 5 votes reached. Deselect a photo to change your selection.</div>
      )}

      <div className="masonry">
        {photos.map(photo => {
          const isSelected = selected.has(photo.id)
          return (
            <div
              key={photo.id}
              className={`voting-card ${isSelected ? 'selected' : ''}`}
              onClick={() => togglePhoto(photo.id)}
            >
              <div className="masonry-item">
                <img src={photo.thumbnail_url} alt={photo.name} loading="lazy" />
                <div className="masonry-caption">
                  <div className="masonry-name">{photo.name}</div>
                  <div className="masonry-country">{photo.country}</div>
                </div>
              </div>
              <div className="check">{isSelected ? '✓' : ''}</div>
            </div>
          )
        })}
      </div>

      <div style={{
        position: 'sticky',
        bottom: 24,
        display: 'flex',
        justifyContent: 'center',
        marginTop: 32,
      }}>
        <button
          className="btn btn-gold"
          style={{ padding: '16px 48px', fontSize: '1rem', boxShadow: 'var(--shadow-lg)' }}
          disabled={selected.size === 0}
          onClick={() => setShowConfirm(true)}
        >
          Submit My Votes ({selected.size})
        </button>
      </div>

      {showConfirm && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Confirm your votes</h3>
            <p>
              You are about to submit {selected.size} vote{selected.size !== 1 ? 's' : ''}. 
              This cannot be changed once submitted.
            </p>
            <div className="dialog-actions">
              <button className="btn btn-outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button
                className="btn btn-gold"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? <><span className="spinner" /> Submitting…</> : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
