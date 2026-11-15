const f = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
export const inr = (n: number) => f.format(n)
export const today = () => new Date().toISOString().slice(0, 10)
