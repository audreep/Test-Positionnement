import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Users
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";

const t = getTranslations();

// Toutes les pages /admin/* dépendent d'une session Supabase et NE doivent
// JAMAIS être pré-rendues au build (sinon le build échoue car les variables
// d'environnement Supabase ne sont pas disponibles côté build).
export const dynamic = "force-dynamic";
export const revalidate = 0;

const navigation = [
  { href: "/admin", label: t.admin.tableau_de_bord, icon: LayoutDashboard, exact: true },
  { href: "/admin/questions", label: t.admin.questions, icon: HelpCircle },
  { href: "/admin/formations", label: t.admin.formations, icon: GraduationCap },
  { href: "/admin/clients", label: t.admin.clients, icon: Users }
];

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // En App Router, ce layout enveloppe TOUTES les routes sous /admin/* y compris
  // /admin/login. Si on faisait l'auth check + redirect("/admin/login") sur la
  // page de login elle-même, on créerait une boucle infinie (ERR_TOO_MANY_REDIRECTS).
  // On lit donc le pathname via les headers Next et on saute auth + sidebar pour
  // /admin/login (qui se rend nue, sans la chrome admin).
  const pathname = headers().get("x-pathname") ?? headers().get("x-invoke-path") ?? "";
  const estPageLogin = pathname.startsWith("/admin/login");

  if (estPageLogin) {
    // Sur la page de login : pas de check d'auth, pas de sidebar, juste le contenu.
    return <>{children}</>;
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/15 hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4">
          <p className="mb-2 text-xs text-muted-foreground">{user.email}</p>
          <form action="/api/admin/logout" method="post">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t.admin.deconnexion}
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1">
        <div className="container-app py-8">{children}</div>
      </main>
    </div>
  );
}
