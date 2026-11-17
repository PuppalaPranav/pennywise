import { useEffect, useState } from 'react'
import { HashRouter, NavLink, Route, Routes } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Target, Settings as Cog, Wallet } from 'lucide-react'
import { useStore } from './lib/store'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Goals from './pages/Goals'
import Settings from './pages/Settings'

const nav = [['/', 'Dashboard', LayoutDashboard], ['/transactions', 'Transactions', ArrowLeftRight], ['/budgets', 'Budgets', PiggyBank], ['/goals', 'Goals', Target], ['/settings', 'Settings', Cog]] as const
export default function App() {
  const theme = useStore((s) => s.theme)
  const [ready, setReady] = useState(useStore.persist.hasHydrated())
  useEffect(() => useStore.persist.onFinishHydration(() => setReady(true)), [])
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark') }, [theme])
  if (!ready) return <p className="p-8 text-sm text-slate-500">Loading…</p>
  return (
    <HashRouter>
      <aside className="fixed inset-y-0 hidden w-60 flex-col gap-1 border-r p-4 glass md:flex">
        <div className="mb-6 flex items-center gap-2 px-2 text-lg font-semibold"><Wallet className="text-emerald-600" />PennyWise</div>
        {nav.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive ? 'bg-emerald-500/15 font-medium text-emerald-700 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800'}`}><Icon size={18} />{label}</NavLink>)}
      </aside>
      <main className="mx-auto max-w-6xl p-4 pb-24 md:ml-60 md:p-8">
        <Routes><Route path="/" element={<Dashboard />} /><Route path="/transactions" element={<Transactions />} /><Route path="/budgets" element={<Budgets />} /><Route path="/goals" element={<Goals />} /><Route path="/settings" element={<Settings />} /></Routes>
      </main>
      <nav className="fixed inset-x-0 bottom-0 flex justify-around border-t py-2 glass md:hidden">
        {nav.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} aria-label={label} className={({ isActive }) => `p-2 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}><Icon size={22} /></NavLink>)}
      </nav>
    </HashRouter>
  )
}
