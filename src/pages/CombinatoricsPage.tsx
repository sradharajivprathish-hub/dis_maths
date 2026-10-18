import { useMemo, useState } from 'react'
import {
  ARRANGEMENT_DISCLAIMER,
} from '../types/app.ts'
import {
  combination,
  factorial,
  formatBigInt,
  listCombinations,
  listPermutations,
  permutation,
} from '../math/combinatorics.ts'

type Mode = 'factorial' | 'permutation' | 'combination'

export function CombinatoricsPage() {
  const [mode, setMode] = useState<Mode>('factorial')
  const [n, setN] = useState(5)
  const [r, setR] = useState(2)

  const result = useMemo(() => {
    if (mode === 'factorial') return factorial(n)
    if (mode === 'permutation') return permutation(n, r)
    return combination(n, r)
  }, [mode, n, r])

  const formula =
    mode === 'factorial'
      ? `${n}!`
      : mode === 'permutation'
        ? `P(${n},${r}) = ${n}! / (${n}−${r})!`
        : `C(${n},${r}) = ${n}! / (${r}! × (${n}−${r})!)`

  const steps = useMemo(() => {
    if (!result.ok) return []
    if (mode === 'factorial') {
      const parts: string[] = []
      let acc = 1n
      for (let i = 2; i <= n; i++) {
        acc *= BigInt(i)
        parts.push(`${i}`)
      }
      return parts.length ? [`${parts.join(' × ')} = ${formatBigInt(acc)}`] : ['1']
    }
    if (mode === 'permutation') {
      const parts: string[] = []
      let acc = 1n
      for (let i = 0; i < r; i++) {
        const term = n - i
        acc *= BigInt(term)
        parts.push(String(term))
      }
      return [`${parts.join(' × ')} = ${formatBigInt(acc)}`]
    }
    const k = Math.min(r, n - r)
    const parts: string[] = []
    let acc = 1n
    for (let i = 1; i <= k; i++) {
      acc = (acc * BigInt(n - k + i)) / BigInt(i)
      parts.push(`× ${n - k + i} / ${i}`)
    }
    return parts
  }, [mode, n, r, result])

  const demoItems = ['A', 'B', 'C', 'D']
  const listCap = 24
  const permList =
    mode !== 'combination' && n <= 4 && r <= 4
      ? listPermutations(demoItems.slice(0, n), r, listCap)
      : []
  const combList =
    mode === 'combination' && n <= 4 && r <= 4
      ? listCombinations(demoItems.slice(0, n), r, listCap)
      : []

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Permutations &amp; Combinations</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Exact arithmetic with <span className="font-mono">BigInt</span> for discrete counting.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['factorial', 'permutation', 'combination'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            className={`min-h-11 rounded-lg px-3 text-sm capitalize ${
              mode === m ? 'bg-[var(--accent)] text-white' : 'border border-[var(--border)]'
            }`}
            onClick={() => setMode(m)}
          >
            {m === 'factorial' ? 'n!' : m}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="font-medium">Inputs</h3>
          <label className="mt-3 block text-sm">
            n (0–170)
            <input
              type="number"
              min={0}
              max={170}
              className="mt-1 w-full min-h-11 rounded-lg border border-[var(--border)] px-2 font-mono"
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
            />
          </label>
          {mode !== 'factorial' && (
            <label className="mt-3 block text-sm">
              r
              <input
                type="number"
                min={0}
                max={n}
                className="mt-1 w-full min-h-11 rounded-lg border border-[var(--border)] px-2 font-mono"
                value={r}
                onChange={(e) => setR(Number(e.target.value))}
              />
            </label>
          )}
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="font-medium">Result</h3>
          {!result.ok ? (
            <p className="mt-2 text-sm text-[var(--danger)]">{result.message}</p>
          ) : (
            <>
              <p className="mt-2 font-mono text-2xl">{formatBigInt(result.value)}</p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{formula}</p>
            </>
          )}
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <h3 className="font-medium">Step-by-step</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 font-mono text-sm">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          {mode === 'permutation'
            ? 'Order matters: each arrangement is distinct.'
            : mode === 'combination'
              ? 'Order does not matter: only membership counts.'
              : 'Factorial counts all arrangements of n distinct objects.'}
        </p>
      </div>

      <aside className="rounded-[var(--radius-card)] border border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] p-4 text-sm">
        <p>{ARRANGEMENT_DISCLAIMER}</p>
        <p className="mt-2">
          Choosing a group of nodes is not the same as building a connected route through them.
        </p>
      </aside>

      {(permList.length > 0 || combList.length > 0) && (
        <div className="rounded-[var(--radius-card)] border border-[var(--border)] p-4">
          <h3 className="font-medium">Small demo listings (capped at {listCap})</h3>
          <ul className="mt-2 max-h-48 overflow-y-auto font-mono text-xs">
            {(permList.length ? permList : combList).map((row, i) => (
              <li key={i}>{row.join(', ')}</li>
            ))}
          </ul>
        </div>
      )}

      <Glossary />
    </div>
  )
}

function Glossary() {
  const terms: { term: string; def: string }[] = [
    { term: 'Permutation', def: 'Ordered arrangement of r items chosen from n.' },
    { term: 'Combination', def: 'Unordered selection of r items from n.' },
    { term: 'Simple path', def: 'Walk with no repeated vertices.' },
    { term: 'Topology', def: 'Which vertices and edges exist in the graph.' },
  ]
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {terms.map(({ term, def }) => (
        <div key={term} className="rounded-lg border border-[var(--border)] p-3 text-sm" title={def}>
          <span className="font-medium">{term}</span>
          <p className="text-[var(--text-muted)]">{def}</p>
        </div>
      ))}
    </div>
  )
}
