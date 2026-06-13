"use client";

/**
 * Last-resort boundary for errors in the root layout itself (rare). It replaces
 * the whole document, so it carries its own minimal dark styling — no theme deps.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#f1f1f3",
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ padding: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Something broke.</h1>
          <p style={{ color: "rgba(241,241,243,0.55)", marginTop: 8 }}>
            A glitch on our end. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 20,
              border: "none",
              borderRadius: 999,
              background: "#fff",
              color: "#131316",
              fontWeight: 700,
              padding: "10px 22px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
