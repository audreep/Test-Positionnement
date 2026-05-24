import { createElement, type ReactElement } from "react";
import { renderToStream, type DocumentProps } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { chargerContexte, chargerRapport } from "@/lib/adaptive/runner";
import { RapportPDF } from "@/lib/pdf/rapport-pdf";

interface Ctx { params: { id: string } }

export const runtime = "nodejs";
// Force le rendu dynamique : sans ça Next.js peut mettre en cache la route et
// servir un ancien PDF après une modification du catalogue ou des pré-requis.
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/test/[id]/pdf
 * Genere le PDF du rapport (telechargeable inline).
 */
export async function GET(_request: Request, { params }: Ctx) {
  const supabase = createSupabaseAdminClient();
  const contexte = await chargerContexte(supabase);
  const rapport = await chargerRapport(supabase, params.id, contexte);
  if (!rapport) {
    return NextResponse.json(
      { error: "Rapport introuvable ou test non termine." },
      { status: 404 }
    );
  }

  const element = createElement(RapportPDF, { donnees: rapport }) as ReactElement<DocumentProps>;
  const stream = await renderToStream(element);

  const reader = stream as unknown as NodeJS.ReadableStream;
  const chunks: Buffer[] = [];
  for await (const chunk of reader) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer));
  }
  const buffer = Buffer.concat(chunks);


  const filename = "cfo-masque-rapport-" + params.id + ".pdf";
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="' + filename + '"',
      "Cache-Control": "no-store"
    }
  });
}
