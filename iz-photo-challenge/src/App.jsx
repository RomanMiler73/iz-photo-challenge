import { useState, useEffect } from 'react'
import './styles/global.css'
import Upload from './pages/Upload'
import Gallery from './pages/Gallery'
import Slideshow from './pages/Slideshow'
import Vote from './pages/Vote'
import Results from './pages/Results'
import Admin from './pages/Admin'
import About from './pages/About'
import Home from './pages/Home'
import Terms from './pages/Terms'
import { supabase } from './lib/supabase'

const PAGES = ['home', 'upload', 'gallery', 'slideshow', 'vote', 'results', 'admin', 'about', 'terms']

function getPage() {
  const h = window.location.hash.replace('#', '')
  return PAGES.includes(h) ? h : 'home'
}

export default function App() {
  const [page, setPage] = useState(getPage)
  const [votingConfigured, setVotingConfigured] = useState(false)

  useEffect(() => {
    const onHash = () => setPage(getPage())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    supabase
      .from('settings')
      .select('vote_start, vote_end')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        setVotingConfigured(!!(data?.vote_start && data?.vote_end))
      })
  }, [])

  const navigate = (p) => {
    window.location.hash = p
    setPage(p)
  }

  const isSlideshow = page === 'slideshow'

  return (
    <>
      {!isSlideshow && (
        <nav className="nav">
          <span
            className="nav-brand"
            onClick={() => navigate('home')}
            style={{ cursor: 'pointer' }}
          >
            IŽ <span>Photo</span> Challenge
          </span>
          <button className={`nav-link ${page === 'upload' ? 'active' : ''}`} onClick={() => navigate('upload')}>Upload</button>
          <button className={`nav-link ${page === 'gallery' ? 'active' : ''}`} onClick={() => navigate('gallery')}>Gallery</button>
          {votingConfigured && (
            <button className={`nav-link ${page === 'vote' ? 'active' : ''}`} onClick={() => navigate('vote')}>Vote</button>
          )}
          <button className={`nav-link ${page === 'about' ? 'active' : ''}`} onClick={() => navigate('about')}>About</button>
          <button className={`nav-link ${page === 'admin' ? 'active' : ''}`} onClick={() => navigate('admin')} style={{ color: 'rgba(247,244,238,0.3)' }}>Admin</button>
        </nav>
      )}

      {page === 'home' && <Home onNavigate={navigate} />}
      {page === 'upload' && <Upload onNavigate={navigate} />}
      {page === 'gallery' && <Gallery onNavigate={navigate} />}
      {page === 'vote' && <Vote />}
      {page === 'admin' && <Admin onNavigate={navigate} />}
      {page === 'slideshow' && <Slideshow onNavigate={navigate} />}
      {page === 'about' && <About />}
      {page === 'results' && <Results />}
      {page === 'terms' && <Terms />}

      {!isSlideshow && (
        <footer style={{
          textAlign: 'center',
          padding: '24px 16px',
          color: 'var(--muted)',
          fontSize: '0.82rem',
          borderTop: '1px solid var(--border)',
          fontFamily: 'var(--font-body)',
          letterSpacing: '0.02em',
        }}>
          Designed by{' '}
          <a
            href="/#about"
            style={{ color: 'var(--muted)', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.04em' }}
            onClick={(e) => { e.preventDefault(); window.location.hash = 'about' }}
          >
            // RUTNJAK LABS //
          </a>
          {' '}for <strong>Iž u srcu</strong>
        </footer>
      )}
    </>
  )
}
