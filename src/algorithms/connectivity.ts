import { buildAdjacency } from '../graph/adjacency.ts'
import type { Graph, NodeId } from '../types/graph.ts'

export interface ConnectivityReport {
  componentCount: number
  connected: boolean
  destinationReachable: boolean
  labels: string
}

export function connectedComponents(graph: Graph): NodeId[][] {
  const adj = buildAdjacency(graph)
  const seen = new Set<NodeId>()
  const components: NodeId[][] = []

  for (const node of [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id))) {
    if (seen.has(node.id)) continue
    const comp: NodeId[] = []
    const queue = [node.id]
    seen.add(node.id)
    while (queue.length > 0) {
      const u = queue.shift()!
      comp.push(u)
      for (const { neighbor } of adj.get(u) ?? []) {
        if (seen.has(neighbor)) continue
        seen.add(neighbor)
        queue.push(neighbor)
      }
    }
    comp.sort((a, b) => a.localeCompare(b))
    components.push(comp)
  }
  return components
}

export function connectivityReport(
  graph: Graph,
  source: NodeId | null,
  dest: NodeId | null,
): ConnectivityReport {
  if (graph.nodes.length === 0) {
    return {
      componentCount: 0,
      connected: false,
      destinationReachable: false,
      labels: 'Empty graph',
    }
  }

  const components = connectedComponents(graph)
  const componentCount = components.length
  const connected = componentCount === 1

  let destinationReachable = false
  if (source && dest) {
    const comp = components.find((c) => c.includes(source))
    destinationReachable = comp?.includes(dest) ?? false
  }

  const labels = connected
    ? 'Connected'
    : `Disconnected (${componentCount} components)`

  return { componentCount, connected, destinationReachable, labels }
}
