import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { differenceInDays, parseISO } from 'date-fns'
import { z } from 'zod'
import { useStore } from '../lib/store'
import { inr } from '../lib/format'

const schema = z.object({ name: z.string().trim().min(1, 'Name required').max(60), target: z.number().positive('Target must be > 0'), saved: z.number().min(0), date: z.string().min(1, 'Pick a target date') })
export default function Goals() {
  const { goals, saveGoal, delGoal, fund } = useStore()
  const [f, setF] = useState({ name: '', target: '', saved: '0', date: '' }); const [err, setErr] = useState('')
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const r = schema.safeParse({ ...f, target: Number(f.target), saved: Number(f.saved || 0) })
    if (!r.success) return setErr(r.error.issues[0].message)
    saveGoal(r.data); setF({ name: '', target: '', saved: '0', date: '' }); setErr('')
  }
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Savings goals</h1>
      <form onSubmit={submit} className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input className="input" placeholder="Goal name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className="input" type="number" placeholder="Target (₹)" value={f.target} onChange={(e) => setF({ ...f, target: e.target.value })} />
        <input className="input" type="number" placeholder="Saved so far" value={f.saved} onChange={(e) => setF({ ...f, saved: e.target.value })} />
        <input className="input" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        <button className="btn"><Plus size={16} />Create</button><p className="text-sm text-rose-500 sm:col-span-2 lg:col-span-5">{err}</p>
      </form>
      {goals.length === 0 && <p className="card text-center text-sm text-slate-500">No goals yet. Create one above to start tracking.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((g) => {
          const p = Math.min(100, (g.saved / g.target) * 100); const left = differenceInDays(parseISO(g.date), new Date())
          return (<div key={g.id} className="card space-y-3">
            <div className="flex justify-between"><h3 className="font-medium">{g.name}</h3><button className="btn-ghost" aria-label="Delete goal" onClick={() => confirm(`Delete "${g.name}"?`) && delGoal(g.id)}><Trash2 size={15} /></button></div>
            <div className="bar"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${p}%` }} /></div>
            <p className="text-sm text-slate-500">{inr(g.saved)} of {inr(g.target)} · {Math.round(p)}% · {inr(Math.max(0, g.target - g.saved))} remaining</p>
            <p className="text-xs text-slate-400">{left >= 0 ? `${left} days left` : 'Target date passed'}</p>
            <div className="flex gap-2"><button className="btn !py-1" onClick={() => { const v = Number(prompt('Amount to add (₹)')); v > 0 && fund(g.id, v) }}>Add money</button>
              <button className="btn-ghost" onClick={() => { const v = Number(prompt('New target (₹)', String(g.target))); v > 0 && saveGoal({ ...g, target: v }) }}>Edit target</button></div>
          </div>)
        })}
      </div>
    </div>
  )
}
