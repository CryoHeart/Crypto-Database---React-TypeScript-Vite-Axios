import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { CoinQuote } from '../types/crypto'
import { useTheme } from '../context/ThemeContext'

interface Props {
  quote: CoinQuote
  name: string
}

export default function PriceChangeChart({ quote, name }: Props) {
  const { dark } = useTheme()

  const data = [
    { label: '1h', value: quote.percent_change_1h },
    { label: '24h', value: quote.percent_change_24h },
    { label: '7d', value: quote.percent_change_7d },
    { label: '30d', value: quote.percent_change_30d },
    { label: '60d', value: quote.percent_change_60d },
    { label: '90d', value: quote.percent_change_90d },
  ]

  const gridColor = dark ? '#1e293b' : '#e2e8f0'
  const axisColor = dark ? '#64748b' : '#94a3b8'
  const tooltipBg = dark ? '#0f172a' : '#ffffff'
  const tooltipBorder = dark ? '#1e293b' : '#e2e8f0'
  const labelColor = dark ? '#e2e8f0' : '#1e293b'

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-violet-100 dark:border-violet-900/40 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-px w-4 bg-gradient-to-r from-violet-600 to-cyan-500" />
        <h3 className="font-orbitron text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
          {name} — Price Change
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 11, fontFamily: 'Orbitron, monospace' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: axisColor, fontSize: 11 }}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 12,
              boxShadow: dark ? '0 0 20px rgba(139,92,246,0.2)' : '0 4px 20px rgba(0,0,0,0.08)',
              fontFamily: 'Orbitron, monospace',
            }}
            labelStyle={{ color: labelColor, fontWeight: 600, fontSize: 12 }}
            itemStyle={{ color: axisColor, fontSize: 12 }}
            formatter={(value) => [typeof value === 'number' ? `${value.toFixed(2)}%` : value, 'Change']}
          />
          <ReferenceLine y={0} stroke={dark ? '#334155' : '#cbd5e1'} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value >= 0 ? (dark ? '#34d399' : '#10b981') : (dark ? '#f87171' : '#ef4444')}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

