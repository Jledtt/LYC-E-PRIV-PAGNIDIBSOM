import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Lycée Privé Pagnidibsom — Bâtir l'Excellence, Ouagadougou, Burkina Faso";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#8b1e2d",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Bande or en haut */}
        <div style={{ background: "#e6a817", height: "10px", flexShrink: 0 }} />

        {/* Corps principal */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            padding: "0 80px",
            gap: "64px",
          }}
        >
          {/* Carré crème avec sigle — bordure simulée par padding + fond or */}
          <div
            style={{
              padding: "5px",
              background: "#e6a817",
              borderRadius: "24px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                background: "#fffdf8",
                borderRadius: "20px",
                width: "190px",
                height: "190px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "84px",
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                <span style={{ color: "#8b1e2d" }}>LP</span>
                <span style={{ color: "#e6a817" }}>P</span>
              </div>
            </div>
          </div>

          {/* Textes */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: "52px",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.1,
              }}
            >
              Lycée Privé Pagnidibsom
            </div>
            <div
              style={{
                fontSize: "30px",
                color: "#e6a817",
                fontWeight: 600,
              }}
            >
              {"« Bâtir l’Excellence »"}
            </div>
            <div
              style={{
                fontSize: "23px",
                color: "#f5c860",
                marginTop: "8px",
              }}
            >
              Ouagadougou · Enseignement Général & Technique
            </div>
          </div>
        </div>

        {/* Bande or en bas */}
        <div style={{ background: "#e6a817", height: "7px", flexShrink: 0 }} />
      </div>
    ),
    { ...size }
  );
}
