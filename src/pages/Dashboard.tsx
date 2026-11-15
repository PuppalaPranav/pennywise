import { useMemo } from 'react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { getDaysInMonth, parseISO, format } from 'date-fns'
import { useStore } from '../lib/store'
import { inr } from '../lib/format'

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#8b5cf6']
const Stat = ({ label, value, tone = '' }: { label: string; value: string; tone?: string }) => (
  <div className="card"><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p></div>
)
export default function Dashboard() {
  const { txs, month, setMonth, budget } = useStore()
  const d = useMemo(() => {
    const balance = txs.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0)
    const m = txs.filter((t) => t.date.startsWith(month))
    const income = m.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = m.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const daily = Array.from({ length: getDaysInMonth(parseISO(month + '-01')) }, (_, i) => ({ day: i + 1, amount: 0 }))
    const cat: Record<string, number> = {}
    m.filter((t) => t.type === 'expense').forEach((t) => { daily[+t.date.slice(8) - 1].amount += t.amount; cat[t.category] = (cat[t.category] || 0) + t.amount })
    const cats = Object.entries(cat).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    const recent = [...m].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)
    return { balance, income, expense, daily, cats, recent, saved: income - expense }
  }, [txs, month])
  const pct = d.income > 0 ? Math.round((d.saved / d.income) * 100) : 0
  const used = budget.overall > 0 ? (d.expense / budget.overall) * 100 : 0
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">Dashboard</h1><input type="month" className="input !w-auto" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Available balance" value={inr(d.balance)} />
        <Stat label="Income" value={inr(d.income)} tone="text-emerald-600" />
        <Stat label="Expenses" value={inr(d.expense)} tone="text-rose-500" />
        <Stat label="Savings" value={inr(d.saved)} tone={d.saved < 0 ? 'text-rose-500' : ''} />
        <Stat label="Savings rate" value={`${pct}%`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2"><h2 className="mb-3 font-medium">Daily spending</h2>
          <ResponsiveContainer width="100%" height={220}><BarChart data={d.daily}><XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} /><Tooltip formatter={(v) => inr(Number(v))} labelFormatter={(l) => `Day ${l}`} /><Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        <div className="card"><h2 className="mb-3 font-medium">By category</h2>
          {d.cats.length ? <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={d.cats} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>{d.cats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v) => inr(Number(v))} /></PieChart></ResponsiveContainer> : <p className="py-16 text-center text-sm text-slate-500">No expenses this month.</p>}</div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card"><h2 className="mb-3 font-medium">Budget utilization</h2>
          {budget.overall > 0 ? <><div className="bar"><div className={`h-full ${used > 100 ? 'bg-rose-500' : used > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(used, 100)}%` }} /></div><p className="mt-2 text-sm text-slate-500">{inr(d.expense)} of {inr(budget.overall)} ({Math.round(used)}%)</p></> : <p className="text-sm text-slate-500">Set a monthly budget in Budgets.</p>}</div>
        <div className="card lg:col-span-2"><h2 className="mb-3 font-medium">Recent transactions</h2>
          {d.recent.length ? d.recent.map((t) => <div key={t.id} className="flex justify-between border-b border-slate-100 py-2 text-sm last:border-0 dark:border-neutral-800"><span>{t.description}<span className="ml-2 text-xs text-slate-400">{t.category} · {format(parseISO(t.date), 'd MMM')}</span></span><b className={t.type === 'income' ? 'text-emerald-600' : ''}>{t.type === 'income' ? '+' : '-'}{inr(t.amount)}</b></div>) : <p className="text-sm text-slate-500">Nothing yet — add your first transaction.</p>}</div>
      </div>
    </div>
  )
}
