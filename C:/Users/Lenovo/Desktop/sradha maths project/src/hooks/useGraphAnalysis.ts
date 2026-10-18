import { useMemo } from 'react'
import { enumerateSimplePaths } from '../algorithms/enumeratePaths.ts'
import { dijkstra } from '../algorithms/dijkstra.ts'
import { bfsShortestHops } from '../algorithms/bfs.ts'
import { connectivityReport } from '../algorithms/connectivity.ts'
import type { Graph, NodeId } from '../types/graph.ts'

export function useGraphAnalysis(graph: Graph, source: NodeId | null, dest: NodeId | null) {
  return useMemo(() => {
    const enumeration = enumerateSimplePaths(graph, source, dest)
    const dijk = dijkstra(graph, source, dest)
    const bfs = bfsShortestHops(graph, source, dest)
    const connectivity = connectivityReport(graph, source, dest)
    return { enumeration, dijk, bfs, connectivity }
  }, [graph, source, dest])
}
