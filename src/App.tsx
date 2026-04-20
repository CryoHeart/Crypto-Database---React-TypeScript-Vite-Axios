import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import CoinDetail from './pages/CoinDetail'
import Compare from './pages/Compare'

function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 grid-bg">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/coin/:id" element={<CoinDetail />} />
              <Route path="/compare" element={<Compare />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </ThemeProvider>
  )
}

export default App
