import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { uploadToCloudinary } from '../lib/cloudinary'
import { COUNTRIES } from '../lib/countries'

export default function Upload({ onNavigate }) {
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [comment, setComment] = useState('')
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dragover, setDragover] = useState(false)
  const fileRef = useRef()

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setPhoto(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragover(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async () => {
    if (!name.trim() || !country || !photo) {
      setError('Please fill in your name, country, and select a photo.')
      return
    }
    if (!agreed) {
      setError('Please agree to the contest terms before submitting.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const { imageUrl, thumbnailUrl } = await uploadToCloudinary(photo)
      const { error: dbError } = await supabase.from('photos').insert({
        name: name.trim(),
        country,
        comment: comment.trim() || null,
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl,
      })
      if (dbError) throw dbError
      onNavigate('gallery')
    } catch (err) {
      console.error(err)
      setError('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page-narrow">
      <h1 className="page-title">Share your<br /><em>photo</em></h1>
      <p className="page-subtitle">Submit your photo to the IŽ Photo Challenge</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label className="form-label">Your Photo *</label>
        <div
          className={`upload-zone ${dragover ? 'dragover' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragover(true) }}
          onDragLeave={() => setDragover(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="upload-preview" />
              <p className="upload-text">Tap to change photo</p>
            </>
          ) : (
            <>
              <span className="upload-icon">📷</span>
              <p className="upload-text">Tap to select a photo from your device</p>
            </>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Your Name *</label>
        <input
          className="form-input"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Country *</label>
        <select
          className="form-select"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="">Select your country…</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Comment <span style={{fontWeight:300,textTransform:'none',letterSpacing:0}}>(optional)</span></label>
        <textarea
          className="form-textarea"
          placeholder="Say something about your photo…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={300}
        />
        <div className="char-count">{comment.length}/300</div>
      </div>

      {/* Terms checkbox */}
      <div className="form-group">
        <label style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          cursor: 'pointer',
          padding: '14px 16px',
          background: agreed ? 'rgba(184,135,42,0.06)' : 'var(--white)',
          border: `1.5px solid ${agreed ? 'var(--gold)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          transition: 'all 0.15s',
        }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ marginTop: 3, accentColor: 'var(--gold)', width: 16, height: 16, flexShrink: 0 }}
          />
          <span style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--ink)' }}>
            I agree to the{' '}
            <a
              href="/#terms"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--gold)', textDecoration: 'underline' }}
              onClick={(e) => e.stopPropagation()}
            >
              contest terms
            </a>
            . I understand that my photo will be published on the website, shared in the Facebook group, and may be displayed publicly on the Island of Iž.
          </span>
        </label>
      </div>

      <button
        className="btn btn-primary btn-full"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <><span className="spinner" /> Uploading…</> : 'Submit Photo'}
      </button>
    </div>
  )
}
