import type { HandoffCard } from "@/lib/handoff";
import { paletteOf } from "@/lib/handoff";

type Palette = ReturnType<typeof paletteOf>;

/** Background pattern per hue bucket — port of covers.js `pattern()`. */
function patternStyle(card: HandoffCard, c: Palette): React.CSSProperties {
  const which = (card.hue + card.name.length) % 4;
  if (which === 0)
    return {
      backgroundImage: `radial-gradient(${c.line} 1.5px, transparent 1.5px)`,
      backgroundSize: "22px 22px",
    };
  if (which === 1)
    return {
      backgroundImage: `repeating-linear-gradient(-45deg, ${c.bg2} 0 10px, transparent 10px 26px)`,
    };
  if (which === 2)
    return {
      backgroundImage: `linear-gradient(${c.line} 1px, transparent 1px), linear-gradient(90deg, ${c.line} 1px, transparent 1px)`,
      backgroundSize: "34px 34px",
      backgroundPosition: "-1px -1px",
    };
  return {
    backgroundImage: `linear-gradient(180deg, transparent 62%, ${c.bg2} 62%)`,
  };
}

/**
 * Generated typographic poster art — React port of shared/covers.js.
 * Used as the loading placeholder and the fallback when a project has no
 * usable image.
 */
export default function PosterCover({ card }: { card: HandoffCard }) {
  const c = paletteOf(card);
  const base: React.CSSProperties = { background: c.bg, ...patternStyle(card, c) };

  switch (card.style) {
    case 1: {
      const word = card.name.toUpperCase();
      return (
        <div className="hoh-cover hc1" style={base}>
          <div className="hc1-stack" style={{ color: c.fg }}>
            <span>{word}</span>
            <span className="hc1-ghost" style={{ WebkitTextStrokeColor: c.fgSoft }}>
              {word}
            </span>
            <span>{word}</span>
          </div>
        </div>
      );
    }
    case 2:
      return (
        <div className="hoh-cover hc2" style={base}>
          <div className="hc2-rule" style={{ background: c.fg }} />
          <div className="hc2-name" style={{ color: c.fg }}>
            {card.name}
          </div>
          <div className="hc2-sub" style={{ color: c.fgSoft }}>
            {card.event}
          </div>
          <div className="hc2-rule" style={{ background: c.fg }} />
        </div>
      );
    case 3:
      return (
        <div className="hoh-cover hc3" style={base}>
          <div className="hc3-frame" style={{ borderColor: c.fgSoft, color: c.fg }}>
            <div className="hc3-bar" style={{ borderColor: c.fgSoft, color: c.fgSoft }}>
              ~/{card.tag.toLowerCase().replace(/[^a-z]/g, "")}
            </div>
            <div className="hc3-body">
              &gt; {card.name.toLowerCase()}
              <span className="hc3-cursor" style={{ background: c.fg }} />
            </div>
          </div>
        </div>
      );
    case 4:
      return (
        <div className="hoh-cover hc4" style={base}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="hc4-row"
              style={
                i === 2
                  ? { color: c.fg }
                  : { color: "transparent", WebkitTextStroke: `1.5px ${c.fgSoft}` }
              }
            >
              {card.name}
            </div>
          ))}
        </div>
      );
    default: {
      const initials = card.name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase();
      return (
        <div className="hoh-cover hc5" style={base}>
          <div className="hc5-badge" style={{ background: c.fg, color: c.bg }}>
            {initials}
          </div>
          <div className="hc5-name" style={{ color: c.fg }}>
            {card.name}
          </div>
        </div>
      );
    }
  }
}
