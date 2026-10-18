import { useMemo, useState } from 'react'
import { TOPOLOGY_DISCLAIMER } from '../types/app.ts'
import { factorial, formatBigInt } from '../math/combinatorics.ts'

const STEPS = [
  {
    title: 'Base case',
    body: 'For n = 1, there is exactly one arrangement of one distinct object, and 1! = 1.',
    formula: 'P(1) = 1! = 1',
  },
  {
    title: 'Induction hypothesis',
    body: 'Assume for some n ≥ 1 that the number of arrangements of n distinct objects is n!.',
    formula: 'P(n) = n!',
  },
  {
    title: 'Inductive step',
    body:
      'Insert a new distinct object into any of the (n + 1) positions of each existing arrangement. Each of the P(n) = n! arrangements yields (n + 1) extended arrangements.',
    formula: 'P(n+1) = (n+1) · P(n) = (n+1) · n! = (n+1)!',
  },
  {
    title: 'Conclusion',
    body: 'By mathematical induction, P(n) = n! for all integers n ≥ 1.',
    formula: '∀ n ≥ 1, P(n) = n!',
  },
]

export function InductionPage() {
  const [step, setStep] = useState(0)
  const [n, setN] = useState(4)

  const fact = useMemo(() => factorial(n), [n])
  const growth = useMemo(() => {
    const bars: { label: string; value: number }[] = []
    for (let i = 1; i <= Math.min(n, 8); i++) {
      const f = factorial(i)
      if (!f.ok) break
      const v = Number(f.value)
      if (!Number.isFinite(v)) break
      bars.push({ label: `${i}!`, value: v })
    }
    return bars
  }, [n])
  const maxBar = Math.max(...growth.map((b) => b.value), 1)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Mathematical Induction</h2>
        <p className="text-sm text-[var(--text-muted)]">
          A guided proof that arrangements of n distinct objects equal n!.
        </p>
      </div>

      <aside className="rounded-[var(--radius-card)] border border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] p-4 text-sm">
        {TOPOLOGY_DISCLAIMER}
      </aside>

      <div className="flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.title}
            type="button"
            className={`min-h-11 rounded-lg px-3 text-sm ${
              step === i ? 'bg-[var(--accent)] text-white' : 'border border-[var(--border)]'
            }`}
            onClick={() => setStep(i)}
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </div>

      <article className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <h3 className="text-lg font-semibold">{STEPS[step]!.title}</h3>
        <p className="mt-2 text-sm">{STEPS[step]!.body}</p>
        <p className="mt-4 font-mono text-base text-[var(--accent-cyan)]">{STEPS[step]!.formula}</p>
      </article>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-[var(--border)] p-4">
          <label className="text-sm">
            Try n (1–12 for animation)
            <input
              type="range"
              min={1}
              max={12}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="mt-2 w-full"
            />
            <span className="font-mono text-lg">{n}</span>
          </label>
          {fact.ok && (
            <p className="mt-2 font-mono text-xl">
              {n}! = {formatBigInt(fact.value)}
            </p>
          )}
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--border)] p-4">
          <h3 className="text-sm font-medium">Growth of n!</h3>
          <div className="mt-3 flex items-end gap-2" style={{ minHeight: 120 }}>
            {growth.map((b) => (
              <div key={b.label} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-[var(--accent-teal)] transition-all duration-200"
                  style={{ height: `${(b.value / maxBar) * 100}px`, minHeight: 4 }}
                  title={String(b.value)}
                />
                <span className="font-mono text-[10px]">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        Insertion demo: with n + 1 slots per arrangement, each inductive step multiplies the count by (n + 1).
      </p>
    </div>
  )
}
