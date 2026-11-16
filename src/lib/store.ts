import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import { z } from 'zod'

export const DEFAULT_CATEGORIES = ['Food', 'Shopping', 'Transportation', 'Education', 'Entertainment', 'Healthcare', 'Bills', 'Rent', 'Travel', 'Subscriptions', 'Salary', 'Freelancing', 'Business', 'Gifts', 'Other']
export const METHODS = ['UPI', 'Cash', 'Card', 'Bank Transfer', 'Other']

export const txSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number({ error: 'Enter an amount' }).positive('Amount must be greater than 0').max(1e9),
  category: z.string().min(1, 'Pick a category'),
  description: z.string().trim().min(1, 'Add a description').max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date'),
  method: z.string().min(1),
  note: z.string().max(500).optional().default(''),
})
export type TxInput = z.infer<typeof txSchema>
export type Tx = TxInput & { id: string }
export interface Goal { id: string; name: string; target: number; saved: number; date: string }
export interface Budget { overall: number; cats: Record<string, number> }
interface Data { txs: Tx[]; goals: Goal[]; budget: Budget; customCats: string[] }
interface State extends Data {
  theme: 'light' | 'dark'; month: string
  addTx: (t: TxInput) => void; updateTx: (id: string, t: TxInput) => void; delTx: (id: string) => void
  addTxs: (t: TxInput[]) => void
  saveGoal: (g: Omit<Goal, 'id'> & { id?: string }) => void; delGoal: (id: string) => void; fund: (id: string, amt: number) => void
  setBudget: (b: Budget) => void; addCat: (c: string) => void
  setTheme: (t: 'light' | 'dark') => void; setMonth: (m: string) => void
  importAll: (d: Data) => void; reset: () => void
}
const uid = () => crypto.randomUUID()
const empty: Data = { txs: [], goals: [], budget: { overall: 0, cats: {} }, customCats: [] }

const storage = createJSONStorage(() => ({
  getItem: (k) => get(k).then((v) => v ?? null),
  setItem: (k, v) => set(k, v),
  removeItem: (k) => del(k),
}))

export const useStore = create<State>()(
  persist(
    (s) => ({
      ...empty,
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      month: new Date().toISOString().slice(0, 7),
      addTx: (t) => s((x) => ({ txs: [{ ...t, id: uid() }, ...x.txs] })),
      addTxs: (t) => s((x) => ({ txs: [...t.map((i) => ({ ...i, id: uid() })), ...x.txs] })),
      updateTx: (id, t) => s((x) => ({ txs: x.txs.map((i) => (i.id === id ? { ...t, id } : i)) })),
      delTx: (id) => s((x) => ({ txs: x.txs.filter((i) => i.id !== id) })),
      saveGoal: (g) => s((x) => ({ goals: g.id ? x.goals.map((i) => (i.id === g.id ? (g as Goal) : i)) : [...x.goals, { ...g, id: uid() }] })),
      delGoal: (id) => s((x) => ({ goals: x.goals.filter((i) => i.id !== id) })),
      fund: (id, amt) => s((x) => ({ goals: x.goals.map((i) => (i.id === id ? { ...i, saved: i.saved + amt } : i)) })),
      setBudget: (budget) => s({ budget }),
      addCat: (c) => s((x) => (x.customCats.includes(c) || DEFAULT_CATEGORIES.includes(c) ? x : { customCats: [...x.customCats, c] })),
      setTheme: (theme) => s({ theme }),
      setMonth: (month) => s({ month }),
      importAll: (d) => s({ ...empty, ...d }),
      reset: () => s({ ...empty }),
    }),
    { name: 'pennywise-v1', storage, version: 1 },
  ),
)
export const useCats = () => {
  const custom = useStore((s) => s.customCats)
  return useMemo(() => [...DEFAULT_CATEGORIES, ...custom], [custom])
}
export const INCOME_CATS = ['Salary', 'Freelancing', 'Business', 'Gifts', 'Other']
