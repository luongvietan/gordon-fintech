'use client';

import {
  AreaChart,
  Area,
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
}: Props) {
  const hasPslf = pslfSchedule.length > 0;

  const pslfMap = new Map(pslfSchedule.map((r) => [r.year, r.netWorth]));
  const data = schedule.map((r) => ({
    year: r.year,
    standard: r.netWorth,
    ...(hasPslf ? { pslf: pslfMap.get(r.year) ?? null } : {}),
  }));

  return (
    <div className="-ml-3 md:-ml-2">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 16 }}>
          <defs>
            <linearGradient id="nw-standard" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0e0f0c" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#0e0f0c" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="nw-pslf" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#9fe870" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#9fe870" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(14,15,12,0.07)" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#868685', fontWeight: 600 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(14,15,12,0.12)' }}
            tickMargin={8}
            label={{
              value: 'Years from now',
              position: 'insideBottom',
              offset: -8,
              fontSize: 10,
              fill: '#868685',
              fontWeight: 700,
              letterSpacing: '0.06em',
            }}
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
            formatter={(v, name) => [fmtTip(v), name === 'standard' ? 'Standard' : 'PSLF']}
            labelFormatter={(l) => `Year ${l}`}
            contentStyle={{
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              borderRadius: 14,
              boxShadow: 'rgba(14,15,12,0.12) 0 0 0 1px, 0 8px 30px rgba(14,15,12,0.10)',
              padding: '10px 14px',
            }}
            itemStyle={{ padding: 0 }}
            cursor={{ stroke: 'rgba(14,15,12,0.18)', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          {hasPslf && (
            <Legend
              verticalAlign="top"
              align="right"
              height={28}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingBottom: 4 }}
              formatter={(v) => (v === 'standard' ? 'Standard' : 'PSLF')}
            />
          )}
          <ReferenceLine y={0} stroke="#454745" strokeWidth={1.25} strokeDasharray="2 4" />
          <ReferenceLine
            x={residencyYears}
            stroke="#0e0f0c"
            strokeDasharray="4 4"
            strokeOpacity={0.45}
            label={{
              value: 'Attending',
              position: 'insideTopRight',
              fontSize: 10,
              fill: '#0e0f0c',
              fontWeight: 700,
            }}
          />
          {crossoverYear !== null && (
            <ReferenceLine
              x={crossoverYear}
              stroke="#9fe870"
              strokeWidth={2.5}
              label={{
                value: `Crossover \u00b7 Yr ${crossoverYear}`,
                position: 'insideTopLeft',
                fontSize: 10,
                fill: '#163300',
                fontWeight: 800,
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="standard"
            stroke="#0e0f0c"
            strokeWidth={2.5}
            fill="url(#nw-standard)"
            activeDot={{ r: 5, fill: '#0e0f0c', stroke: '#fff', strokeWidth: 2 }}
            name="standard"
          />
          {hasPslf && (
            <Area
              type="monotone"
              dataKey="pslf"
              stroke="#163300"
              strokeWidth={3}
              fill="url(#nw-pslf)"
              activeDot={{ r: 5, fill: '#163300', stroke: '#fff', strokeWidth: 2 }}
              name="pslf"
              connectNulls
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
