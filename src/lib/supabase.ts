import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
)

export interface DbSupplier {
  id: string
  numeric_id: number
  name: string
  handle: string
  category: string
  address: string
  whatsapp: string
  instagram: string
  logo: string
  logo_url: string
  created_at: string
  updated_at: string
}

export interface DbCardConfig {
  id: string
  border_radius: number
  padding: number
  background_color: string
  background_opacity: number
  accent_color: string
  icon_color: string
  logo_border_color: string
  logo_border_width: number
  show_logo_rings: boolean
  font_family: string
  show_icons: boolean
  page_background_color: string
  footer_icon: string
  whatsapp_icon: string
  instagram_icon: string
  whatsapp_icon_url: string
  instagram_icon_url: string
  footer_icon_url: string
  footer_logo_url: string
  footer_brand_name: string
  social_icon_size: number
  footer_icon_size: number
  updated_at: string
}

export async function uploadLogo(file: File | Blob, path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('logos')
    .upload(path, file, { upsert: true, contentType: file instanceof File ? file.type : 'image/jpeg' })
  if (error || !data) return null
  return supabase.storage.from('logos').getPublicUrl(data.path).data.publicUrl
}

export async function dataUrlToStorageUrl(dataUrl: string, path: string): Promise<string> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const url = await uploadLogo(blob, path)
  return url ?? dataUrl
}
