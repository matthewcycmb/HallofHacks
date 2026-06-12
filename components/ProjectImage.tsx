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
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={(e) => {
        const img = e.currentTarget;
        if (!img.src.endsWith("/fallback.svg")) img.src = "/fallback.svg";
      }}
    />
  );
}
