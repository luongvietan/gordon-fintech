'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Legend,
} from 'recharts';
import { CalculatorOutputs } from '@/lib/calculator';

interface Props {
  outputs: CalculatorOutputs;
  /** See BalanceChart — kept for symmetry, height steps live in CSS. */
  heightDesktop?: number;
}

function fmtY(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function fmtTip(v: unknown) {
  if (typeof v !== 'number') return String(v);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(v);
}

export default function ComparisonChart({ outputs }: Props) {
  if (!outputs.pslfEligible) return null;

  const data = [
    {
      name: 'Out of pocket',
      Standard: outputs.standardTotalPaid,
      PSLF: outputs.pslfTotalPaid,
    },
    {
      name: 'Interest paid',
      Standard: outputs.totalInterestPaid,
      PSLF: outputs.pslfInterestPaid,
    },
    {
      name: 'Forgiven (tax-free)',
      Standard: 0,
      PSLF: outputs.pslfForgiven,
    },
  ];

  return (
    <div>
      <div className="-ml-3 md:-ml-2 h-[300px] md:h-[340px] lg:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 36, right: 16, left: 0, bottom: 8 }}
            barCategoryGap="28%"
            barGap={8}
          >
            <defs>
              <linearGradient id="cmp-pslf" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#9fe870" stopOpacity={1} />
                <stop offset="100%" stopColor="#7dd14a" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(14,15,12,0.07)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#0e0f0c', fontWeight: 700 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(14,15,12,0.12)' }}
              tickMargin={10}
            />
            <YAxis
              tickFormatter={fmtY}
              tick={{ fontSize: 11, fill: '#868685', fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              width={66}
              tickMargin={6}
            />
            <Tooltip
              formatter={(v) => fmtTip(v)}
              contentStyle={{
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                borderRadius: 14,
                boxShadow: 'rgba(14,15,12,0.12) 0 0 0 1px, 0 12px 36px rgba(14,15,12,0.14)',
                padding: '12px 16px',
                background: '#fff',
              }}
              labelStyle={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: '#868685',
                marginBottom: 4,
              }}
              itemStyle={{ padding: 0, color: '#0e0f0c' }}
              cursor={{ fill: 'rgba(14,15,12,0.04)' }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              height={32}
              iconType="circle"
              iconSize={9}
              wrapperStyle={{
                fontSize: 11,
                fontWeight: 700,
                color: '#0e0f0c',
                paddingBottom: 6,
                letterSpacing: '0.04em',
              }}
            />
            <Bar
              dataKey="Standard"
              fill="#0e0f0c"
              radius={[10, 10, 0, 0]}
              maxBarSize={56}
            >
              <LabelList
                dataKey="Standard"
                position="top"
                fontSize={11}
                fontWeight={800}
                fill="#0e0f0c"
                formatter={(v: unknown) =>
                  typeof v === 'number' && v > 0 ? fmtY(v) : ''
                }
              />
            </Bar>
            <Bar
              dataKey="PSLF"
              fill="url(#cmp-pslf)"
              radius={[10, 10, 0, 0]}
              maxBarSize={56}
            >
              <LabelList
                dataKey="PSLF"
                position="top"
                fontSize={11}
                fontWeight={800}
                fill="#163300"
                formatter={(v: unknown) =>
                  typeof v === 'number' && v > 0 ? fmtY(v) : ''
                }
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[12px] text-[color:var(--text-muted)] mt-4 leading-relaxed font-medium px-1">
        <strong className="text-[color:var(--text-primary)] font-bold">Out of pocket</strong> &mdash;
        total $ you actually pay. <strong className="text-[color:var(--text-primary)] font-bold">Interest paid</strong> &mdash;
        portion that went to interest. <strong className="text-[color:var(--text-primary)] font-bold">Forgiven</strong> &mdash;
        remaining balance wiped tax-free after 120 qualifying payments.
      </p>
    </div>
  );
}
