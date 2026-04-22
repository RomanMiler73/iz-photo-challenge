const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

// Compress image client-side before upload
export async function compressImage(file, maxSizeMB = 2, maxPx = 2000) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      const ratio = Math.min(maxPx / width, maxPx / height, 1)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // Step down quality until under maxSizeMB
      let quality = 0.92
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'))
            if (blob.size <= maxSizeMB * 1024 * 1024 || quality <= 0.5) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }))
            } else {
              quality -= 0.08
              tryCompress()
            }
          },
          'image/jpeg',
          quality
        )
      }
      tryCompress()
    }
    img.onerror = reject
    img.src = url
  })
}

// Upload to Cloudinary, returns { imageUrl, thumbnailUrl }
export async function uploadToCloudinary(file) {
  const compressed = await compressImage(file)
  const formData = new FormData()
  formData.append('file', compressed)
  formData.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) throw new Error('Upload failed')
  const data = await res.json()

  const base = data.secure_url.replace('/upload/', '/upload/')
  const imageUrl = data.secure_url.replace('/upload/', '/upload/w_2000,q_auto,f_auto/')
  const thumbnailUrl = data.secure_url.replace('/upload/', '/upload/w_600,c_fill,q_auto,f_auto/')

  return { imageUrl, thumbnailUrl }
}
