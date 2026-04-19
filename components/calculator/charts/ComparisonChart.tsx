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
    <div className="-ml-3 md:-ml-2">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 32, right: 12, left: 0, bottom: 8 }}
          barCategoryGap="32%"
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(14,15,12,0.07)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#0e0f0c', fontWeight: 700 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(14,15,12,0.12)' }}
            tickMargin={8}
          />
          <YAxis
            tickFormatter={fmtY}
            tick={{ fontSize: 11, fill: '#868685', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={62}
            tickMargin={4}
          />
          <Tooltip
            formatter={(v) => fmtTip(v)}
            contentStyle={{
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              borderRadius: 14,
              boxShadow: 'rgba(14,15,12,0.12) 0 0 0 1px, 0 8px 30px rgba(14,15,12,0.10)',
              padding: '10px 14px',
            }}
            itemStyle={{ padding: 0 }}
            cursor={{ fill: 'rgba(14,15,12,0.04)' }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={28}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              fontSize: 11,
              fontWeight: 700,
              color: '#0e0f0c',
              paddingBottom: 4,
            }}
          />
          <Bar
            dataKey="Standard"
            fill="#0e0f0c"
            radius={[10, 10, 0, 0]}
            maxBarSize={48}
          >
            <LabelList
              dataKey="Standard"
              position="top"
              fontSize={10}
              fontWeight={700}
              fill="#0e0f0c"
              formatter={(v: unknown) =>
                typeof v === 'number' && v > 0 ? fmtY(v) : ''
              }
            />
          </Bar>
          <Bar
            dataKey="PSLF"
            fill="#9fe870"
            radius={[10, 10, 0, 0]}
            maxBarSize={48}
          >
            <LabelList
              dataKey="PSLF"
              position="top"
              fontSize={10}
              fontWeight={700}
              fill="#163300"
              formatter={(v: unknown) =>
                typeof v === 'number' && v > 0 ? fmtY(v) : ''
              }
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[11px] text-[color:var(--text-muted)] mt-3 leading-relaxed font-medium px-1">
        <strong className="text-[color:var(--text-primary)] font-bold">Out of pocket</strong> &mdash;
        total $ you actually pay. <strong className="text-[color:var(--text-primary)] font-bold">Interest paid</strong> &mdash;
        portion that went to interest. <strong className="text-[color:var(--text-primary)] font-bold">Forgiven</strong> &mdash;
        remaining balance wiped tax-free after 120 qualifying payments.
      </p>
    </div>
  );
}
