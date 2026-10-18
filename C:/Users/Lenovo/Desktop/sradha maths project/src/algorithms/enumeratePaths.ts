import { buildAdjacency } from '../graph/adjacency.ts'
import type { Graph, NodeId, PathResult } from '../types/graph.ts'

export interface EnumerateOptions {
  maxPaths?: number
  maxVisits?: number
}

export interface EnumerateResult {
  paths: PathResult[]
  truncated: boolean
  exploredLimitHit: boolean
}

function pathWeight(graph: Graph, nodes: NodeId[]): number {
  let total = 0
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i]!
    const b = nodes[i + 1]!
    const edge = graph.edges.find(
      (e) =>
        e.active &&
        ((e.source === a && e.target === b) || (e.source === b && e.target === a)),
    )
    if (!edge) return Infinity
    total += edge.weight
  }
  return total
}

export function enumerateSimplePaths(
  graph: Graph,
  source: NodeId | null,
  dest: NodeId | null,
  options: EnumerateOptions = {},
): EnumerateResult {
  const maxPaths = options.maxPaths ?? 500
  const maxVisits = options.maxVisits ?? 50_000

  if (!source || !dest) {
    return { paths: [], truncated: false, exploredLimitHit: false }
  }
  if (!graph.nodes.some((n) => n.id === source) || !graph.nodes.some((n) => n.id === dest)) {
    return { paths: [], truncated: false, exploredLimitHit: false }
  }
  if (source === dest) {
    return {
      paths: [{ nodes: [source], totalWeight: 0, hopCount: 0 }],
      truncated: false,
      exploredLimitHit: false,
    }
  }

  const adj = buildAdjacency(graph)
  const paths: PathResult[] = []
  let visits = 0
  let truncated = false
  let exploredLimitHit = false

  type Frame = { current: NodeId; path: NodeId[]; visited: Set<NodeId> }
  const stack: Frame[] = [{ current: source, path: [source], visited: new Set([source]) }]

  while (stack.length > 0) {
    const frame = stack.pop()!
    visits++
    if (visits > maxVisits) {
      exploredLimitHit = true
      truncated = true
      break
    }

    if (frame.current === dest) {
      paths.push({
        nodes: frame.path,
        totalWeight: pathWeight(graph, frame.path),
        hopCount: frame.path.length - 1,
      })
      if (paths.length >= maxPaths) {
        truncated = true
        break
      }
      continue
    }

    const neighbors = adj.get(frame.current) ?? []
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const { neighbor } = neighbors[i]!
      if (frame.visited.has(neighbor)) continue
      const nextVisited = new Set(frame.visited)
      nextVisited.add(neighbor)
      stack.push({
        current: neighbor,
        path: [...frame.path, neighbor],
        visited: nextVisited,
      })
    }
  }

  paths.sort((a, b) => {
    if (a.hopCount !== b.hopCount) return a.hopCount - b.hopCount
    if (a.totalWeight !== b.totalWeight) return a.totalWeight - b.totalWeight
    return a.nodes.join(',').localeCompare(b.nodes.join(','))
  })

  return { paths, truncated, exploredLimitHit }
}
