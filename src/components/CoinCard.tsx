import { Link } from 'react-router-dom'
import type { Coin } from '../types/crypto'

interface Props {
  coin: Coin
  logoUrl?: string
}

function formatPrice(price: number): string {
  if (price >= 1) return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
  return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 4 })
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toLocaleString()}`
}

function PctChange({ value }: { value: number }) {
  const positive = value >= 0
  return (
    <span className={`font-mono text-xs font-semibold ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
      {positive ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
    </span>
  )
}

export default function CoinCard({ coin, logoUrl }: Props) {
  const q = coin.quote.USD
  return (
    <Link to={`/coin/${coin.id}`}>
      <div className="card-glow group relative bg-white dark:bg-slate-900/80 border border-violet-100 dark:border-violet-900/40 hover:border-violet-400 dark:hover:border-violet-500/70 rounded-2xl p-4 cursor-pointer flex flex-col gap-3 overflow-hidden shadow-[0_4px_16px_rgba(139,92,246,0.15)] hover:shadow-[0_8px_32px_rgba(139,92,246,0.28)] dark:shadow-[0_2px_12px_rgba(139,92,246,0.08)] dark:hover:shadow-[0_4px_24px_rgba(139,92,246,0.25)] transition-shadow">
        {/* Top shimmer line on hover */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 dark:via-cyan-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={coin.name} className="w-9 h-9 rounded-xl" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
              {coin.symbol.slice(0, 2)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm">{coin.name}</span>
              <span className="text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800/50 px-1.5 py-0.5 rounded font-mono leading-none">{coin.symbol}</span>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">#{coin.cmc_rank}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-slate-900 dark:text-slate-100 font-semibold font-mono text-sm">{formatPrice(q.price)}</div>
            <PctChange value={q.percent_change_24h} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 text-center border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
          <div>
            <div className="text-slate-400 dark:text-slate-600 text-xs mb-0.5 uppercase tracking-wider font-mono">1h</div>
            <PctChange value={q.percent_change_1h} />
          </div>
          <div>
            <div className="text-slate-400 dark:text-slate-600 text-xs mb-0.5 uppercase tracking-wider font-mono">7d</div>
            <PctChange value={q.percent_change_7d} />
          </div>
          <div>
            <div className="text-slate-400 dark:text-slate-600 text-xs mb-0.5 uppercase tracking-wider font-mono">MCap</div>
            <div className="text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold">{formatMarketCap(q.market_cap)}</div>
          </div>
        </div>
      </div>
    </Link>
  )
}

