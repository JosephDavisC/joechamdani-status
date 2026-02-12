import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Status | Joseph Davis Chamdani";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Green pulse dot */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 40px rgba(34, 197, 94, 0.5)",
            marginBottom: 32,
            display: "flex",
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#f8fafc",
            letterSpacing: "-0.02em",
            marginBottom: 12,
            display: "flex",
          }}
        >
          All Systems Operational
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "#94a3b8",
            marginBottom: 48,
            display: "flex",
          }}
        >
          status.joechamdani.com
        </div>

        {/* Site pills */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 900,
          }}
        >
          {[
            "Portfolio",
            "Dashboard",
            "UW Portfolio",
            "Transfer Tool",
            "INFO 340",
            "INFO 200",
          ].map((site) => (
            <div
              key={site}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 24,
                padding: "8px 20px",
                fontSize: 18,
                color: "#e2e8f0",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22c55e",
                  display: "flex",
                }}
              />
              {site}
            </div>
          ))}
        </div>

        {/* Footer with logo */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://joechamdani.com/Logo_Joseph.webp"
            alt=""
            width={28}
            height={28}
            style={{ borderRadius: "50%" }}
          />
          <span style={{ fontSize: 16, color: "#64748b" }}>
            Joseph Davis Chamdani
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
