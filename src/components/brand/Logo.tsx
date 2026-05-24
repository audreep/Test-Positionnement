/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

/**
 * Logo officiel Le CFO Masqué.
 * Utilise un <img> standard (pas next/image) pour éviter de devoir whitelister
 * le domaine externe dans next.config.
 */
export function Logo({
  variant = "header",
  className = ""
}: {
  variant?: "header" | "compact";
  className?: string;
}) {
  const src =
    "https://www.lecfomasque.com/wp-content/uploads/2020/08/logo-cfo-masque-power-bi-excel-151x103.png";
  const alt = "Le CFO Masqué";

  const hauteur = variant === "compact" ? "h-8" : "h-10";

  const image = (
    <img src={src} alt={alt} className={hauteur + " w-auto " + className} />
  );

  if (variant === "compact") return image;

  return (
    <Link href="/" className="inline-flex items-center" aria-label={alt}>
      {image}
    </Link>
  );
}
