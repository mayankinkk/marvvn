import Link from 'next/link'

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
    <div className={`mb-6 lg:mb-10 flex items-end justify-between gap-4 ${center ? 'flex-col items-center text-center' : ''}`}>
      <div>
        {subtitle && (
          <p className="text-xs text-marvvn-gray-400 uppercase tracking-widest mb-1 font-medium">{subtitle}</p>
        )}
        {/* Bonkers Corner: large, heavy, left-aligned section title */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-none">{title}</h2>
        {description && (
          <p className="text-sm text-marvvn-gray-500 mt-2 max-w-lg">{description}</p>
        )}
      </div>
      {ctaText && ctaLink && (
        <Link
          href={ctaLink}
          className="flex-shrink-0 inline-block border border-marvvn-black text-marvvn-black text-xs font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-marvvn-black hover:text-white transition-colors duration-300"
        >
          {ctaText}
        </Link>
      )}
    </div>
  )
}