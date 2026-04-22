import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = 'UndaIDenas2026!'

function toLocalDatetimeValue(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalDatetimeValue(val) {
  if (!val) return null
  return new Date(val).toISOString()
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('iz_admin') === 'true')
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState(false)

  const [voteStart, setVoteStart] = useState('')
  const [voteEnd, setVoteEnd] = useState('')
  const [winnersCount, setWinnersCount] = useState(3)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [stats, setStats] = useState({ photos: 0, voters: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authed) loadData()
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

  const loadData = async () => {
    setLoading(true)

    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (settings) {
      setVoteStart(toLocalDatetimeValue(settings.vote_start))
      setVoteEnd(toLocalDatetimeValue(settings.vote_end))
      setWinnersCount(settings.winners_count || 3)
    }

    const { count: photoCount } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })

    const { data: voterData } = await supabase
      .from('votes')
      .select('voter_fb_id')

    const uniqueVoters = new Set((voterData || []).map(v => v.voter_fb_id)).size

    setStats({ photos: photoCount || 0, voters: uniqueVoters })
    setLoading(false)
  }

  const saveSettings = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('settings')
      .update({
        vote_start: fromLocalDatetimeValue(voteStart),
        vote_end: fromLocalDatetimeValue(voteEnd),
        winners_count: parseInt(winnersCount) || 3,
      })
      .eq('id', 1)

    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const copyVotingLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#vote`
    navigator.clipboard.writeText(url)
  }

  const now = new Date()
  const startDate = voteStart ? new Date(voteStart) : null
  const endDate = voteEnd ? new Date(voteEnd) : null
  const getVotingStatus = () => {
    if (!startDate || !endDate) return { label: 'Not configured', cls: 'badge-pending' }
    if (now < startDate) return { label: 'Not started', cls: 'badge-pending' }
    if (now > endDate) return { label: 'Closed', cls: 'badge-closed' }
    return { label: 'Active', cls: 'badge-active' }
  }
  const status = getVotingStatus()

  if (!authed) {
    return (
      <div className="page">
        <div className="password-gate">
          <div className="password-gate-inner">
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>⚙️</div>
            <h2>Admin</h2>
            <p>Enter the admin password to access the control panel.</p>
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
              Enter Admin
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <h1 className="page-title">Admin Panel</h1>
      <p className="page-subtitle">IZ Photo Challenge — Control Centre</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <span className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="stats-grid">
            <div className="admin-stat">
              <div className="admin-stat-value">{stats.photos}</div>
              <div className="admin-stat-label">Photos submitted</div>
            </div>
            <div className="admin-stat">
              <div className="admin-stat-value">{stats.voters}</div>
              <div className="admin-stat-label">Unique voters</div>
            </div>
            <div className="admin-stat">
              <div className="admin-stat-value">
                <span className={`badge ${status.cls}`}>{status.label}</span>
              </div>
              <div className="admin-stat-label">Voting status</div>
            </div>
          </div>

          <hr className="divider" />

          {/* Voting link */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 8 }}>
              Voting Link
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 12 }}>
              Post this link in the Facebook group <em>Iz misto moje od dva slova</em> when voting opens.
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <code style={{
                flex: 1,
                background: 'var(--cream)',
                padding: '10px 14px',
                borderRadius: 'var(--radius)',
                fontSize: '0.85rem',
                wordBreak: 'break-all',
                border: '1px solid var(--border)',
              }}>
                {window.location.origin}{window.location.pathname}#vote
              </code>
              <button className="btn btn-outline" onClick={copyVotingLink}>
                Copy Link
              </button>
            </div>
          </div>

          <hr className="divider" />

          {/* Settings */}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 20 }}>
            Voting Window
          </h2>

          {saved && <div className="alert alert-success">Settings saved successfully.</div>}

          <div className="form-group">
            <label className="form-label">Voting Opens</label>
            <input
              className="form-input"
              type="datetime-local"
              value={voteStart}
              onChange={e => setVoteStart(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Voting Closes</label>
            <input
              className="form-input"
              type="datetime-local"
              value={voteEnd}
              onChange={e => setVoteEnd(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Number of Winners to Display</label>
            <input
              className="form-input"
              type="number"
              min={1}
              max={20}
              value={winnersCount}
              onChange={e => setWinnersCount(e.target.value)}
              style={{ maxWidth: 120 }}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? <><span className="spinner" /> Saving…</> : 'Save Settings'}
          </button>

          <hr className="divider" />

          <button
            className="btn btn-outline"
            onClick={() => { localStorage.removeItem('iz_admin'); window.location.reload() }}
          >
            Sign Out
          </button>
        </>
      )}
    </div>
  )
}
