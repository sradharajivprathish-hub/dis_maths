import type { Graph } from '../types/graph.ts'

/** Default sample: nodes A–F with fixed layout (undirected weighted edges). */
export function createSampleGraph(): Graph {
  return {
    nodes: [
      { id: 'A', label: 'A', x: 90, y: 250 },
      { id: 'B', label: 'B', x: 220, y: 130 },
      { id: 'C', label: 'C', x: 220, y: 370 },
      { id: 'D', label: 'D', x: 400, y: 250 },
      { id: 'E', label: 'E', x: 560, y: 370 },
      { id: 'F', label: 'F', x: 680, y: 250 },
    ],
    edges: [
      { id: 'e-A|B', source: 'A', target: 'B', weight: 2, active: true },
      { id: 'e-A|C', source: 'A', target: 'C', weight: 4, active: true },
      { id: 'e-B|C', source: 'B', target: 'C', weight: 1, active: true },
      { id: 'e-B|D', source: 'B', target: 'D', weight: 4, active: true },
      { id: 'e-C|D', source: 'C', target: 'D', weight: 2, active: true },
      { id: 'e-C|E', source: 'C', target: 'E', weight: 5, active: true },
      { id: 'e-D|E', source: 'D', target: 'E', weight: 1, active: true },
      { id: 'e-D|F', source: 'D', target: 'F', weight: 7, active: true },
      { id: 'e-E|F', source: 'E', target: 'F', weight: 3, active: true },
    ],
  }
}

export const DEFAULT_SOURCE = 'A'
export const DEFAULT_DEST = 'F'
