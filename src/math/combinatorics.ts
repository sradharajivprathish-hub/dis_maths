export const MAX_FACTORIAL_N = 170

export type CombinatoricsError = 'INVALID_INPUT' | 'TOO_LARGE'

export type CombinatoricsResult =
  | { ok: true; value: bigint }
  | { ok: false; error: CombinatoricsError; message: string }

function validateNr(n: number, r: number): CombinatoricsResult | null {
  if (!Number.isInteger(n) || !Number.isInteger(r)) {
    return { ok: false, error: 'INVALID_INPUT', message: 'n and r must be integers.' }
  }
  if (n < 0 || r < 0 || r > n) {
    return { ok: false, error: 'INVALID_INPUT', message: 'Require 0 ≤ r ≤ n.' }
  }
  if (n > MAX_FACTORIAL_N) {
    return {
      ok: false,
      error: 'TOO_LARGE',
      message: `n must be at most ${MAX_FACTORIAL_N} for exact display.`,
    }
  }
  return null
}

export function factorial(n: number): CombinatoricsResult {
  const err = validateNr(n, 0)
  if (err && n < 0) return err
  if (!Number.isInteger(n) || n < 0) {
    return { ok: false, error: 'INVALID_INPUT', message: 'n must be a non-negative integer.' }
  }
  if (n > MAX_FACTORIAL_N) {
    return { ok: false, error: 'TOO_LARGE', message: `n must be at most ${MAX_FACTORIAL_N}.` }
  }
  let acc = 1n
  for (let i = 2n; i <= BigInt(n); i++) acc *= i
  return { ok: true, value: acc }
}

export function permutation(n: number, r: number): CombinatoricsResult {
  const invalid = validateNr(n, r)
  if (invalid) return invalid
  let acc = 1n
  for (let i = 0; i < r; i++) {
    acc *= BigInt(n - i)
  }
  return { ok: true, value: acc }
}

export function combination(n: number, r: number): CombinatoricsResult {
  const invalid = validateNr(n, r)
  if (invalid) return invalid
  const k = Math.min(r, n - r)
  let acc = 1n
  for (let i = 1; i <= k; i++) {
    acc = (acc * BigInt(n - k + i)) / BigInt(i)
  }
  return { ok: true, value: acc }
}

export function formatBigInt(value: bigint): string {
  const s = value.toString()
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function listPermutations(items: string[], r: number, cap = 24): string[][] {
  if (r <= 0 || items.length === 0) return [[]]
  const results: string[][] = []
  const used = new Array<boolean>(items.length).fill(false)

  function dfs(prefix: string[]) {
    if (results.length >= cap) return
    if (prefix.length === r) {
      results.push([...prefix])
      return
    }
    for (let i = 0; i < items.length; i++) {
      if (used[i]) continue
      used[i] = true
      prefix.push(items[i]!)
      dfs(prefix)
      prefix.pop()
      used[i] = false
      if (results.length >= cap) return
    }
  }
  dfs([])
  return results
}

export function listCombinations(items: string[], r: number, cap = 24): string[][] {
  const results: string[][] = []
  const combo: string[] = []

  function dfs(start: number) {
    if (results.length >= cap) return
    if (combo.length === r) {
      results.push([...combo])
      return
    }
    for (let i = start; i < items.length; i++) {
      combo.push(items[i]!)
      dfs(i + 1)
      combo.pop()
      if (results.length >= cap) return
    }
  }
  if (r === 0) return [[]]
  dfs(0)
  return results
}
