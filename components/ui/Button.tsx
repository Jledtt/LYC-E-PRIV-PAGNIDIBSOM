import Link from "next/link";

type Variant = "primary" | "secondary" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantClasses: Record<Variant, string> = {
  /* Bordeaux plein — texte blanc */
  primary:
    "bg-primary-800 hover:bg-primary-900 text-white focus-visible:ring-primary-700",
  /* Or/Jaune — texte sombre pour le contraste */
  secondary:
    "bg-accent-500 hover:bg-accent-600 text-neutral-900 font-bold focus-visible:ring-accent-500",
  /* Contour bordeaux */
  outline:
    "border-2 border-primary-800 text-primary-800 hover:bg-primary-50 focus-visible:ring-primary-700",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
};

export default function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  className = "",
  onClick,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const classes = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
