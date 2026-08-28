'use client'

import { useMemo } from 'react'
import Header from '@/components/Header'
import HeroBanner from '@/components/HeroBanner'
import PromoBanner from '@/components/PromoBanner'
import ShopByGender from '@/components/ShopByGender'
import SectionHeader from '@/components/SectionHeader'
import ProductGrid from '@/components/ProductGrid'
import CollectionSlider from '@/components/CollectionSlider'
import FeaturesBar from '@/components/FeaturesBar'
import AboutSection from '@/components/AboutSection'
import BlogSection from '@/components/BlogSection'
import ReviewsSection from '@/components/ReviewsSection'
import Footer from '@/components/Footer'
import { useProducts } from '@/lib/hooks/useProducts'
import { useSettings } from '@/components/SettingsProvider'

export default function Home() {
  const { products, loading } = useProducts()
  const settings = useSettings()

  const newArrivals = useMemo(() => products.filter(p => p.collection.includes('new-arrivals')).slice(0, 12), [products])
  const bestSellers = useMemo(() => products.filter(p => p.collection.includes('best-sellers')).slice(0, 8), [products])
  const womenProducts = useMemo(() => products.filter(p => p.category === 'women').slice(0, 12), [products])
  const menProducts = useMemo(() => products.filter(p => p.category === 'men').slice(0, 12), [products])

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <HeroBanner />

        <ShopByGender />

        <section className="py-4 lg:py-6">
          <div className="container">
            <PromoBanner
              desktopImage="https://www.bonkerscorner.com/cdn/shop/files/main_banner_1_dae22d89-2b75-4bcd-93e2-2096fefe9c31_1920x700.jpg?v=1782816084"
              mobileImage="https://www.bonkerscorner.com/cdn/shop/files/mobile_main_afe71bda-2c7c-4065-8d29-9043c0f43d14_750x1334.jpg?v=1782816176"
              tagline="MADE TO MOVE WITH YOU"
              title="FREESTYLE COLLECTION"
              ctaText="Shop Now"
              ctaLink="/collections/new-arrivals"
            />
          </div>
        </section>

        <section className="py-4 lg:py-6">
          <div className="container">
            <PromoBanner
              desktopImage="https://www.bonkerscorner.com/cdn/shop/files/spidey_black_wo_3_1920x700.jpg?v=1786083071"
              mobileImage="https://www.bonkerscorner.com/cdn/shop/files/spidey_wo_mobile_750x1334.jpg?v=1786081629"
              tagline="INSPIRED BY YOUR FRIENDLY NEIGHBORHOOD SPIDER-MAN"
              title="SPIDER-MAN COLLECTION"
              ctaText="Shop Women"
              ctaLink="/collections/spiderman-women"
            />
          </div>
        </section>

        <section className="py-4 lg:py-6">
          <div className="container">
            <PromoBanner
              desktopImage="https://www.bonkerscorner.com/cdn/shop/files/reb_bull_website_1_1920x700.jpg?v=1784620202"
              mobileImage="https://www.bonkerscorner.com/cdn/shop/files/reb_bull_mobile_1a0cee28-664f-421f-b1fd-94f5c9ec4118_750x1334.jpg?v=1784619880"
              tagline="MATCHDAY UNIFORM"
              title="RED BULL X MARVVN"
              ctaText="Shop Now"
              ctaLink="/collections/red-bull-collection"
            />
          </div>
        </section>

        <section className="py-8 lg:py-16">
          <div className="container">
            <SectionHeader
              title="New In"
              description="Upgrade your closet with everything trendy and new"
              ctaText="Shop New Arrivals"
              ctaLink="/collections/new-arrivals"
            />
            {!loading && <CollectionSlider products={newArrivals} title="New In" />}
          </div>
        </section>

        <section className="py-4 lg:py-6">
          <div className="container">
            <PromoBanner
              desktopImage="https://www.bonkerscorner.com/cdn/shop/files/womens_second_banner_1_1920x700.jpg?v=1782816422"
              mobileImage="https://www.bonkerscorner.com/cdn/shop/files/mobile_womens_solo_988c97eb-ef57-49c2-86bc-64baaa177021_750x1334.jpg?v=1782816176"
              tagline="EXPLORE NEW IN"
              title="EXPLORE NEW IN"
              ctaText="Shop Now"
              ctaLink="/collections/womens-new-arrivals"
              reverse
            />
          </div>
        </section>

        <section className="py-8 lg:py-16">
          <div className="container">
            <SectionHeader
              title="Best Seller"
              description="Handpicked and crafted for you"
              ctaText="Shop Bestseller"
              ctaLink="/collections/best-sellers"
            />
            {!loading && <ProductGrid products={bestSellers} columns={4} />}
          </div>
        </section>

        <section className="py-8 lg:py-16">
          <div className="container">
            <SectionHeader
              title="Shop Women"
              description="From everyday essentials to statement pieces"
              ctaText="Shop Women"
              ctaLink="/collections/women"
            />
            {!loading && <ProductGrid products={womenProducts} columns={4} />}
          </div>
        </section>

        <section className="py-4 lg:py-6">
          <div className="container">
            <PromoBanner
              desktopImage="https://www.bonkerscorner.com/cdn/shop/files/mens_second_banner_6dab768c-4c98-4b21-881a-1e35f9e94414_1920x700.jpg?v=1782816084"
              mobileImage="https://www.bonkerscorner.com/cdn/shop/files/mobile_mens_solo_397dd2f8-58ef-460d-be9f-22e9078c7c5d_750x1334.jpg?v=1783013761"
              tagline="DISCOVER WHAT'S NEW"
              title="DISCOVER WHAT'S NEW"
              ctaText="EXPLORE"
              ctaLink="/collections/mens-new-arrivals"
            />
          </div>
        </section>

        <section className="py-8 lg:py-16">
          <div className="container">
            <SectionHeader
              title="Shop Men"
              description="Uncover the latest in men's fashion"
              ctaText="Shop Mens"
              ctaLink="/collections/mens"
            />
            {!loading && <ProductGrid products={menProducts} columns={4} />}
          </div>
        </section>

        <ReviewsSection />
        <FeaturesBar />
        <AboutSection />
        <BlogSection />
      </main>

      <Footer />

      {settings.whatsapp_number && (
        <a
          href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hi`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
          aria-label="Chat on WhatsApp"
        >
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      )}
    </div>
  )
}
