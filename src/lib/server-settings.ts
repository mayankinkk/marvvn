import { createClient } from '@/lib/supabase/server'

export async function getStoreSettings(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data } = await supabase
    .from('store_settings')
    .select('key, value')

  if (!data) return {}

  const settings: Record<string, string> = {}
  data.forEach((row: any) => {
    settings[row.key] = row.value
  })
  return settings
}
