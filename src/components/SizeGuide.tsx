'use client'

import { useState } from 'react'
import { X, Ruler } from 'lucide-react'

interface SizeGuideProps {
  category: 'men' | 'women' | 'accessories'
}

const sizeCharts = {
  men: {
    headers: ['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)'],
    rows: [
      ['S', '38-40', '27', '17'],
      ['M', '40-42', '28', '18'],
      ['L', '42-44', '29', '19'],
      ['XL', '44-46', '30', '20'],
      ['XXL', '46-48', '31', '21'],
    ],
  },
  women: {
    headers: ['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)'],
    rows: [
      ['XS', '32-34', '24', '14'],
      ['S', '34-36', '25', '15'],
      ['M', '36-38', '26', '16'],
      ['L', '38-40', '27', '17'],
      ['XL', '40-42', '28', '18'],
    ],
  },
  accessories: {
    headers: ['Size', 'One Size'],
    rows: [['One Size', 'Fits most']],
  },
}

export default function SizeGuide({ category }: SizeGuideProps) {
  const [open, setOpen] = useState(false)
  const chart = sizeCharts[category] || sizeCharts.men

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-sm text-marvvn-gray-600 hover:text-marvvn-black transition-colors"
      >
        <Ruler className="w-4 h-4" /> Size Guide
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div className="bg-white p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Size Guide</h3>
              <button onClick={() => setOpen(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-marvvn-gray-500 mb-4">Measurements are in inches. Our oversized tees run large — size down for a regular fit.</p>
            <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm border min-w-[320px]">
              <thead>
                <tr className="bg-marvvn-gray-50">
                  {chart.headers.map(h => (
                    <th key={h} className="px-4 py-2 text-left font-medium border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.rows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? '' : 'bg-marvvn-gray-50'}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-2 border">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="mt-4 p-3 bg-marvvn-gray-50 text-sm text-marvvn-gray-600">
              <strong>Tip:</strong> If you&apos;re between sizes, we recommend sizing down for a regular fit or staying true to size for an oversized look.
            </div>
          </div>
        </div>
      )}
    </>
  )
}
