import { useState, useEffect, useCallback } from 'react'
import { getListings, getCoinInfo } from '../services/api'
import type { Coin, CoinInfo } from '../types/crypto'
import CoinCard from '../components/CoinCard'
import SearchBar from '../components/SearchBar'

const REFRESH_INTERVAL = 60_000

function LivePulse() {
  return (
    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
      </span>
      LIVE
    </span>
  )
}

export default function Home() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [logos, setLogos] = useState<Record<number, string>>({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const listings = await getListings(100)
      setCoins(listings.data)
      setLastUpdated(new Date())
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
    const interval = setInterval(fetchData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchData])

  const filtered = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px w-8 bg-gradient-to-r from-violet-600 to-cyan-500" />
            <span className="font-mono text-xs tracking-widest text-violet-600 dark:text-violet-400 uppercase">Market Overview</span>
          </div>
          <h1 className="font-orbitron text-2xl font-bold text-slate-900 dark:text-slate-100">
            Top <span className="gradient-text">100</span> Crypto-currencies
          </h1>
          {lastUpdated && (
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-2">
              <LivePulse /> · {lastUpdated.toLocaleTimeString()} · refreshes every 60s
            </p>
          )}
        </div>
        <div className="w-full sm:w-72">
          <SearchBar value={search} onChange={setSearch} />
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl p-4 text-rose-600 dark:text-rose-400 mb-6 text-sm font-mono">
          ⚠ {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900/60 border border-violet-100 dark:border-violet-900/30 rounded-2xl p-4 h-[120px] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 font-mono text-slate-400 dark:text-slate-600">
          No coins match "<span className="text-violet-500">{search}</span>"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((coin) => (
            <CoinCard key={coin.id} coin={coin} logoUrl={logos[coin.id]} />
          ))}
        </div>
      )}
    </div>
  )
}

