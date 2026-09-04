import { useState } from "react";
import { TOTAL_BEADS } from "./braceletConfig";

const SVG_W = 560;
const SVG_H = 260;
const BEAD_R = 20;
const START_X = 50;
const END_X = 510;
const ARC_HEIGHT = 150;

const PRESET_COLORS = [
  "#e91e8c", "#ff6b6b", "#ffa94d", "#ffd43b",
  "#69db7c", "#38d9a9", "#4dabf7", "#748ffc",
  "#9775fa", "#f783ac", "#fff", "#000",
];

const PENDANT_SYMBOLS = {
  heart: "♥",
  star: "★",
  circle: "○",
  diamond: "◇",
  dollar: "$",
};

const BraceletPreview = ({ beadColors = [], onBeadColorChange = () => {}, pendantType = "heart" }) => {
  const [activeBead, setActiveBead] = useState(null);

  // Calculate bead positions along a gentle arc
  const beads = Array.from({ length: TOTAL_BEADS }, (_, i) => {
    const t = TOTAL_BEADS <= 1 ? 0.5 : i / (TOTAL_BEADS - 1);
    const x = START_X + t * (END_X - START_X);
    const y = 30 + Math.sin(t * Math.PI) * ARC_HEIGHT;
    return { x, y, index: i };
  });

  const anyColored = beadColors.some(
    (c) => c && c !== "#e0e0e0" && c !== "#d0d0d0"
  );

  const handleBeadClick = (index) => {
    setActiveBead(index);
  };

  const handleColorPick = (index, color) => {
    onBeadColorChange(index, color);
  };

  const handlePresetClick = (color) => {
    if (activeBead !== null) {
      onBeadColorChange(activeBead, color);
    }
  };

  // Build the string path through all beads
  const pathD = beads
    .map((b, i) => `${i === 0 ? "M" : "L"}${b.x},${b.y}`)
    .join(" ");

  return (
    <div className="bracelet-preview-wrapper">
      <svg
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="bracelet-preview-svg bracelets-preview-svg--arc"
      >
        <defs>
          <filter id="bead-shadow-arc">
            <feDropShadow dx="1" dy="2" stdDeviation="2.5" floodOpacity="0.18" />
          </filter>
          <filter id="bead-glow">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="var(--brand)" floodOpacity="0.4" />
          </filter>
          <linearGradient id="gold-grad-arc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe066" />
            <stop offset="50%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#daa520" />
          </linearGradient>
          <linearGradient id="thread-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#bbb" />
            <stop offset="50%" stopColor="#ddd" />
            <stop offset="100%" stopColor="#bbb" />
          </linearGradient>
        </defs>

        {/* Background shadow for the bracelet shape */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(0,0,0,0.04)"
          strokeWidth={BEAD_R * 2 + 14}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Thread / string */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#thread-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Beads */}
        {beads.map((bead, i) => {
          const color = beadColors[i] || "#e0e0e0";
          const isEmpty = color === "#e0e0e0" || color === "#d0d0d0";
          const isActive = activeBead === i;

          return (
            <g
              key={i}
              className={`preview-bead-arc ${isEmpty ? "bead-empty" : ""} ${isActive ? "bead-active" : ""}`}
              onClick={() => handleBeadClick(i)}
              style={{ cursor: "pointer" }}
            >

              {/* Bead shadow */}
              <circle
                cx={bead.x + 1.5}
                cy={bead.y + 2}
                r={BEAD_R}
                fill="rgba(0,0,0,0.08)"
              />

              {/* Bead body */}
              <circle
                cx={bead.x}
                cy={bead.y}
                r={BEAD_R}
                fill={color}
                stroke={
                  isActive
                    ? "var(--brand)"
                    : isEmpty
                      ? "rgba(0,0,0,0.12)"
                      : "rgba(0,0,0,0.1)"
                }
                strokeWidth={isActive ? 2.5 : 1}
                filter={isActive ? "url(#bead-glow)" : "url(#bead-shadow-arc)"}
              />

              {/* Gloss highlight */}
              {!isEmpty && (
                <>
                  <ellipse
                    cx={bead.x - BEAD_R * 0.3}
                    cy={bead.y - BEAD_R * 0.3}
                    rx={BEAD_R * 0.38}
                    ry={BEAD_R * 0.22}
                    fill="rgba(255,255,255,0.3)"
                    transform={`rotate(-25, ${bead.x - BEAD_R * 0.3}, ${bead.y - BEAD_R * 0.3})`}
                  />
                  <circle
                    cx={bead.x - BEAD_R * 0.45}
                    cy={bead.y - BEAD_R * 0.45}
                    r={BEAD_R * 0.1}
                    fill="rgba(255,255,255,0.5)"
                  />
                </>
              )}

              {/* "Click me" hint on empty beads */}
              {isEmpty && (
                <text
                  x={bead.x}
                  y={bead.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(0,0,0,0.18)"
                  fontSize="10"
                  fontFamily="Arial, sans-serif"
                  fontWeight="300"
                  style={{ pointerEvents: "none" }}
                >
                  +
                </text>
              )}

              {/* Bead number label on hover */}
              <title>Bead {i + 1}{isEmpty ? "" : ` — ${color}`}</title>
            </g>
          );
        })}

        {/* Pendant at the end */}
        {pendantType && PENDANT_SYMBOLS[pendantType] && (
          <g className="pendant-arc">
            {/* Chain from last bead */}
            <line
              x1={beads[TOTAL_BEADS - 1].x + BEAD_R}
              y1={beads[TOTAL_BEADS - 1].y}
              x2={beads[TOTAL_BEADS - 1].x + BEAD_R + 28}
              y2={beads[TOTAL_BEADS - 1].y + 8}
              stroke="#a0a0a0"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
            {/* Charm ring */}
            <circle
              cx={beads[TOTAL_BEADS - 1].x + BEAD_R + 34}
              cy={beads[TOTAL_BEADS - 1].y + 10}
              r={4}
              fill="none"
              stroke="#daa520"
              strokeWidth="1.5"
            />
            {/* Charm body */}
            <circle
              cx={beads[TOTAL_BEADS - 1].x + BEAD_R + 34}
              cy={beads[TOTAL_BEADS - 1].y + 28}
              r={18}
              fill="url(#gold-grad-arc)"
              stroke="#b8860b"
              strokeWidth="1.5"
              filter="url(#bead-shadow-arc)"
            />
            {/* Pendant symbol */}
            <text
              x={beads[TOTAL_BEADS - 1].x + BEAD_R + 34}
              y={beads[TOTAL_BEADS - 1].y + 35}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#8b6914"
              fontSize="20"
              fontWeight="bold"
              fontFamily="Georgia, 'Times New Roman', serif"
              style={{ userSelect: "none" }}
            >
              {PENDANT_SYMBOLS[pendantType]}
            </text>
            {/* Sparkle */}
            <circle
              cx={beads[TOTAL_BEADS - 1].x + BEAD_R + 28}
              cy={beads[TOTAL_BEADS - 1].y + 16}
              r={2.5}
              fill="rgba(255,255,255,0.5)"
            />
          </g>
        )}

        {/* Empty state text when no beads colored */}
        {!anyColored && (
          <text
            x={SVG_W / 2}
            y={SVG_H - 12}
            textAnchor="middle"
            fill="#bbb"
            fontSize="12"
            fontFamily="inherit"
            letterSpacing="0.05em"
          >
            Click any bead to choose its color
          </text>
        )}
      </svg>

      {/* Color Presets Panel (shown when a bead is active) */}
      {activeBead !== null && (
        <div className="preset-panel">
          <div className="preset-panel-header">
            <span>Bead {activeBead + 1} color</span>
            <button
              className="preset-close-btn"
              onClick={() => setActiveBead(null)}
              type="button"
            >
              ✕
            </button>
          </div>
          <div className="preset-colors">
            {PRESET_COLORS.map((c, i) => (
              <button
                key={i}
                type="button"
                className={`preset-swatch ${beadColors[activeBead] === c ? "preset-swatch--active" : ""}`}
                style={{ backgroundColor: c }}
                onClick={() => handlePresetClick(c)}
                title={c}
              />
            ))}
          </div>
          <div className="preset-custom-row">
            <span>Custom:</span>
            <input
              type="color"
              value={
                beadColors[activeBead] === "#e0e0e0" || beadColors[activeBead] === "#d0d0d0"
                  ? "#e91e8c"
                  : beadColors[activeBead]
              }
              onChange={(e) => handleColorPick(activeBead, e.target.value)}
              className="preset-custom-picker"
            />
          </div>
        </div>
      )}

      {/* Color overview strip */}
      <div className="bead-overview">
        {beadColors.map((c, i) => (
          <button
            key={i}
            type="button"
            className={`bead-dot ${activeBead === i ? "bead-dot--active" : ""} ${
              c === "#e0e0e0" || c === "#d0d0d0" ? "bead-dot--empty" : ""
            }`}
            style={{
              backgroundColor:
                c === "#e0e0e0" || c === "#d0d0d0" ? "#e8e8e8" : c,
            }}
            onClick={() => handleBeadClick(i)}
            title={`Bead ${i + 1}`}
          />
        ))}
        {pendantType && PENDANT_SYMBOLS[pendantType] && (
          <span className="bead-dot-pendant" title={`${pendantType} pendant`}>
            {PENDANT_SYMBOLS[pendantType]}
          </span>
        )}
      </div>
    </div>
  );
};

export default BraceletPreview;
