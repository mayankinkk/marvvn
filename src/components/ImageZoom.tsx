'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { ZoomIn, X } from 'lucide-react'

interface ImageZoomProps {
  src: string
  alt: string
  className?: string
}

export default function ImageZoom({ src, alt, className = '' }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }, [])

  const handleMouseEnter = () => setIsZoomed(true)
  const handleMouseLeave = () => setIsZoomed(false)

  return (
    <>
      <div
        ref={containerRef}
        className={`relative overflow-hidden cursor-crosshair group ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-transform duration-200 ${isZoomed ? 'scale-150' : 'scale-100'}`}
          style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
          unoptimized
        />
        <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn className="w-4 h-4 text-gray-700" />
        </div>
      </div>

      {/* Full-screen lightbox on click */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10 cursor-pointer"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] p-8">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  )
}
