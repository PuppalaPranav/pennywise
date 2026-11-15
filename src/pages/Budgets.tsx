import { useMemo } from 'react'
import { DEFAULT_CATEGORIES, INCOME_CATS, useCats, useStore } from '../lib/store'
import { inr } from '../lib/format'

function Meter({ spent, limit }: { spent: number; limit: number }) {
  const p = limit > 0 ? (spent / limit) * 100 : 0
  const over = p > 100
  return <div><div className="bar"><div className={`h-full transition-all ${over ? 'bg-rose-500' : p > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(p, 100)}%` }} /></div>
    <p className={`mt-1 text-xs ${over ? 'text-rose-500' : p > 80 ? 'text-amber-600' : 'text-slate-500'}`}>{over ? `Over by ${inr(spent - limit)}` : p > 80 ? `Warning: ${Math.round(p)}% used · ${inr(limit - spent)} left` : `${inr(limit - spent)} left`}</p></div>
}
export default function Budgets() {
  const { txs, month, budget, setBudget, setMonth } = useStore()
  const cats = useCats().filter((c) => !INCOME_CATS.includes(c) || (DEFAULT_CATEGORIES.includes(c) ? c === 'Other' : true))
  const spent = useMemo(() => { const m: Record<string, number> = {}; txs.filter((t) => t.type === 'expense' && t.date.startsWith(month)).forEach((t) => (m[t.category] = (m[t.category] || 0) + t.amount)); return m }, [txs, month])
  const total = Object.values(spent).reduce((a, b) => a + b, 0)
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">Budgets</h1><input type="month" className="input !w-auto" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} /></div>
      <div className="card space-y-3"><label className="text-sm font-medium">Overall monthly budget (₹)</label>
        <input className="input !w-48" type="number" min="0" value={budget.overall || ''} onChange={(e) => setBudget({ ...budget, overall: Math.max(0, Number(e.target.value)) })} />
        {budget.overall > 0 && <Meter spent={total} limit={budget.overall} />}</div>
      <div className="grid gap-4 md:grid-cols-2">
        {cats.map((c) => (
          <div key={c} className="card space-y-2"><div className="flex items-center justify-between"><span className="font-medium">{c}</span><span className="text-xs text-slate-500">Spent {inr(spent[c] || 0)}</span></div>
            <input className="input" type="number" min="0" placeholder="Limit (₹)" value={budget.cats[c] || ''} onChange={(e) => setBudget({ ...budget, cats: { ...budget.cats, [c]: Math.max(0, Number(e.target.value)) } })} />
            {budget.cats[c] > 0 && <Meter spent={spent[c] || 0} limit={budget.cats[c]} />}</div>))}
      </div>
    </div>
  )
}
