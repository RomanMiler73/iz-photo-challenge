import { useState, useEffect } from 'react'
import '../styles/global.css'
import Upload from './pages/Upload'
import Gallery from './pages/Gallery'
import Slideshow from './pages/Slideshow'
import Vote from './pages/Vote'
import Results from './pages/Results'
import Admin from './pages/Admin'

const PAGES = ['upload', 'gallery', 'slideshow', 'vote', 'results', 'admin']

function getPage() {
  const h = window.location.hash.replace('#', '')
  return PAGES.includes(h) ? h : 'upload'
}

export default function App() {
  const [page, setPage] = useState(getPage)

  useEffect(() => {
    const onHash = () => setPage(getPage())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
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
          <span className="nav-brand">
            IZ <span>Photo</span> Challenge
          </span>
          <button className={`nav-link ${page === 'upload' ? 'active' : ''}`} onClick={() => navigate('upload')}>Upload</button>
          <button className={`nav-link ${page === 'gallery' ? 'active' : ''}`} onClick={() => navigate('gallery')}>Gallery</button>
          <button className={`nav-link ${page === 'slideshow' ? 'active' : ''}`} onClick={() => navigate('slideshow')}>Slideshow</button>
          <button className={`nav-link ${page === 'vote' ? 'active' : ''}`} onClick={() => navigate('vote')}>Vote</button>
          <button className={`nav-link ${page === 'results' ? 'active' : ''}`} onClick={() => navigate('results')}>Results</button>
          <button className={`nav-link ${page === 'admin' ? 'active' : ''}`} onClick={() => navigate('admin')} style={{ color: 'rgba(247,244,238,0.3)' }}>Admin</button>
        </nav>
      )}

      {page === 'upload' && <Upload onNavigate={navigate} />}
      {page === 'gallery' && <Gallery onNavigate={navigate} />}
      {page === 'slideshow' && <Slideshow onNavigate={navigate} />}
      {page === 'vote' && <Vote />}
      {page === 'results' && <Results />}
      {page === 'admin' && <Admin />}
    </>
  )
}
