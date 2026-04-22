import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PER_PAGE = 24

export default function Gallery({ onNavigate }) {
  const [photos, setPhotos] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    fetchPhotos()
  }, [page])

  const fetchPhotos = async () => {
    setLoading(true)
    const from = page * PER_PAGE
    const to = from + PER_PAGE - 1
    const { data, count, error } = await supabase
      .from('photos')
      .select('*', { count: 'exact' })
      .order('submitted_at', { ascending: false })
      .range(from, to)

    if (!error) {
      setPhotos(data || [])
      setTotal(count || 0)
    }
    setLoading(false)
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <h1 className="page-title">Gallery</h1>
          <p className="page-subtitle">{total} photo{total !== 1 ? 's' : ''} submitted</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={() => onNavigate('slideshow')}>
            ▶ Slideshow
          </button>
          <button className="btn btn-gold" onClick={() => onNavigate('vote')}>
            Vote
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <span className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
          <p style={{ fontSize: '3rem', marginBottom: 12 }}>📷</p>
          <p>No photos yet. Be the first to submit!</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => onNavigate('upload')}>
            Upload a Photo
          </button>
        </div>
      ) : (
        <>
          <div className="masonry">
            {photos.map((photo) => (
              <div key={photo.id} className="masonry-item" onClick={() => setLightbox(photo)}>
                <img
                  src={photo.thumbnail_url}
                  alt={photo.name}
                  loading="lazy"
                />
                <div className="masonry-caption">
                  <div className="masonry-name">{photo.name}</div>
                  <div className="masonry-country">{photo.country}</div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 0}
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="btn btn-outline"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <img src={lightbox.image_url} alt={lightbox.name} />
            <div className="lightbox-info">
              <div className="lightbox-country">{lightbox.country}</div>
              <div className="lightbox-name">{lightbox.name}</div>
              {lightbox.comment && (
                <div className="lightbox-comment" style={{ marginTop: 8 }}>"{lightbox.comment}"</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
