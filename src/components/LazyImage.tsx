'use client'

import { useState, useEffect, useRef } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  sizes?: string
  fill?: boolean
  style?: React.CSSProperties
}

export default function LazyImage({ src, alt, className = '', sizes, fill, style }: LazyImageProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    if ('loading' in HTMLImageElement.prototype) {
      setLoaded(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const lazyImg = entry.target as HTMLImageElement
          if (lazyImg.dataset.src) {
            lazyImg.src = lazyImg.dataset.src
            if (lazyImg.dataset.srcset) {
              lazyImg.srcset = lazyImg.dataset.srcset
            }
            lazyImg.classList.remove('lazyload')
            lazyImg.classList.add('lazyloaded')
            setLoaded(true)
          }
          observer.unobserve(lazyImg)
        }
      },
      { rootMargin: '250px' }
    )

    observer.observe(img)
    return () => observer.disconnect()
  }, [])

  if (fill) {
    return (
      <>
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          sizes={sizes}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover ${className}`}
          style={style}
        />
        <noscript>
          <img
            src={src}
            alt={alt}
            sizes={sizes}
            className={`absolute inset-0 w-full h-full object-cover ${className}`}
            style={style}
          />
        </noscript>
      </>
    )
  }

  return (
    <>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        sizes={sizes}
        loading="lazy"
        className={className}
        style={style}
      />
      <noscript>
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          className={className}
          style={style}
        />
      </noscript>
    </>
  )
}
