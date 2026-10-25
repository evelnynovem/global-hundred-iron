import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    "https://fspbgwnjjisghtoeilmt.supabase.co",
    "sb_publishable_a8DBaYqMZSVBieHXH84ijQ_-IExeflf",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Ignored
          }
        },
      },
    }
  );
}
