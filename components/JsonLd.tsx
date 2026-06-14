/**
 * Renders a JSON-LD structured-data block. Per the Next.js JSON-LD guide, a
 * native <script> is correct (it's data, not executable), and we escape "<"
 * to its unicode form so a malicious string can't break out of the tag.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
