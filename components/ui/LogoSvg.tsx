interface LogoSvgProps {
  className?: string;
}

export default function LogoSvg({ className = "w-10 h-10" }: LogoSvgProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Fond carré arrondi */}
      <rect width="40" height="40" rx="8" fill="#1e3a8a" />
      {/* Lettre K stylisée */}
      <text
        x="50%"
        y="54%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="22"
        fontFamily="Georgia, serif"
        fontWeight="bold"
      >
        K
      </text>
      {/* Barre accent terracotta */}
      <rect x="6" y="32" width="28" height="3" rx="1.5" fill="#c2621a" />
    </svg>
  );
}
