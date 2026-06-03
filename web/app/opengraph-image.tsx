import { ImageResponse } from "next/og";

// Numatytas socialinio dalijimosi paveikslas (Facebook, Twitter, LinkedIn...).
// Generuojamas statiškai build metu. Tekstas be lietuviškų diakritikų, nes
// numatytas ImageResponse šriftas jų nepalaiko.
export const dynamic = "force-static"; // būtina su output: export
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Dekaukciona – aukcionu platforma";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#FBF5EA",
          border: "16px solid #171615",
          padding: "70px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              background: "#15C46A",
              border: "6px solid #171615",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 60,
              fontWeight: 800,
            }}
          >
            D
          </div>
          <div style={{ fontSize: 58, fontWeight: 800, color: "#171615" }}>DEKAUKCIONA.lt</div>
        </div>

        <div style={{ marginTop: 40, fontSize: 76, fontWeight: 800, color: "#171615", lineHeight: 1.05 }}>
          Pirk ir parduok aukcionuose
        </div>
        <div style={{ marginTop: 24, fontSize: 36, color: "#6B6862" }}>
          Nemokama platforma. Statyk realiu laiku ir laimek tikrus daiktus.
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 44 }}>
          <div style={{ width: 64, height: 64, background: "#FFC53D", border: "5px solid #171615", borderRadius: 12 }} />
          <div style={{ width: 64, height: 64, background: "#FF4A2E", border: "5px solid #171615", borderRadius: 999 }} />
          <div style={{ width: 64, height: 64, background: "#15C46A", border: "5px solid #171615", borderRadius: 12 }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
