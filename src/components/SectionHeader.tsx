import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface SectionHeaderProps {
  subtitle?: string
  title: string
  description?: string
  ctaText?: string
  ctaLink?: string
  center?: boolean
}

export default function SectionHeader({ subtitle, title, description, ctaText, ctaLink, center }: SectionHeaderProps) {
  return (
    <div className={`mb-6 lg:mb-10 ${center ? 'text-center' : ''}`}>
      {subtitle && (
        <p className="text-xs md:text-sm text-marvnn-gray-500 uppercase tracking-wider mb-2">{subtitle}</p>
      )}
      <h2 className="section-title">{title}</h2>
      {description && (
        <p className="section-subtitle mt-2">{description}</p>
      )}
      {ctaText && ctaLink && (
        <Link
          href={ctaLink}
          className={`inline-flex items-center gap-1 text-sm font-medium mt-4 hover:text-marvnn-gray-600 transition-colors ${center ? 'justify-center' : ''}`}
        >
          {ctaText} <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}