import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

export const alt = "Anah by Sindhura Reddy social preview";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const [logoData, heroData] = await Promise.all([
    readFile(join(process.cwd(), "public", "uploads", "anah-logo.png"), "base64"),
    readFile(join(process.cwd(), "public", "uploads", "ombre-yellow-rust.jpg"), "base64"),
  ]);

  const logoSrc = `data:image/png;base64,${logoData}`;
  const heroSrc = `data:image/jpeg;base64,${heroData}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#eadfd3",
          color: "#3b220f",
          fontFamily: "Georgia, serif",
          padding: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "28px 24px 28px 8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "140px",
                height: "140px",
                borderRadius: "28px",
                background: "#f8f1e8",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 18px 50px rgba(86, 49, 25, 0.08)",
              }}
            >
              <img
                src={logoSrc}
                alt="Anah logo"
                width={104}
                height={104}
                style={{ objectFit: "contain" }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "20px",
                  letterSpacing: "7px",
                  textTransform: "uppercase",
                  color: "#9b7456",
                }}
              >
                Summer 2026
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "54px",
                  lineHeight: 1.05,
                  fontWeight: 700,
                }}
              >
                Anah by Sindhura Reddy
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "72px",
                lineHeight: 0.95,
                fontWeight: 700,
              }}
            >
              Dressed in Promise
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: "520px",
                fontSize: "30px",
                lineHeight: 1.4,
                color: "#6f5644",
                fontFamily: "Arial, sans-serif",
              }}
            >
              Sustainable Indian casuals for little ones, crafted with soft fabrics and soulful design.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "14px 22px",
                borderRadius: "999px",
                background: "#4b2b16",
                color: "#fff8ef",
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              anahbysr.com
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "24px",
                color: "#9b7456",
              }}
            >
              Pan-India delivery
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "400px",
            alignItems: "stretch",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              borderRadius: "32px",
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(75, 43, 22, 0.18)",
              background: "#d5c3b2",
            }}
          >
            <img
              src={heroSrc}
              alt="Anah dress collection"
              width={400}
              height={550}
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
