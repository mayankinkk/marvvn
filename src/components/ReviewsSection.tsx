import { Star } from 'lucide-react'

const reviews = [
  {
    id: 1,
    name: 'Tamchi Nyakum',
    text: 'It was so much worthy than buying a ₹1400 t-shirt from H&M or Zara. The quality was better and was the aesthetic!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Saumya Raj',
    text: 'I Just love it. The quality is premium and i bought XS and it fits me best. I have been dying to get a billie ellish tee in India but always worried about quality but you can surely go for this one.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Ansh Jadli',
    text: 'Change your name to quality.com I swear i lovedddddddd the quality so so so much Thanks MARVVN',
    rating: 5,
  },
]

export default function ReviewsSection() {
  return (
    <section className="py-12 lg:py-20 bg-marvvn-gray-50">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 lg:p-8">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-marvvn-gold text-marvvn-gold" />
                ))}
              </div>
              <p className="text-sm text-marvvn-gray-600 mb-4 italic">&quot;{review.text}&quot;</p>
              <p className="text-sm font-medium">{review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}