import { describe, expect, it } from 'vitest'
import { createEmptyGraph, addNode, connectNodes, deleteEdge, deleteNode } from './operations.ts'

describe('graph operations', () => {
  it('adds nodes and rejects duplicates', () => {
    let g = createEmptyGraph()
    const a = addNode(g, { id: 'A', label: 'A' })
    expect(a.ok).toBe(true)
    if (!a.ok) return
    g = a.value
    expect(addNode(g, { id: 'A', label: 'A' }).ok).toBe(false)
  })

  it('rejects self-loops and duplicate edges', () => {
    let g = addNode(createEmptyGraph(), { id: 'A', label: 'A' }).value
    g = addNode(g, { id: 'B', label: 'B' }).value
    expect(connectNodes(g, 'A', 'A', 1).ok).toBe(false)
    g = connectNodes(g, 'A', 'B', 2).value
    expect(connectNodes(g, 'B', 'A', 3).ok).toBe(false)
  })

  it('deletes node and incident edges', () => {
    let g = createEmptyGraph()
    g = addNode(g, { id: 'A', label: 'A' }).value
    g = addNode(g, { id: 'B', label: 'B' }).value
    g = connectNodes(g, 'A', 'B', 1).value
    g = deleteNode(g, 'A').value
    expect(g.nodes).toHaveLength(1)
    expect(g.edges).toHaveLength(0)
  })

  it('removes edges', () => {
    let g = createEmptyGraph()
    g = addNode(g, { id: 'A', label: 'A' }).value
    g = addNode(g, { id: 'B', label: 'B' }).value
    g = connectNodes(g, 'A', 'B', 1).value
    const id = g.edges[0]!.id
    g = deleteEdge(g, id).value
    expect(g.edges).toHaveLength(0)
  })
})
