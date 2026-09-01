'use client'

import { useState, useRef } from 'react'
import { Upload, X, ImageIcon, Loader2, GripVertical, Plus } from 'lucide-react'

interface MultiImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  folder?: string
  maxImages?: number
}

export default function MultiImageUpload({
  images,
  onChange,
  folder = 'products',
  maxImages = 10,
}: MultiImageUploadProps) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json()
        console.error('Upload failed:', data.error)
        return null
      }
      const data = await res.json()
      return data.url
    } catch (err) {
      console.error('Upload error:', err)
      return null
    }
  }

  const handleFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (imageFiles.length === 0) return

    const remaining = maxImages - images.length
    const toUpload = imageFiles.slice(0, remaining)

    if (imageFiles.length > remaining) {
      console.warn(`Only ${remaining} more images allowed`)
    }

    setUploading(true)
    const uploadedUrls: string[] = []

    for (const file of toUpload) {
      const url = await uploadFile(file)
      if (url) uploadedUrls.push(url)
    }

    if (uploadedUrls.length > 0) {
      onChange([...images, ...uploadedUrls])
    }
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files)
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const addUrl = () => {
    const url = urlInput.trim()
    if (url && !images.includes(url)) {
      onChange([...images, url])
      setUrlInput('')
    }
  }

  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addUrl()
    }
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return
    const updated = [...images]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    onChange(updated)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleImageDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (!isNaN(fromIndex) && fromIndex !== toIndex) {
      moveImage(fromIndex, toIndex)
    }
    setDragOverIndex(null)
  }

  return (
    <div className="space-y-3">
      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className={`relative group aspect-[3/4] bg-marvvn-gray-50 overflow-hidden border-2 transition-colors ${
                dragOverIndex === index ? 'border-marvvn-black' : 'border-transparent'
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleImageDragOver(e, index)}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={(e) => handleImageDrop(e, index)}
            >
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Drag handle */}
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 p-1 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-3.5 h-3.5 text-gray-600" />
                </div>
              </div>
              {/* Index badge */}
              <div className="absolute top-1 right-1 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5">
                {index + 1}
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-1 hover:bg-red-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Add more button (if under limit) */}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-[3/4] border-2 border-dashed border-gray-200 hover:border-gray-400 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  <span className="text-[10px] text-gray-400">Uploading…</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-gray-400" />
                  <span className="text-[10px] text-gray-400">Add Image</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Drop zone (shown when no images) */}
      {images.length === 0 && (
        <div
          className={`relative border-2 transition-colors ${
            dragging ? 'border-marvvn-black bg-marvvn-gray-50' : 'border-dashed border-gray-200 hover:border-gray-400'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{ minHeight: '160px' }}
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
                <span className="text-xs text-gray-400">Uploading…</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">Drop product images here</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Drag & drop or click · JPG, PNG, WebP · Max 10MB each · Up to {maxImages} images
                  </p>
                </div>
              </>
            )}
          </button>
        </div>
      )}

      {/* URL input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={handleUrlKeyDown}
          className="flex-1 px-3 py-2 text-xs border border-gray-200 text-gray-600 placeholder-gray-300 focus:outline-none focus:border-gray-600 transition-colors font-mono"
          placeholder="Or paste image URL and press Enter…"
        />
        <button
          type="button"
          onClick={addUrl}
          disabled={!urlInput.trim()}
          className="px-3 py-2 text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Add
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Image count */}
      {images.length > 0 && (
        <p className="text-xs text-gray-400">
          {images.length} of {maxImages} images · Drag to reorder · First image is the thumbnail
        </p>
      )}
    </div>
  )
}
