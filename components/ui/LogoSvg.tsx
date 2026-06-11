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
      {/*
        Même ID dans header et footer : les deux clipPath sont identiques,
        le navigateur utilise le premier — comportement correct et inoffensif.
      */}
      <defs>
        <clipPath id="lpp-logo-clip">
          <rect width="44" height="44" rx="8" />
        </clipPath>
      </defs>

      <g clipPath="url(#lpp-logo-clip)">
        {/* Fond bordeaux */}
        <rect width="44" height="44" fill="#8b1e2d" />

        {/* Liseré or en haut */}
        <rect width="44" height="3.5" fill="#e6a817" />

        {/* Sigle : LP en blanc, P final (Pagnidibsom) en or */}
        <text
          x="5"
          y="29"
          fill="#ffffff"
          fontSize="17"
          fontFamily="Georgia, serif"
          fontWeight="bold"
        >
          LP
        </text>
        <text
          x="29"
          y="29"
          fill="#e6a817"
          fontSize="17"
          fontFamily="Georgia, serif"
          fontWeight="bold"
        >
          P
        </text>

        {/* Micro-devise */}
        <text
          x="22"
          y="39.5"
          fill="#e6a817"
          fontSize="3.5"
          fontFamily="Georgia, serif"
          textAnchor="middle"
          letterSpacing="0.25"
        >
          BÂTIR L&apos;EXCELLENCE
        </text>
      </g>
    </svg>
  );
}
