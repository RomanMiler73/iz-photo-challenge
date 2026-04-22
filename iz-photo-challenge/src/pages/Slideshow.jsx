import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function Slideshow({ onNavigate }) {
  const [photos, setPhotos] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [key, setKey] = useState(0) // for progress bar reset

  useEffect(() => {
    supabase
      .from('photos')
      .select('*')
      .order('submitted_at', { ascending: false })
      .then(({ data }) => {
        setPhotos(data || [])
        setLoading(false)
      })
  }, [])

  const goNext = useCallback(() => {
    setIndex(i => (i + 1) % photos.length)
    setKey(k => k + 1)
  }, [photos.length])

  const goPrev = useCallback(() => {
    setIndex(i => (i - 1 + photos.length) % photos.length)
    setKey(k => k + 1)
  }, [photos.length])

  useEffect(() => {
    if (photos.length === 0) return
    const timer = setTimeout(goNext, 10000)
    return () => clearTimeout(timer)
  }, [goNext, photos.length, key])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') onNavigate('gallery')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev, onNavigate])

  if (loading) {
    return (
      <div className="slideshow">
        <span className="spinner" style={{ width: 40, height: 40, color: 'white' }} />
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="slideshow">
        <p style={{ color: 'white', fontSize: '1.2rem' }}>No photos yet.</p>
        <button className="slideshow-exit" onClick={() => onNavigate('gallery')}>← Back to Gallery</button>
      </div>
    )
  }

  const photo = photos[index]

  return (
    <div className="slideshow">
      <button className="slideshow-exit" onClick={() => onNavigate('gallery')}>
        ✕ Exit Slideshow
      </button>

      <img
        key={photo.id}
        src={photo.image_url}
        alt={photo.name}
        className="slideshow-img"
        style={{ animation: 'fadeIn 0.5s ease' }}
      />

      <div className="slideshow-info">
        <div className="slideshow-country">{photo.country}</div>
        <div className="slideshow-name">{photo.name}</div>
        {photo.comment && (
          <div className="slideshow-comment">"{photo.comment}"</div>
        )}
      </div>

      <div className="slideshow-controls">
        <button className="slideshow-btn" onClick={goPrev}>←</button>
        <span className="slideshow-counter">{index + 1} / {photos.length}</span>
        <button className="slideshow-btn" onClick={goNext}>→</button>
      </div>

      <div
        key={key}
        className="slideshow-progress"
      />
    </div>
  )
}
