/**
 * Static two-curve illustration used by the USP section to explain the
 * net-worth crossover concept. Not tied to calculator inputs — tuned by
 * hand so the crossover lands clearly on Year 7.
 */

interface Props {
  className?: string;
}

export default function CrossoverChart({ className }: Props) {
  const width = 560;
  const height = 340;

  // 11 points across width
  const payOff = [120, 145, 172, 198, 220, 238, 252, 262, 268, 272, 275];
  const invest = [280, 270, 258, 242, 224, 204, 184, 160, 132, 104, 76];
  const xs = payOff.map((_, i) => 40 + i * 48);

  const payOffPath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${payOff[i]}`).join(' ');
  const investPath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${invest[i]}`).join(' ');

  const crossoverIdx = 7;
  const crossX = xs[crossoverIdx];
  const crossY = (payOff[crossoverIdx] + invest[crossoverIdx]) / 2;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        className="overflow-visible"
        role="img"
        aria-label="Illustrative chart of two net-worth trajectories crossing at year 7"
      >
        <defs>
          <linearGradient id="uspInvestFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-wise-green)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-wise-green)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="uspPayoffFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(16,32,28,0.15)" />
            <stop offset="100%" stopColor="rgba(16,32,28,0)" />
          </linearGradient>
        </defs>

        {/* axis */}
        <line
          x1="40"
          x2={width - 40}
          y1={height - 40}
          y2={height - 40}
          stroke="rgba(16,32,28,0.15)"
          strokeWidth="1"
        />
        {xs.filter((_, i) => i % 2 === 0).map((x, i) => (
          <text
            key={x}
            x={x}
            y={height - 20}
            fontSize="10"
            fontWeight="700"
            textAnchor="middle"
            fill="var(--text-muted)"
            letterSpacing="0.04em"
          >
            Yr {i * 2}
          </text>
        ))}

        {/* Aggressive payoff curve — dark */}
        <path
          d={`${payOffPath} L${xs[xs.length - 1]},${height - 40} L${xs[0]},${height - 40} Z`}
          fill="url(#uspPayoffFill)"
        />
        <path
          d={payOffPath}
          fill="none"
          stroke="var(--color-near-black)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mini-draw"
          style={{ strokeDasharray: 800, strokeDashoffset: 800, animationDuration: '2s' }}
        />

        {/* Invest-more curve — wise green */}
        <path
          d={`${investPath} L${xs[xs.length - 1]},${height - 40} L${xs[0]},${height - 40} Z`}
          fill="url(#uspInvestFill)"
        />
        <path
          d={investPath}
          fill="none"
          stroke="var(--color-dark-green)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mini-draw"
          style={{ strokeDasharray: 800, strokeDashoffset: 800, animationDuration: '2s', animationDelay: '0.2s' }}
        />

        {/* Crossover marker */}
        <circle cx={crossX} cy={crossY} r="16" fill="var(--color-wise-green)" opacity="0.35">
          <animate
            attributeName="r"
            values="12;20;12"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx={crossX} cy={crossY} r="7" fill="var(--color-wise-green)" />
        <circle cx={crossX} cy={crossY} r="3" fill="var(--color-dark-green)" />

        <g transform={`translate(${crossX + 14}, ${crossY - 60})`}>
          <rect
            x="0"
            y="0"
            width="160"
            height="52"
            rx="10"
            fill="var(--color-near-black)"
          />
          <text
            x="12"
            y="20"
            fontSize="9"
            fontWeight="800"
            letterSpacing="0.12em"
            fill="rgba(255,255,255,0.6)"
          >
            CROSSOVER · YEAR 7
          </text>
          <text
            x="12"
            y="40"
            fontSize="14"
            fontWeight="800"
            fill="white"
          >
            Aggressive wins from here
          </text>
        </g>

        {/* Legend */}
        <g transform={`translate(40, 20)`}>
          <rect x="0" y="0" width="10" height="10" rx="2" fill="var(--color-near-black)" />
          <text x="16" y="9" fontSize="10" fontWeight="700" fill="var(--text-primary)">
            Aggressive payoff
          </text>
          <rect x="136" y="0" width="10" height="10" rx="2" fill="var(--color-dark-green)" />
          <text x="152" y="9" fontSize="10" fontWeight="700" fill="var(--text-primary)">
            PSLF + invest extra
          </text>
        </g>
      </svg>
    </div>
  );
}
