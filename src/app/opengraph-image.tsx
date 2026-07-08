import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site-metadata";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function Image() {
  const iconPath = join(process.cwd(), "public/icons/icon-512x512.png");
  const iconData = await readFile(iconPath);
  const iconSrc = `data:image/png;base64,${iconData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a0a1a 0%, #12122a 45%, #0a0a1a 100%)",
          padding: "0 72px",
          gap: 56,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -120,
            top: -80,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -80,
            bottom: -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%)",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconSrc}
          alt=""
          width={280}
          height={280}
          style={{
            borderRadius: "50%",
            boxShadow: "0 0 48px rgba(168,85,247,0.35)",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 720,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: -1,
              color: "#e0f7ff",
              lineHeight: 1.05,
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 600,
              color: "#67e8f9",
              lineHeight: 1.2,
            }}
          >
            {SITE_TAGLINE}
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#94a3b8",
              lineHeight: 1.45,
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
