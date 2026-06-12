import type { HandoffCard } from "@/lib/handoff";

export default function PrizeChip({
  card,
  prefix,
}: {
  card: Pick<HandoffCard, "prize" | "tier">;
  prefix?: string;
}) {
  return (
    <span className={`hoh-prize${card.tier === "grand" ? " grand" : ""}`}>
      {prefix ? `${prefix} - ` : ""}
      {card.prize}
    </span>
  );
}
