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
  const [isHovering, setIsHovering] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }, [])

  const handleMouseEnter = () => setIsHovering(true)
  const handleMouseLeave = () => setIsHovering(false)

  return (
    <>
      <div
        ref={containerRef}
        className={`relative overflow-hidden cursor-zoom-in group ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsLightboxOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-transform duration-200 ${isHovering ? 'scale-[1.8]' : 'scale-100'}`}
          style={isHovering ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
          unoptimized
        />
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn className="w-4 h-4 text-gray-700" />
        </div>
      </div>

      {/* Full-screen lightbox on click */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center cursor-zoom-out"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
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
