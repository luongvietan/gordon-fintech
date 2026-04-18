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
} from 'recharts';
import { CalculatorOutputs } from '@/lib/calculator';

interface Props {
  outputs: CalculatorOutputs;
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
      name: 'Forgiven (tax-free)',
      Standard: 0,
      PSLF: outputs.pslfForgiven,
    },
    {
      name: 'Total interest',
      Standard: outputs.totalInterestPaid,
      PSLF: 0,
    },
  ];

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h3
          className="text-[1.125rem] text-[color:var(--text-primary)] tracking-[-0.01em]"
          style={{ fontWeight: 900 }}
        >
          PSLF vs Standard
        </h3>
        <span className="text-xs font-semibold text-[color:var(--text-muted)]">
          Side-by-side totals
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
          barCategoryGap="24%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,15,12,0.06)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#0e0f0c', fontWeight: 700 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(14,15,12,0.12)' }}
          />
          <YAxis
            tickFormatter={fmtY}
            tick={{ fontSize: 11, fill: '#868685', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            formatter={(v) => fmtTip(v)}
            contentStyle={{
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              borderRadius: 16,
              boxShadow: 'rgba(14,15,12,0.12) 0 0 0 1px, 0 4px 24px rgba(14,15,12,0.08)',
              padding: '10px 14px',
            }}
            itemStyle={{ padding: 0 }}
            cursor={{ fill: 'rgba(14,15,12,0.04)' }}
          />
          <Bar dataKey="Standard" fill="#0e0f0c" radius={[8, 8, 0, 0]} maxBarSize={44}>
            <LabelList dataKey="Standard" position="top" fontSize={10} fontWeight={700} formatter={(v: unknown) => (typeof v === 'number' && v > 0 ? fmtY(v) : '')} />
          </Bar>
          <Bar dataKey="PSLF" fill="#9fe870" radius={[8, 8, 0, 0]} maxBarSize={44}>
            <LabelList dataKey="PSLF" position="top" fontSize={10} fontWeight={700} fill="#163300" formatter={(v: unknown) => (typeof v === 'number' && v > 0 ? fmtY(v) : '')} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
