import { supabase, supabaseStorageBucket } from '../../lib/supabase'

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-')
}

export async function uploadCarImage(file: File) {
  const fileName = `${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
  const filePath = `cars/${new Date().toISOString().slice(0, 10)}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(supabaseStorageBucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage.from(supabaseStorageBucket).getPublicUrl(filePath)

  if (!data.publicUrl) {
    throw new Error('Could not generate a public URL for the uploaded image.')
  }

  return {
    path: filePath,
    url: data.publicUrl,
  }
}
