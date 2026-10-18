import type { GraphErrorCode } from '../types/graph.ts'

const MESSAGES: Record<GraphErrorCode, string> = {
  DUPLICATE_NODE: 'A node with this ID already exists.',
  NODE_NOT_FOUND: 'That node was not found on the graph.',
  SELF_LOOP: 'Self-loops are not allowed in this simple graph.',
  DUPLICATE_EDGE: 'An undirected link between these nodes already exists.',
  INVALID_WEIGHT: 'Weight must be a finite, non-negative number.',
  NODE_LIMIT: 'Maximum node count reached for this simulator.',
  EMPTY_ID: 'Node ID cannot be empty.',
}

export function graphErrorMessage(code: GraphErrorCode): string {
  return MESSAGES[code]
}
