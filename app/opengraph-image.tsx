import { ImageResponse } from "next/og";

export const alt = "Colten Hargett: Software, Data & Machine Learning";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "radial-gradient(60% 70% at 78% 30%, rgba(139,123,255,0.55), transparent 70%), radial-gradient(45% 55% at 25% 85%, rgba(255,154,110,0.35), transparent 70%), #07070a",
          color: "#f2efe9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#c9c5bd" }}>
          <div style={{ width: 12, height: 12, borderRadius: 12, background: "#7ef0c8" }} />
          Open to internships &amp; research
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, fontWeight: 700, letterSpacing: -7, lineHeight: 0.9 }}>Colten Hargett</div>
          <div style={{ fontSize: 40, marginTop: 28, color: "#d8d3ca" }}>
            Computer Science &amp; Data Science · Machine Learning · AI Systems
          </div>
        </div>
      </div>
    ),
    size,
  );
}
