import { ImageResponse } from "next/og";

interface OgPostProps {
  title: string;
  category?: string;
  date?: string;
}

export function renderPostOg({ title, category, date }: OgPostProps) {
  // Auto-size title: 96 for short, 56 for long
  const fontSize = title.length < 40 ? 96 : title.length < 80 ? 72 : 56;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#F6F4EE",
          color: "#111110",
          display: "flex",
          fontFamily: "serif",
        }}
      >
        <div style={{ width: 24, background: "#FFD60A" }} />
        <div
          style={{
            flex: 1,
            padding: "80px 64px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#8A8676",
              fontFamily: "monospace",
            }}
          >
            {category ?? "Post"}{date ? ` · ${date}` : ""}
          </div>
          <div style={{ fontSize, lineHeight: 1.05 }}>{title}</div>
          <div
            style={{
              fontSize: 16,
              letterSpacing: "0.08em",
              color: "#8A8676",
              fontFamily: "monospace",
            }}
          >
            ianronk.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
