"use client";

export default function ProjectImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      // Already-loaded (cached/pre-hydration) images won't fire onLoad — reveal them on mount.
      ref={(el) => {
        if (el && el.complete && el.naturalWidth > 0) el.classList.add("is-loaded");
      }}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`img-fade ${className ?? ""}`}
      onLoad={(e) => e.currentTarget.classList.add("is-loaded")}
      onError={(e) => {
        const img = e.currentTarget;
        if (!img.src.endsWith("/fallback.svg")) img.src = "/fallback.svg";
        img.classList.add("is-loaded");
      }}
    />
  );
}
