import type { Graph, GraphErrorCode, GraphNode, GraphResult, NodeId } from '../types/graph.ts'
import { edgeKey, findEdge } from './adjacency.ts'
import { graphErrorMessage } from './messages.ts'

export const MAX_NODES = 24

function fail<T>(error: GraphErrorCode): GraphResult<T> {
  return { ok: false, error, message: graphErrorMessage(error) }
}

export function createEmptyGraph(): Graph {
  return { nodes: [], edges: [] }
}

export function addNode(
  graph: Graph,
  node: Omit<GraphNode, 'x' | 'y'> & Partial<Pick<GraphNode, 'x' | 'y'>>,
  defaultPos?: { x: number; y: number },
): GraphResult<Graph> {
  const id = node.id.trim()
  if (!id) return fail('EMPTY_ID')
  if (graph.nodes.some((n) => n.id === id)) return fail('DUPLICATE_NODE')
  if (graph.nodes.length >= MAX_NODES) return fail('NODE_LIMIT')
  const x = node.x ?? defaultPos?.x ?? 100 + graph.nodes.length * 40
  const y = node.y ?? defaultPos?.y ?? 100 + (graph.nodes.length % 5) * 60
  return {
    ok: true,
    value: {
      ...graph,
      nodes: [...graph.nodes, { id, label: node.label.trim() || id, x, y }],
    },
  }
}

export function updateNodePosition(graph: Graph, id: NodeId, x: number, y: number): GraphResult<Graph> {
  if (!graph.nodes.some((n) => n.id === id)) return fail('NODE_NOT_FOUND')
  return {
    ok: true,
    value: {
      ...graph,
      nodes: graph.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
    },
  }
}

export function renameNode(graph: Graph, id: NodeId, label: string): GraphResult<Graph> {
  if (!graph.nodes.some((n) => n.id === id)) return fail('NODE_NOT_FOUND')
  return {
    ok: true,
    value: {
      ...graph,
      nodes: graph.nodes.map((n) => (n.id === id ? { ...n, label: label.trim() || n.id } : n)),
    },
  }
}

export function deleteNode(graph: Graph, id: NodeId): GraphResult<Graph> {
  if (!graph.nodes.some((n) => n.id === id)) return fail('NODE_NOT_FOUND')
  return {
    ok: true,
    value: {
      nodes: graph.nodes.filter((n) => n.id !== id),
      edges: graph.edges.filter((e) => e.source !== id && e.target !== id),
    },
  }
}

export function connectNodes(
  graph: Graph,
  source: NodeId,
  target: NodeId,
  weight: number,
): GraphResult<Graph> {
  if (source === target) return fail('SELF_LOOP')
  if (!graph.nodes.some((n) => n.id === source) || !graph.nodes.some((n) => n.id === target)) {
    return fail('NODE_NOT_FOUND')
  }
  if (!Number.isFinite(weight) || weight < 0) return fail('INVALID_WEIGHT')
  if (findEdge(graph, source, target)) return fail('DUPLICATE_EDGE')
  const id = `e-${edgeKey(source, target)}`
  return {
    ok: true,
    value: {
      ...graph,
      edges: [...graph.edges, { id, source, target, weight, active: true }],
    },
  }
}

export function updateEdgeWeight(graph: Graph, edgeId: string, weight: number): GraphResult<Graph> {
  if (!Number.isFinite(weight) || weight < 0) return fail('INVALID_WEIGHT')
  const edge = graph.edges.find((e) => e.id === edgeId)
  if (!edge) return fail('NODE_NOT_FOUND')
  return {
    ok: true,
    value: {
      ...graph,
      edges: graph.edges.map((e) => (e.id === edgeId ? { ...e, weight } : e)),
    },
  }
}

export function deleteEdge(graph: Graph, edgeId: string): GraphResult<Graph> {
  if (!graph.edges.some((e) => e.id === edgeId)) return fail('NODE_NOT_FOUND')
  return {
    ok: true,
    value: { ...graph, edges: graph.edges.filter((e) => e.id !== edgeId) },
  }
}

export function setEdgeActive(graph: Graph, edgeId: string, active: boolean): GraphResult<Graph> {
  if (!graph.edges.some((e) => e.id === edgeId)) return fail('NODE_NOT_FOUND')
  return {
    ok: true,
    value: {
      ...graph,
      edges: graph.edges.map((e) => (e.id === edgeId ? { ...e, active } : e)),
    },
  }
}

export function restoreAllEdges(graph: Graph): Graph {
  return { ...graph, edges: graph.edges.map((e) => ({ ...e, active: true })) }
}
