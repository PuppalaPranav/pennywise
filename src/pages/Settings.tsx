import { useRef, useState } from 'react'
import { useStore, txSchema, type TxInput } from '../lib/store'

const dl = (name: string, text: string, type: string) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click() }
const esc = (v: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`
function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], cur = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) { if (c === '"' && text[i + 1] === '"') { cur += '"'; i++ } else if (c === '"') q = false; else cur += c }
    else if (c === '"') q = true
    else if (c === ',') { row.push(cur); cur = '' }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = '' }
    else cur += c
  }
  if (cur || row.length) { row.push(cur); rows.push(row) }
  return rows.filter((r) => r.some(Boolean))
}
export default function Settings() {
  const s = useStore(); const [cat, setCat] = useState(''); const [msg, setMsg] = useState('')
  const jsonRef = useRef<HTMLInputElement>(null); const csvRef = useRef<HTMLInputElement>(null)
  const backup = () => dl(`pennywise-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ txs: s.txs, goals: s.goals, budget: s.budget, customCats: s.customCats }, null, 2), 'application/json')
  const restore = async (f?: File) => {
    if (!f) return
    try {
      const d = JSON.parse(await f.text())
      if (!Array.isArray(d.txs) || !d.txs.every((t: { id?: unknown }) => typeof t.id === 'string' && txSchema.safeParse(t).success)) throw new Error()
      if (confirm('Replace all current data with this backup?')) { s.importAll(d); setMsg('Backup restored.') }
    } catch { setMsg('Invalid backup file.') }
    if (jsonRef.current) jsonRef.current.value = ''
  }
  const exportCsv = () => dl('pennywise-transactions.csv', ['date,type,category,description,amount,method,note', ...s.txs.map((t) => [t.date, t.type, t.category, esc(t.description), t.amount, t.method, esc(t.note ?? '')].join(','))].join('\n'), 'text/csv')
  const importCsv = async (f?: File) => {
    if (!f) return
    const [head, ...rows] = parseCsv(await f.text()); const h = head.map((x) => x.trim().toLowerCase()); const ok: TxInput[] = []; let bad = 0
    rows.forEach((r) => { const o = Object.fromEntries(h.map((k, i) => [k, r[i] ?? ''])); const p = txSchema.safeParse({ ...o, amount: Number(o.amount), method: o.method || 'Other' }); p.success ? ok.push(p.data) : bad++ })
    s.addTxs(ok); setMsg(`Imported ${ok.length} transactions${bad ? `, skipped ${bad} invalid rows` : ''}.`)
    if (csvRef.current) csvRef.current.value = ''
  }
  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">Settings</h1>
      {msg && <p className="card text-sm" role="status">{msg}</p>}
      <section className="card space-y-3"><h2 className="font-medium">Appearance & format</h2>
        <div className="flex gap-2">{(['light', 'dark'] as const).map((t) => <button key={t} className={s.theme === t ? 'btn' : 'btn-ghost border border-slate-200 dark:border-neutral-700'} onClick={() => s.setTheme(t)}>{t === 'light' ? 'Light' : 'Dark'}</button>)}</div>
        <p className="text-sm text-slate-500">Currency: INR (₹) with Indian digit grouping (₹1,25,000).</p></section>
      <section className="card space-y-3"><h2 className="font-medium">Custom categories</h2>
        <div className="flex gap-2"><input className="input" placeholder="New category" value={cat} onChange={(e) => setCat(e.target.value)} /><button className="btn" onClick={() => { const c = cat.trim(); if (c) { s.addCat(c); setCat('') } }}>Add</button></div>
        <p className="text-sm text-slate-500">{s.customCats.join(', ') || 'None yet.'}</p></section>
      <section className="card space-y-3"><h2 className="font-medium">Backup & data</h2>
        <div className="flex flex-wrap gap-2"><button className="btn" onClick={backup}>Download backup (JSON)</button><button className="btn" onClick={() => jsonRef.current?.click()}>Restore backup</button><button className="btn" onClick={exportCsv}>Export CSV</button><button className="btn" onClick={() => csvRef.current?.click()}>Import CSV</button></div>
        <input ref={jsonRef} hidden type="file" accept=".json" onChange={(e) => restore(e.target.files?.[0])} /><input ref={csvRef} hidden type="file" accept=".csv" onChange={(e) => importCsv(e.target.files?.[0])} />
        <p className="text-xs text-slate-500">CSV columns: date,type,category,description,amount,method,note. All data stays in this browser (IndexedDB).</p></section>
      <section className="card space-y-3 border-rose-200"><h2 className="font-medium text-rose-600">Danger zone</h2>
        <button className="btn !bg-rose-600" onClick={() => confirm('Permanently delete ALL data? Download a backup first.') && (s.reset(), setMsg('All data cleared.'))}>Reset all data</button></section>
    </div>
  )
}
