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
  /**
   * Optional: ignored visually right now (height steps live in CSS) but
   * kept so callers can self-document the intended desktop size and we
   * have a single tunable in case we add a CSS-var path later.
   */
  heightDesktop?: number;
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
    <div className="-ml-3 md:-ml-2 h-[280px] md:h-[340px] lg:h-[380px] xl:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 22 }}>
          <defs>
            <linearGradient id="bal-standard" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0e0f0c" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#0e0f0c" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="bal-pslf" x1="0" x2="0" y1="0" y2="1">
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
            tickMargin={10}
            label={{
              value: 'YEARS FROM NOW',
              position: 'insideBottom',
              offset: -12,
              fontSize: 10,
              fill: '#868685',
              fontWeight: 700,
              letterSpacing: '0.14em',
            }}
          />
          <YAxis
            tickFormatter={fmtY}
            tick={{ fontSize: 11, fill: '#868685', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={60}
            tickMargin={6}
          />
          <Tooltip
            formatter={(v, name) => [fmtTip(v), name === 'standard' ? 'Standard' : 'PSLF']}
            labelFormatter={(l) => `Year ${l}`}
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
            cursor={{ stroke: 'rgba(14,15,12,0.22)', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          {hasPslf && (
            <Legend
              verticalAlign="top"
              align="right"
              height={32}
              iconType="circle"
              iconSize={9}
              wrapperStyle={{
                fontSize: 11,
                fontWeight: 700,
                paddingBottom: 6,
                letterSpacing: '0.04em',
              }}
              formatter={(v) => (v === 'standard' ? 'Standard' : 'PSLF')}
            />
          )}
          <ReferenceLine
            x={residencyYears}
            stroke="#0e0f0c"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
            label={{
              value: 'Attending starts',
              position: 'insideTopRight',
              fontSize: 10,
              fill: '#0e0f0c',
              fontWeight: 700,
              offset: 8,
            }}
          />
          <Area
            type="monotone"
            dataKey="standard"
            stroke="#0e0f0c"
            strokeWidth={2.75}
            fill="url(#bal-standard)"
            activeDot={{ r: 6, fill: '#0e0f0c', stroke: '#fff', strokeWidth: 2.5 }}
            name="standard"
          />
          {hasPslf && (
            <Area
              type="monotone"
              dataKey="pslf"
              stroke="#163300"
              strokeWidth={3.25}
              fill="url(#bal-pslf)"
              activeDot={{ r: 6, fill: '#163300', stroke: '#fff', strokeWidth: 2.5 }}
              name="pslf"
              connectNulls
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
