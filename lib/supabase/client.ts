import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    "https://fspbgwnjjisghtoeilmt.supabase.co",
    "sb_publishable_a8DBaYqMZSVBieHXH84ijQ_-IExeflf"
  )
}
