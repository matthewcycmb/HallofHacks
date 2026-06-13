import { ImageResponse } from "next/og";
import { getAllProjects } from "@/lib/projects";

export const alt = "Hall of Hacks — the archive of winning hackathon projects";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded social-share card. Stats come from the live dataset so they stay current. */
export default function OpengraphImage() {
  const projects = getAllProjects();
  const events = new Set(projects.map((p) => `${p.hackathon} ${p.year}`)).size;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "#000",
          color: "#f1f1f3",
        }}
      >
        <div style={{ display: "flex", fontSize: 92, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Hall
          <span style={{ fontStyle: "italic", fontWeight: 400, color: "#d6c693", margin: "0 18px" }}>
            of
          </span>
          Hacks
        </div>
        <div
          style={{
            fontSize: 44,
            lineHeight: 1.2,
            color: "rgba(241,241,243,0.72)",
            marginTop: 28,
            maxWidth: 900,
          }}
        >
          The ultimate feed for winning hackathon projects.
        </div>
        <div style={{ fontSize: 26, color: "rgba(241,241,243,0.45)", marginTop: 48 }}>
          {`${projects.length} winning projects · ${events} hackathons · free forever`}
        </div>
      </div>
    ),
    { ...size },
  );
}
