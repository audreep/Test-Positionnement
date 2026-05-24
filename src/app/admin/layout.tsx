import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Users
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

const t = getTranslations();

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
  // Note : la route /admin/login est interceptée par sa propre page et le
  // middleware empêche de l'embarquer dans ce layout. On vérifie quand même.
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
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="h-7 w-7 rounded-md bg-primary" aria-hidden />
          <span className="text-sm font-semibold tracking-tight">
            {t.marque.nom}
          </span>
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
