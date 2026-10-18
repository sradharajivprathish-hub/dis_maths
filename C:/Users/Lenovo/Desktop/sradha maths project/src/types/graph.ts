export type NodeId = string

export interface GraphNode {
  id: NodeId
  label: string
  x: number
  y: number
}

export interface GraphEdge {
  id: string
  source: NodeId
  target: NodeId
  weight: number
  active: boolean
}

export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface PathResult {
  nodes: NodeId[]
  totalWeight: number
  hopCount: number
}

export type GraphErrorCode =
  | 'DUPLICATE_NODE'
  | 'NODE_NOT_FOUND'
  | 'SELF_LOOP'
  | 'DUPLICATE_EDGE'
  | 'INVALID_WEIGHT'
  | 'NODE_LIMIT'
  | 'EMPTY_ID'

export type GraphResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: GraphErrorCode; message: string }
