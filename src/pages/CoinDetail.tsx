import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCoinInfo, getCoinQuote } from '../services/api'
import type { Coin, CoinInfo } from '../types/crypto'
import PriceChangeChart from '../components/PriceChangeChart'

const REFRESH_INTERVAL = 30_000

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-slate-900/80 border border-violet-100 dark:border-violet-900/40 rounded-xl p-3.5">
      <div className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="font-mono font-semibold text-sm text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-px w-4 bg-gradient-to-r from-violet-600 to-cyan-500" />
      <span className="font-orbitron text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest">{children}</span>
    </div>
  )
}

function formatNum(n: number | null, prefix = ''): string {
  if (n == null) return '∞'
  if (n >= 1e12) return `${prefix}${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `${prefix}${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${prefix}${(n / 1e6).toFixed(2)}M`
  return `${prefix}${n.toLocaleString()}`
}

function formatPrice(price: number): string {
  if (price >= 1) return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
  return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 4 })
}

export default function CoinDetail() {
  const { id } = useParams<{ id: string }>()
  const [coin, setCoin] = useState<Coin | null>(null)
  const [info, setInfo] = useState<CoinInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) return
    try {
      const [quoteRes, infoRes] = await Promise.all([getCoinQuote([+id]), getCoinInfo([+id])])
      setCoin(quoteRes.data[id])
      setInfo(infoRes.data[id])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load coin data'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <div className="h-8 w-32 bg-violet-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-40 bg-white dark:bg-slate-900 border border-violet-100 dark:border-violet-900/30 rounded-2xl animate-pulse" />
        <div className="h-64 bg-white dark:bg-slate-900 border border-violet-100 dark:border-violet-900/30 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (error || !coin || !info) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl p-4 text-rose-600 dark:text-rose-400 text-sm font-mono">
          ⚠ {error ?? 'Coin not found.'}
        </div>
        <Link to="/" className="inline-block text-violet-600 dark:text-violet-400 hover:underline text-sm font-mono">← Back to list</Link>
      </div>
    )
  }

  const q = coin.quote.USD
  const pctPositive = q.percent_change_24h >= 0

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 text-sm font-mono transition-colors">
        ← Back to list
      </Link>

      {/* Header card */}
      <div className="bg-white dark:bg-slate-900/80 border border-violet-100 dark:border-violet-900/40 rounded-2xl p-6">
        <div className="flex items-start gap-4 flex-wrap">
          {info.logo && (
            <img src={info.logo} alt={info.name} className="w-14 h-14 rounded-2xl shadow-lg shadow-violet-500/20" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="font-orbitron text-2xl font-bold text-slate-900 dark:text-slate-100">{info.name}</h1>
              <span className="font-mono text-sm text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800/50 px-2 py-0.5 rounded">{coin.symbol}</span>
              <span className="font-mono text-sm text-slate-400 dark:text-slate-500">Rank #{coin.cmc_rank}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100">{formatPrice(q.price)}</span>
              <span className={`font-mono font-semibold text-base ${pctPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                {pctPositive ? '▲' : '▼'} {Math.abs(q.percent_change_24h).toFixed(2)}% (24h)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div>
        <SectionLabel>Statistics</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatBox label="Market Cap" value={formatNum(q.market_cap, '$')} />
          <StatBox label="Volume (24h)" value={formatNum(q.volume_24h, '$')} />
          <StatBox label="Circ. Supply" value={`${formatNum(coin.circulating_supply)} ${coin.symbol}`} />
          <StatBox label="Max Supply" value={coin.max_supply ? `${formatNum(coin.max_supply)} ${coin.symbol}` : '∞'} />
          <StatBox label="MCap Dom." value={`${q.market_cap_dominance.toFixed(2)}%`} />
          <StatBox label="FD Mkt Cap" value={formatNum(q.fully_diluted_market_cap, '$')} />
          <StatBox label="Vol. Change 24h" value={`${q.volume_change_24h.toFixed(2)}%`} />
          <StatBox label="Market Pairs" value={coin.num_market_pairs.toLocaleString()} />
        </div>
      </div>

      {/* Chart */}
      <PriceChangeChart quote={q} name={info.name} />

      {/* Description */}
      {info.description && (
        <div className="bg-white dark:bg-slate-900/80 border border-violet-100 dark:border-violet-900/40 rounded-2xl p-5">
          <SectionLabel>About {info.name}</SectionLabel>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{info.description}</p>
        </div>
      )}

      {/* Links */}
      <div className="bg-white dark:bg-slate-900/80 border border-violet-100 dark:border-violet-900/40 rounded-2xl p-5">
        <SectionLabel>Links</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {info.urls.website?.[0] && (
            <a href={info.urls.website[0]} target="_blank" rel="noopener noreferrer"
              className="bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-800/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50 text-xs px-3 py-1.5 rounded-lg transition font-mono">
              Website ↗
            </a>
          )}
          {info.urls.twitter?.[0] && (
            <a href={info.urls.twitter[0]} target="_blank" rel="noopener noreferrer"
              className="bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-800/40 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50 text-xs px-3 py-1.5 rounded-lg transition font-mono">
              Twitter ↗
            </a>
          )}
          {info.urls.reddit?.[0] && (
            <a href={info.urls.reddit[0]} target="_blank" rel="noopener noreferrer"
              className="bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-800/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50 text-xs px-3 py-1.5 rounded-lg transition font-mono">
              Reddit ↗
            </a>
          )}
          {info.urls.source_code?.[0] && (
            <a href={info.urls.source_code[0]} target="_blank" rel="noopener noreferrer"
              className="bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs px-3 py-1.5 rounded-lg transition font-mono">
              Source Code ↗
            </a>
          )}
          {info.urls.technical_doc?.[0] && (
            <a href={info.urls.technical_doc[0]} target="_blank" rel="noopener noreferrer"
              className="bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs px-3 py-1.5 rounded-lg transition font-mono">
              Whitepaper ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

