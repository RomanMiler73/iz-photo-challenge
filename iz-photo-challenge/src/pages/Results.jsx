import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = 'UndaIDenas2026!'

export default function Results() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('iz_admin') === 'true')
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState(false)
  const [settings, setSettings] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (authed) loadResults()
  }, [authed])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('iz_admin', 'true')
      setAuthed(true)
    } else {
      setPwError(true)
      setTimeout(() => setPwError(false), 2000)
    }
  }

  const loadResults = async () => {
    setLoading(true)

    const { data: settingsData } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()
    setSettings(settingsData)

    // Aggregate votes per photo
    const { data: votes } = await supabase
      .from('votes')
      .select('photo_id')

    const { data: photos } = await supabase
      .from('photos')
      .select('*')

    if (votes && photos) {
      const counts = {}
      votes.forEach(v => {
        counts[v.photo_id] = (counts[v.photo_id] || 0) + 1
      })
      const ranked = photos
        .map(p => ({ ...p, voteCount: counts[p.id] || 0 }))
        .filter(p => p.voteCount > 0)
        .sort((a, b) => b.voteCount - a.voteCount)
        .slice(0, settingsData?.winners_count || 3)
      setResults(ranked)
    }

    setLoading(false)
  }

  const rankLabel = (i) => {
    if (i === 0) return { label: '1st', cls: 'gold' }
    if (i === 1) return { label: '2nd', cls: 'silver' }
    if (i === 2) return { label: '3rd', cls: 'bronze' }
    return { label: `${i + 1}th`, cls: '' }
  }

  if (!authed) {
    return (
      <div className="page">
        <div className="password-gate">
          <div className="password-gate-inner">
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🏆</div>
            <h2>Results</h2>
            <p>Enter the admin password to view results.</p>
            <div className="form-group">
              <input
                className="form-input"
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={pwError ? { borderColor: 'var(--error)' } : {}}
              />
              {pwError && <div className="alert alert-error" style={{ marginTop: 8 }}>Incorrect password</div>}
            </div>
            <button className="btn btn-primary btn-full" onClick={handleLogin}>
              View Results
            </button>
          </div>
        </div>
      </div>
    )
  }

  const voteEnd = settings?.vote_end ? new Date(settings.vote_end) : null
  const votingClosed = voteEnd && new Date() > voteEnd

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <h1 className="page-title">Results 🏆</h1>

      {!votingClosed && (
        <div className="alert alert-info" style={{ marginBottom: 28 }}>
          Voting is still open. Final results will be available after{' '}
          {voteEnd ? voteEnd.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '…'}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <span className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : results.length === 0 ? (
        <div className="alert alert-info">No votes have been cast yet.</div>
      ) : (
        <>
          <p className="page-subtitle" style={{ marginBottom: 28 }}>
            Top {results.length} photo{results.length !== 1 ? 's' : ''} by vote count
          </p>
          {results.map((photo, i) => {
            const { label, cls } = rankLabel(i)
            return (
              <div key={photo.id} className="result-card">
                <div className={`result-rank ${cls}`}>{label}</div>
                <img src={photo.thumbnail_url} alt={photo.name} className="result-img" />
                <div className="result-info">
                  <div className="result-name">{photo.name}</div>
                  <div className="result-country">{photo.country}</div>
                  {photo.comment && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic', marginTop: 4 }}>
                      "{photo.comment}"
                    </div>
                  )}
                </div>
                <div>
                  <div className="result-votes">{photo.voteCount}</div>
                  <div className="result-votes-label">vote{photo.voteCount !== 1 ? 's' : ''}</div>
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
