/**
 * Decorative net-worth projection chart used as the right-side visual anchor
 * in the hero. Not tied to real calculator output — its only job is to hint
 * at what the tool produces and give the hero something to hold.
 *
 * Two curves: debt balance declining, net worth climbing from negative
 * through a crossover point, with an annotated dot at the intersection.
 *
 * Animation: stroke dash-offset draw on mount via CSS keyframes in globals
 * (falls back gracefully if animations are disabled).
 */

interface Props {
  className?: string;
}

export default function HeroChart({ className }: Props) {
  // Deterministic points for 10 years — tuned to cross near Yr 7.
  // x: 40 + i * 48 (11 points across 520 viewBox width)
  // y: mapped so 420 = very negative, 100 = very positive, 260 = zero line.

  const width = 560;
  const height = 400;
  const zeroY = 260;

  const netWorth = [395, 370, 340, 310, 280, 250, 220, 175, 120, 80, 50];
  const debt = [100, 120, 145, 175, 205, 235, 265, 290, 310, 325, 335];
  const xs = netWorth.map((_, i) => 40 + i * 48);

  const netPath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${netWorth[i]}`).join(' ');
  const debtPath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${debt[i]}`).join(' ');

  // Crossover roughly at index 7 (Yr 7)
  const crossoverIdx = 7;
  const crossX = xs[crossoverIdx];
  const crossY = (netWorth[crossoverIdx] + debt[crossoverIdx]) / 2;

  return (
    <div
      aria-hidden
      className={className}
      style={{ maxWidth: width, width: '100%' }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        className="overflow-visible"
        role="presentation"
      >
        <defs>
          <linearGradient id="heroNetWorthFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-wise-green)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-wise-green)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="heroDebtFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* grid — subtle dashes at major y-levels */}
        {[80, 160, 240, 320].map((y) => (
          <line
            key={y}
            x1="20"
            x2={width - 20}
            y1={y}
            y2={y}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="3 6"
            strokeWidth="1"
          />
        ))}

        {/* zero baseline */}
        <line
          x1="20"
          x2={width - 20}
          y1={zeroY}
          y2={zeroY}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.25"
          strokeDasharray="5 5"
        />
        <text
          x={width - 24}
          y={zeroY - 8}
          fontSize="10"
          fontWeight="700"
          letterSpacing="0.08em"
          textAnchor="end"
          fill="rgba(255,255,255,0.5)"
        >
          $0 NET WORTH
        </text>

        {/* Debt balance — lighter line */}
        <path
          d={`${debtPath} L${xs[xs.length - 1]},${height} L${xs[0]},${height} Z`}
          fill="url(#heroDebtFill)"
          opacity="0.55"
        />
        <path
          d={debtPath}
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="hero-draw-slow"
        />

        {/* Net-worth — wise-green, prominent */}
        <path
          d={`${netPath} L${xs[xs.length - 1]},${zeroY} L${xs[0]},${zeroY} Z`}
          fill="url(#heroNetWorthFill)"
          opacity="0.65"
        />
        <path
          d={netPath}
          fill="none"
          stroke="var(--color-wise-green)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="hero-draw"
        />

        {/* Crossover marker */}
        <circle cx={crossX} cy={crossY} r="16" fill="var(--color-wise-green)" opacity="0.18">
          <animate
            attributeName="r"
            values="14;22;14"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx={crossX} cy={crossY} r="6" fill="var(--color-wise-green)" />
        <circle cx={crossX} cy={crossY} r="2.5" fill="var(--color-dark-green)" />

        {/* Crossover label */}
        <g transform={`translate(${crossX + 18}, ${crossY - 40})`}>
          <rect
            x="0"
            y="0"
            width="148"
            height="54"
            rx="10"
            fill="var(--color-wise-green)"
          />
          <text
            x="12"
            y="20"
            fontSize="9"
            fontWeight="800"
            letterSpacing="0.12em"
            fill="var(--color-dark-green)"
            opacity="0.7"
          >
            NET-WORTH CROSSOVER
          </text>
          <text
            x="12"
            y="42"
            fontSize="18"
            fontWeight="900"
            fill="var(--color-dark-green)"
            fontFamily="var(--font-numbers)"
          >
            Year 7
          </text>
        </g>

        {/* Legend bottom-left */}
        <g transform={`translate(24, ${height - 28})`}>
          <rect x="0" y="0" width="10" height="10" rx="2" fill="var(--color-wise-green)" />
          <text x="16" y="9" fontSize="10" fontWeight="700" fill="rgba(255,255,255,0.75)">
            Net worth
          </text>
          <rect x="96" y="0" width="10" height="10" rx="2" fill="rgba(255,255,255,0.55)" />
          <text x="112" y="9" fontSize="10" fontWeight="700" fill="rgba(255,255,255,0.75)">
            Debt balance
          </text>
        </g>
      </svg>
    </div>
  );
}
