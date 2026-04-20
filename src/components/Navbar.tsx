import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export default function Navbar() {
  const { dark, toggle } = useTheme()
  const { pathname } = useLocation()
  const onComparePage = pathname === '/compare'

  return (
    <nav className="sticky top-0 z-50 bg-white/85 dark:bg-slate-950/90 backdrop-blur-md border-b border-violet-100 dark:border-violet-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
            <span className="text-white font-bold text-2xl leading-none">◈</span>
          </div>
          <div className="leading-none">
            <div className="font-orbitron font-black text-xl tracking-wide gradient-text uppercase">
              Cre-Age Corp
            </div>
            <div className="font-orbitron font-medium text-[11px] text-slate-400 dark:text-slate-500 tracking-[0.4em] uppercase mt-1">
              Crypto&nbsp;Scope
            </div>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            to={onComparePage ? '/' : '/compare'}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wider uppercase text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 border border-violet-200 dark:border-violet-800/50 hover:border-violet-400 dark:hover:border-violet-600 transition-all"
          >
            {onComparePage ? '← Home' : '⇌ Compare'}
          </Link>
          <span className="hidden sm:block text-xs font-mono text-slate-300 dark:text-slate-600 tracking-widest uppercase select-none">
            ⬡ CoinMarketCap
          </span>

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="w-9 h-9 rounded-xl border border-violet-200 dark:border-violet-800/60 bg-violet-50 dark:bg-slate-900 text-violet-600 dark:text-cyan-400 flex items-center justify-center hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-100 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </nav>
  )
}

