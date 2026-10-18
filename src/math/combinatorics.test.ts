import { describe, expect, it } from 'vitest'
import { combination, factorial, permutation } from './combinatorics.ts'

describe('factorial', () => {
  it('handles base cases', () => {
    expect(factorial(0)).toEqual({ ok: true, value: 1n })
    expect(factorial(1)).toEqual({ ok: true, value: 1n })
    expect(factorial(5)).toEqual({ ok: true, value: 120n })
  })

  it('rejects invalid input', () => {
    expect(factorial(-1).ok).toBe(false)
    expect(factorial(1.5).ok).toBe(false)
  })

  it('computes 25!', () => {
    const r = factorial(25)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toBe(15511210043330985984000000n)
  })
})

describe('combinations', () => {
  it('C(4,2) = 6', () => {
    expect(combination(4, 2)).toEqual({ ok: true, value: 6n })
  })
  it('edge cases', () => {
    expect(combination(5, 0)).toEqual({ ok: true, value: 1n })
    expect(combination(5, 5)).toEqual({ ok: true, value: 1n })
  })
})

describe('permutations', () => {
  it('P(4,2) = 12', () => {
    expect(permutation(4, 2)).toEqual({ ok: true, value: 12n })
  })
})
