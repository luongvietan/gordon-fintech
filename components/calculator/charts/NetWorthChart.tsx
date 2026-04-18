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
  schedule: YearlySnapshot[];
  pslfSchedule: YearlySnapshot[];
  residencyYears: number;
  crossoverYear: number | null;
  taxRate?: number;
}

function fmtY(v: number) {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
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

export default function NetWorthChart({
  schedule,
  pslfSchedule,
  residencyYears,
  crossoverYear,
  taxRate,
}: Props) {
  const hasPslf = pslfSchedule.length > 0;

  const pslfMap = new Map(pslfSchedule.map((r) => [r.year, r.netWorth]));
  const data = schedule.map((r) => ({
    year: r.year,
    standard: r.netWorth,
    ...(hasPslf ? { pslf: pslfMap.get(r.year) ?? null } : {}),
  }));

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h3
          className="text-[1.125rem] text-[color:var(--text-primary)] tracking-[-0.01em]"
          style={{ fontWeight: 900 }}
        >
          Net Worth Over Time
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
            width={56}
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
          <ReferenceLine y={0} stroke="#868685" strokeWidth={1} strokeDasharray="2 3" />
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
          {crossoverYear !== null && (
            <ReferenceLine
              x={crossoverYear}
              stroke="#9fe870"
              strokeWidth={2.5}
              label={{
                value: `Crossover · Yr ${crossoverYear}`,
                position: 'insideTopLeft',
                fontSize: 10,
                fill: '#163300',
                fontWeight: 700,
              }}
            />
          )}
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
      <p className="text-[11px] text-[color:var(--text-muted)] mt-2 font-medium">
        After tax (~{taxRate ?? 30}%) · minus living expenses · minus loan payments
      </p>
    </div>
  );
}
