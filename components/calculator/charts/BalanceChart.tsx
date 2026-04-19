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
    <div className="-ml-3 md:-ml-2">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 16 }}>
          <defs>
            <linearGradient id="bal-standard" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0e0f0c" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#0e0f0c" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="bal-pslf" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#9fe870" stopOpacity={0.35} />
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
            width={56}
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
          <Area
            type="monotone"
            dataKey="standard"
            stroke="#0e0f0c"
            strokeWidth={2.5}
            fill="url(#bal-standard)"
            activeDot={{ r: 5, fill: '#0e0f0c', stroke: '#fff', strokeWidth: 2 }}
            name="standard"
          />
          {hasPslf && (
            <Area
              type="monotone"
              dataKey="pslf"
              stroke="#163300"
              strokeWidth={3}
              fill="url(#bal-pslf)"
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
