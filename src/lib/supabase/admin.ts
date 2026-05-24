import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Client Supabase avec la clé service_role.
 *
 * IMPORTANT : ce client bypass les politiques RLS.
 * À utiliser EXCLUSIVEMENT dans :
 *   • les routes API serveur du parcours client (où l'utilisateur n'est pas authentifié)
 *   • les actions admin qui nécessitent des droits étendus (ex: suppression Loi 25)
 *
 * Ne jamais importer ce fichier dans un composant client.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Variables d'environnement Supabase admin manquantes (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)."
    );
  }
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
