import { useState, useEffect, useCallback, useRef } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { getListings, getCoinInfo } from '../services/api'
import type { Coin, CoinInfo } from '../types/crypto'
import { useTheme } from '../context/ThemeContext'

const MAX_COINS = 4

const COIN_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981']

const TIME_KEYS = [
  'percent_change_1h',
  'percent_change_24h',
  'percent_change_7d',
  'percent_change_30d',
  'percent_change_60d',
  'percent_change_90d',
] as const

const TIME_OFFSETS_MS = [
  1 * 60 * 60 * 1000,
  24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  30 * 24 * 60 * 60 * 1000,
  60 * 24 * 60 * 60 * 1000,
  90 * 24 * 60 * 60 * 1000,
]

const TIME_PERIOD_LABELS = ['1h', '24h', '7d', '30d', '60d', '90d']

function getDateLabel(offsetMs: number): string {
  const d = new Date(Date.now() - offsetMs)
  if (offsetMs <= 24 * 60 * 60 * 1000) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function buildChartData(coins: Coin[]) {
  return [...TIME_OFFSETS_MS].reverse().map((offsetMs, i) => {
    const originalIdx = TIME_OFFSETS_MS.length - 1 - i
    const point: Record<string, number | string> = {
      label: getDateLabel(offsetMs),
      period: TIME_PERIOD_LABELS[originalIdx],
    }
    coins.forEach((coin) => {
      point[coin.symbol] = coin.quote.USD[TIME_KEYS[originalIdx]]
    })
    return point
  })
}

interface TimelineChartProps {
  coins: Coin[]
  logos: Record<number, string>
}

function TimelineChart({ coins, logos }: TimelineChartProps) {
  const { dark } = useTheme()
  const data = buildChartData(coins)

  const gridColor = dark ? '#1e293b' : '#e2e8f0'
  const axisColor = dark ? '#64748b' : '#94a3b8'
  const tooltipBg = dark ? '#0f172a' : '#ffffff'
  const tooltipBorder = dark ? '#1e293b' : '#e2e8f0'
  const labelColor = dark ? '#e2e8f0' : '#1e293b'

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-violet-100 dark:border-violet-900/40 rounded-2xl p-5 mb-6 shadow-[0_4px_24px_rgba(139,92,246,0.08)]">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-px w-4 bg-gradient-to-r from-violet-600 to-cyan-500" />
        <h3 className="font-orbitron text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
          Performance Timeline
        </h3>
      </div>
      <p className="text-xs font-mono text-slate-400 dark:text-slate-600 mb-5 ml-6">
        % price change across time periods
      </p>

      {/* Coin legend with logos */}
      <div className="flex flex-wrap gap-5 mb-4 ml-1">
        {coins.map((coin, i) => (
          <div key={coin.id} className="flex items-center gap-1.5">
            <span className="inline-block w-6 h-0.5 rounded-full" style={{ backgroundColor: COIN_COLORS[i] }} />
            {logos[coin.id] ? (
              <img src={logos[coin.id]} alt={coin.name} className="w-4 h-4 rounded" />
            ) : null}
            <span className="text-xs font-mono font-semibold" style={{ color: COIN_COLORS[i] }}>
              {coin.symbol}
            </span>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-600">{coin.name}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="label"
            tick={{ fill: axisColor, fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={40}
          />
          <YAxis
            tick={{ fill: axisColor, fontSize: 11 }}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 12,
              boxShadow: dark
                ? '0 0 20px rgba(139,92,246,0.2)'
                : '0 4px 20px rgba(0,0,0,0.08)',
              fontFamily: 'monospace',
            }}
            labelStyle={{ color: labelColor, fontWeight: 600, fontSize: 12, marginBottom: 4 }}
            itemStyle={{ fontSize: 12 }}
            formatter={(value, name) => [
              `${(value as number) >= 0 ? '+' : ''}${(value as number).toFixed(2)}%`,
              name,
            ]}
            labelFormatter={(label, payload) => {
              if (!payload || payload.length === 0) return label
              const period = (payload[0]?.payload as Record<string, string>)?.period ?? ''
              return `${period} ago · ${label}`
            }}
          />
          <ReferenceLine y={0} stroke={dark ? '#334155' : '#cbd5e1'} strokeDasharray="4 2" />
          <Legend content={() => null} />
          {coins.map((coin, i) => (
            <Line
              key={coin.id}
              type="monotone"
              dataKey={coin.symbol}
              stroke={COIN_COLORS[i]}
              strokeWidth={2.5}
              dot={{ r: 4, fill: COIN_COLORS[i], strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function formatPrice(price: number): string {
  if (price >= 1)
    return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
  return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 4 })
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toLocaleString()}`
}

function formatSupply(value: number | null): string {
  if (value === null) return '∞'
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
  return value.toLocaleString()
}

function PctChange({ value }: { value: number }) {
  const positive = value >= 0
  return (
    <span className={`font-mono text-sm font-semibold ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
      {positive ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
    </span>
  )
}

function BestBadge() {
  return (
    <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/60 leading-none align-middle">
      BEST
    </span>
  )
}

interface CoinSelectorProps {
  allCoins: Coin[]
  logos: Record<number, string>
  selected: Coin[]
  onAdd: (coin: Coin) => void
}

function CoinSelector({ allCoins, logos, selected, onAdd }: CoinSelectorProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedIds = new Set(selected.map((c) => c.id))
  const filtered = allCoins
    .filter(
      (c) =>
        !selectedIds.has(c.id) &&
        (c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.symbol.toLowerCase().includes(query.toLowerCase())),
    )
    .slice(0, 12)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold shadow-lg shadow-violet-500/30 transition-colors"
      >
        <span className="text-lg leading-none">+</span> Add Coin
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 w-64 bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-800/60 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search coins…"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-violet-400 dark:focus:border-violet-500 transition-colors"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm font-mono text-slate-400 dark:text-slate-600">No results</li>
            ) : (
              filtered.map((coin) => (
                <li key={coin.id}>
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors text-left"
                    onClick={() => { onAdd(coin); setOpen(false); setQuery('') }}
                  >
                    {logos[coin.id] ? (
                      <img src={logos[coin.id]} alt={coin.name} className="w-6 h-6 rounded-lg shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                        {coin.symbol.slice(0, 2)}
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{coin.name}</span>
                    <span className="ml-auto text-xs font-mono text-violet-500 dark:text-violet-400 shrink-0">{coin.symbol}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

const ROWS: { label: string; key: string; format: (coin: Coin) => React.ReactNode; higherIsBetter?: boolean; lowerIsBetter?: boolean; numericValue?: (coin: Coin) => number }[] = [
  {
    label: 'Price',
    key: 'price',
    format: (c) => <span className="font-mono">{formatPrice(c.quote.USD.price)}</span>,
    higherIsBetter: true,
    numericValue: (c) => c.quote.USD.price,
  },
  {
    label: '1h Change',
    key: 'pct1h',
    format: (c) => <PctChange value={c.quote.USD.percent_change_1h} />,
    higherIsBetter: true,
    numericValue: (c) => c.quote.USD.percent_change_1h,
  },
  {
    label: '24h Change',
    key: 'pct24h',
    format: (c) => <PctChange value={c.quote.USD.percent_change_24h} />,
    higherIsBetter: true,
    numericValue: (c) => c.quote.USD.percent_change_24h,
  },
  {
    label: '7d Change',
    key: 'pct7d',
    format: (c) => <PctChange value={c.quote.USD.percent_change_7d} />,
    higherIsBetter: true,
    numericValue: (c) => c.quote.USD.percent_change_7d,
  },
  {
    label: '30d Change',
    key: 'pct30d',
    format: (c) => <PctChange value={c.quote.USD.percent_change_30d} />,
    higherIsBetter: true,
    numericValue: (c) => c.quote.USD.percent_change_30d,
  },
  {
    label: 'Market Cap',
    key: 'mcap',
    format: (c) => <span className="font-mono">{formatMarketCap(c.quote.USD.market_cap)}</span>,
    higherIsBetter: true,
    numericValue: (c) => c.quote.USD.market_cap,
  },
  {
    label: '24h Volume',
    key: 'vol',
    format: (c) => <span className="font-mono">{formatMarketCap(c.quote.USD.volume_24h)}</span>,
    higherIsBetter: true,
    numericValue: (c) => c.quote.USD.volume_24h,
  },
  {
    label: 'CMC Rank',
    key: 'rank',
    format: (c) => <span className="font-mono">#{c.cmc_rank}</span>,
    lowerIsBetter: true,
    numericValue: (c) => c.cmc_rank,
  },
  {
    label: 'Circulating Supply',
    key: 'circsupply',
    format: (c) => <span className="font-mono">{formatSupply(c.circulating_supply)}</span>,
  },
  {
    label: 'Total Supply',
    key: 'totalsupply',
    format: (c) => <span className="font-mono">{formatSupply(c.total_supply)}</span>,
  },
  {
    label: 'Max Supply',
    key: 'maxsupply',
    format: (c) => <span className="font-mono">{formatSupply(c.max_supply)}</span>,
  },
  {
    label: 'Market Pairs',
    key: 'pairs',
    format: (c) => <span className="font-mono">{c.num_market_pairs.toLocaleString()}</span>,
    higherIsBetter: true,
    numericValue: (c) => c.num_market_pairs,
  },
]

export default function Compare() {
  const [allCoins, setAllCoins] = useState<Coin[]>([])
  const [logos, setLogos] = useState<Record<number, string>>({})
  const [selected, setSelected] = useState<Coin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const listings = await getListings(100)
      setAllCoins(listings.data)
      const ids = listings.data.slice(0, 100).map((c) => c.id)
      const info = await getCoinInfo(ids)
      const logoMap: Record<number, string> = {}
      Object.values(info.data as Record<string, CoinInfo>).forEach((ci) => {
        logoMap[ci.id] = ci.logo
      })
      setLogos(logoMap)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const addCoin = (coin: Coin) => {
    if (selected.length < MAX_COINS && !selected.find((c) => c.id === coin.id)) {
      setSelected((prev) => [...prev, coin])
    }
  }

  const removeCoin = (id: number) => setSelected((prev) => prev.filter((c) => c.id !== id))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px w-8 bg-gradient-to-r from-violet-600 to-cyan-500" />
            <span className="font-mono text-xs tracking-widest text-violet-600 dark:text-violet-400 uppercase">Side-by-Side</span>
          </div>
          <h1 className="font-orbitron text-2xl font-bold text-slate-900 dark:text-slate-100">
            Compare <span className="gradient-text">Coins</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-1.5">
            Select up to {MAX_COINS} coins to compare metrics side-by-side
          </p>
        </div>

        {!loading && (
          <div className="flex items-center gap-3">
            {selected.length < MAX_COINS && (
              <CoinSelector allCoins={allCoins} logos={logos} selected={selected} onAdd={addCoin} />
            )}
            {selected.length > 0 && (
              <button
                onClick={() => setSelected([])}
                className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800/60 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-sm font-semibold transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl p-4 text-rose-600 dark:text-rose-400 mb-6 text-sm font-mono">
          ⚠ {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900/60 border border-violet-100 dark:border-violet-900/30 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      ) : selected.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-violet-200 dark:border-violet-800/50 flex items-center justify-center text-4xl">
            ⇌
          </div>
          <div className="text-center">
            <div className="font-orbitron font-bold text-slate-700 dark:text-slate-300 text-lg mb-1">No coins selected</div>
            <div className="text-sm font-mono text-slate-400 dark:text-slate-600">Click "Add Coin" to start comparing</div>
          </div>
          <CoinSelector allCoins={allCoins} logos={logos} selected={selected} onAdd={addCoin} />
        </div>
      ) : (
        <>
        <TimelineChart coins={selected} logos={logos} />
        <div className="overflow-x-auto rounded-2xl border border-violet-100 dark:border-violet-900/40 shadow-[0_4px_24px_rgba(139,92,246,0.1)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80">
                <th className="text-left px-5 py-4 text-xs font-mono text-slate-400 dark:text-slate-600 tracking-widest uppercase w-36 border-b border-slate-100 dark:border-slate-800">
                  Metric
                </th>
                {selected.map((coin) => (
                  <th key={coin.id} className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 min-w-[160px]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        {logos[coin.id] ? (
                          <img src={logos[coin.id]} alt={coin.name} className="w-10 h-10 rounded-xl" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                            {coin.symbol.slice(0, 2)}
                          </div>
                        )}
                        <button
                          onClick={() => removeCoin(coin.id)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] leading-none flex items-center justify-center hover:bg-rose-600 transition-colors"
                          aria-label={`Remove ${coin.name}`}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{coin.name}</div>
                        <div className="text-xs font-mono text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800/50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          {coin.symbol}
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, rowIdx) => {
                // Determine the best value index for this row
                let bestIdx = -1
                if (row.numericValue && selected.length > 1) {
                  const values = selected.map(row.numericValue)
                  if (row.higherIsBetter) {
                    bestIdx = values.indexOf(Math.max(...values))
                  } else if (row.lowerIsBetter) {
                    bestIdx = values.indexOf(Math.min(...values))
                  }
                }

                return (
                  <tr
                    key={row.key}
                    className={`border-b border-slate-50 dark:border-slate-800/60 ${rowIdx % 2 === 0 ? 'bg-white dark:bg-slate-950/30' : 'bg-slate-50/60 dark:bg-slate-900/20'} hover:bg-violet-50/40 dark:hover:bg-violet-900/10 transition-colors`}
                  >
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-500 dark:text-slate-500 tracking-wider uppercase">
                      {row.label}
                    </td>
                    {selected.map((coin, coinIdx) => (
                      <td key={coin.id} className={`px-5 py-3.5 text-center ${bestIdx === coinIdx ? 'bg-emerald-50/60 dark:bg-emerald-900/10' : ''}`}>
                        <span>
                          {row.format(coin)}
                          {bestIdx === coinIdx && <BestBadge />}
                        </span>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  )
}
