import { NextResponse } from "next/server";

/**
 * Route deprecated depuis l'ajout de l'auto-evaluation a l'intake.
 * La fonctionnalite "Je ne connais pas, passer" est maintenant geree au
 * moment du formulaire initial. Cette route reste presente pour ne pas
 * casser d'eventuels clients qui l'appelaient et retourne 410 Gone.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Cette route n'est plus utilisee. Indiquez les domaines a passer dans le formulaire d'intake." },
    { status: 410 }
  );
}
