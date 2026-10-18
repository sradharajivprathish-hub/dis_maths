import type { Graph, GraphEdge, NodeId } from '../types/graph.ts'

export function buildAdjacency(graph: Graph): Map<NodeId, { neighbor: NodeId; weight: number; edgeId: string }[]> {
  const adj = new Map<NodeId, { neighbor: NodeId; weight: number; edgeId: string }[]>()
  for (const node of graph.nodes) {
    adj.set(node.id, [])
  }
  for (const edge of graph.edges) {
    if (!edge.active) continue
    if (!adj.has(edge.source) || !adj.has(edge.target)) continue
    adj.get(edge.source)!.push({ neighbor: edge.target, weight: edge.weight, edgeId: edge.id })
    adj.get(edge.target)!.push({ neighbor: edge.source, weight: edge.weight, edgeId: edge.id })
  }
  for (const [, list] of adj) {
    list.sort((a, b) => a.neighbor.localeCompare(b.neighbor))
  }
  return adj
}

export function edgeKey(a: NodeId, b: NodeId): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

export function findEdge(graph: Graph, a: NodeId, b: NodeId): GraphEdge | undefined {
  const key = edgeKey(a, b)
  return graph.edges.find((e) => edgeKey(e.source, e.target) === key)
}
