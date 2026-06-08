interface LogoSvgProps {
  className?: string;
}

export default function LogoSvg({ className = "w-10 h-10" }: LogoSvgProps) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Fond bordeaux */}
      <rect width="44" height="44" rx="8" fill="#8b1e2d" />
      {/* Sigle LPP — L en or, PP en blanc */}
      <text
        x="8"
        y="30"
        fill="#e6a817"
        fontSize="18"
        fontFamily="Georgia, serif"
        fontWeight="bold"
      >
        L
      </text>
      <text
        x="21"
        y="30"
        fill="#ffffff"
        fontSize="18"
        fontFamily="Georgia, serif"
        fontWeight="bold"
      >
        PP
      </text>
      {/* Ligne décorative or */}
      <rect x="6" y="35" width="32" height="3" rx="1.5" fill="#e6a817" />
    </svg>
  );
}
