'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { YearlySnapshot } from '@/lib/calculator';

interface Props {
  standardSchedule: YearlySnapshot[];
  pslfSchedule: YearlySnapshot[];
  residencyYears: number;
}

function fmtY(v: number) {
  return v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`;
}

function fmtTip(v: unknown) {
  if (typeof v !== 'number') return String(v);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(v);
}

export default function BalanceChart({
  standardSchedule,
  pslfSchedule,
  residencyYears,
}: Props) {
  const hasPslf = pslfSchedule.length > 0;

  const pslfMap = new Map(pslfSchedule.map((r) => [r.year, r.balance]));
  const data = standardSchedule.map((r) => ({
    year: r.year,
    standard: r.balance,
    ...(hasPslf ? { pslf: pslfMap.get(r.year) ?? null } : {}),
  }));

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h3
          className="text-[1.125rem] text-[color:var(--text-primary)] tracking-[-0.01em]"
          style={{ fontWeight: 900 }}
        >
          Loan Balance Over Time
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,15,12,0.06)" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#868685', fontWeight: 600 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(14,15,12,0.12)' }}
            label={{
              value: 'Years',
              position: 'insideBottom',
              offset: -8,
              fontSize: 11,
              fill: '#868685',
            }}
          />
          <YAxis
            tickFormatter={fmtY}
            tick={{ fontSize: 11, fill: '#868685', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip
            formatter={(v, name) => [fmtTip(v), name === 'standard' ? 'Standard' : 'PSLF']}
            labelFormatter={(l) => `Year ${l}`}
            contentStyle={{
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              borderRadius: 16,
              boxShadow: 'rgba(14,15,12,0.12) 0 0 0 1px, 0 4px 24px rgba(14,15,12,0.08)',
              padding: '10px 14px',
            }}
            itemStyle={{ padding: 0 }}
          />
          {hasPslf && (
            <Legend
              wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 6 }}
              iconType="plainline"
              formatter={(v) => (v === 'standard' ? 'Standard' : 'PSLF (SAVE)')}
            />
          )}
          <ReferenceLine
            x={residencyYears}
            stroke="#0e0f0c"
            strokeDasharray="3 4"
            strokeOpacity={0.4}
            label={{
              value: 'Attending',
              position: 'insideTopRight',
              fontSize: 10,
              fill: '#0e0f0c',
              fontWeight: 600,
            }}
          />
          <Line
            type="monotone"
            dataKey="standard"
            stroke="#0e0f0c"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#0e0f0c' }}
            name="standard"
          />
          {hasPslf && (
            <Line
              type="monotone"
              dataKey="pslf"
              stroke="#9fe870"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4, fill: '#163300' }}
              name="pslf"
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
