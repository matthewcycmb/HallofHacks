"use client";

import { useRef, useState } from "react";
import type { HandoffCard } from "@/lib/handoff";
import PosterCover from "./PosterCover";

/**
 * Project cover: real image (feedImage ?? image) fading in over the generated
 * poster, which doubles as loading placeholder and missing-image fallback.
 * With `hoverVideo`, a beat of hover swaps in the muted demo embed.
 */
export default function Cover({
  card,
  hoverVideo = false,
  eager = false,
}: {
  card: HandoffCard;
  hoverVideo?: boolean;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const src = card.project.feedImage ?? card.project.image;

  function armVideo() {
    if (!hoverVideo || !card.project.demoVideoUrl) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (document.body.classList.contains("no-motion")) return;
    timer.current = setTimeout(() => setShowVideo(true), 450);
  }
  function disarmVideo() {
    clearTimeout(timer.current);
    setShowVideo(false);
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onPointerEnter={armVideo}
      onPointerLeave={disarmVideo}
    >
      <PosterCover card={card} />
      {!failed && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={`${card.name} project image`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      {showVideo && (
        <iframe
          src={`${card.project.demoVideoUrl}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1`}
          title=""
          aria-hidden
          tabIndex={-1}
          allow="autoplay; encrypted-media"
          className="backdrop-in pointer-events-none absolute inset-0 h-full w-full"
        />
      )}
    </div>
  );
}
