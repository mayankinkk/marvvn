'use client'

import { useSettings } from '@/components/SettingsProvider'
import { Wrench } from 'lucide-react'

export default function MaintenancePage() {
  const settings = useSettings()

  return (
    <div className="min-h-screen bg-marvvn-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-marvvn-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wrench className="w-10 h-10 text-marvvn-gray-500" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-4">{settings.store_name || 'MARVVN'}</h1>
        <h2 className="text-xl font-medium mb-3">We&apos;ll be back soon</h2>
        <p className="text-marvvn-gray-500 mb-8">
          {settings.maintenance_message || 'We are currently under maintenance. Please check back later.'}
        </p>
        <div className="text-sm text-marvvn-gray-400">
          {settings.store_email && (
            <p>Need help? <a href={`mailto:${settings.store_email}`} className="underline hover:text-marvvn-black">{settings.store_email}</a></p>
          )}
        </div>
      </div>
    </div>
  )
}
