import { useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { INCOME_CATS, METHODS, txSchema, useCats, useStore, type Tx } from '../lib/store'
import { inr, today } from '../lib/format'

const blank = { type: 'expense', amount: '', category: 'Food', description: '', date: today(), method: 'UPI', note: '' }
export default function Transactions() {
  const { txs, addTx, updateTx, delTx } = useStore()
  const cats = useCats()
  const [f, setF] = useState<Record<string, string>>(blank)
  const [editId, setEditId] = useState<string | null>(null)
  const [err, setErr] = useState('')
  const [q, setQ] = useState(''); const [ft, setFt] = useState('all'); const [fc, setFc] = useState('all'); const [sort, setSort] = useState('date')
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }))
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const r = txSchema.safeParse({ ...f, amount: f.amount === '' ? undefined : Number(f.amount) })
    if (!r.success) return setErr(r.error.issues[0].message)
    editId ? updateTx(editId, r.data) : addTx(r.data)
    setF({ ...blank, type: f.type, date: f.date }); setEditId(null); setErr('')
  }
  const edit = (t: Tx) => { setEditId(t.id); setF({ ...t, amount: String(t.amount), note: t.note ?? '' }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const list = useMemo(() => txs
    .filter((t) => (ft === 'all' || t.type === ft) && (fc === 'all' || t.category === fc) && `${t.description} ${t.note}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (sort === 'amount' ? b.amount - a.amount : b.date.localeCompare(a.date))), [txs, q, ft, fc, sort])
  const options = f.type === 'income' ? INCOME_CATS.concat(cats.filter((c) => !INCOME_CATS.includes(c) && !['Food','Shopping','Transportation','Education','Entertainment','Healthcare','Bills','Rent','Travel','Subscriptions'].includes(c))) : cats
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <form onSubmit={submit} className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select className="input" value={f.type} onChange={(e) => { set('type', e.target.value); set('category', e.target.value === 'income' ? 'Salary' : 'Food') }}><option value="expense">Expense</option><option value="income">Income</option></select>
        <input className="input" type="number" step="0.01" placeholder="Amount (₹)" value={f.amount} onChange={(e) => set('amount', e.target.value)} />
        <select className="input" value={f.category} onChange={(e) => set('category', e.target.value)}>{options.map((c) => <option key={c}>{c}</option>)}</select>
        <input className="input" type="date" value={f.date} onChange={(e) => set('date', e.target.value)} />
        <input className="input sm:col-span-2" placeholder="Description" value={f.description} onChange={(e) => set('description', e.target.value)} />
        <select className="input" value={f.method} onChange={(e) => set('method', e.target.value)}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select>
        <input className="input" placeholder="Note (optional)" value={f.note} onChange={(e) => set('note', e.target.value)} />
        <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4"><button className="btn">{editId ? 'Save changes' : 'Add transaction'}</button>{editId && <button type="button" className="btn-ghost" onClick={() => { setEditId(null); setF(blank) }}>Cancel</button>}<span className="text-sm text-rose-500">{err}</span></div>
      </form>
      <div className="flex flex-wrap gap-2">
        <input className="input !w-56" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input !w-auto" value={ft} onChange={(e) => setFt(e.target.value)}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expense</option></select>
        <select className="input !w-auto" value={fc} onChange={(e) => setFc(e.target.value)}><option value="all">All categories</option>{cats.map((c) => <option key={c}>{c}</option>)}</select>
        <select className="input !w-auto" value={sort} onChange={(e) => setSort(e.target.value)}><option value="date">Newest first</option><option value="amount">Highest amount</option></select>
      </div>
      <div className="card !p-2">
        {list.length === 0 && <p className="p-8 text-center text-sm text-slate-500">{txs.length ? 'No transactions match your filters.' : 'No transactions yet. Add your first one above.'}</p>}
        {list.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-neutral-800/50">
            <div className="min-w-0"><p className="truncate font-medium">{t.description}</p><p className="text-xs text-slate-400">{t.category} · {t.method} · {t.date}</p></div>
            <div className="flex items-center gap-1"><b className={t.type === 'income' ? 'text-emerald-600' : ''}>{t.type === 'income' ? '+' : '-'}{inr(t.amount)}</b>
              <button className="btn-ghost" aria-label="Edit" onClick={() => edit(t)}><Pencil size={15} /></button>
              <button className="btn-ghost" aria-label="Delete" onClick={() => confirm('Delete this transaction?') && delTx(t.id)}><Trash2 size={15} /></button></div>
          </div>))}
      </div>
    </div>
  )
}
