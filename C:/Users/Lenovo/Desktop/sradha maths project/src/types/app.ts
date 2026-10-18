export type PageId =
  | 'dashboard'
  | 'simulator'
  | 'routes'
  | 'combinatorics'
  | 'induction'
  | 'comparison'
  | 'about'

export type SimulatorMode = 'select' | 'add' | 'connect' | 'delete'

export type RouteAlgorithm = 'enumerate' | 'dijkstra' | 'bfs'

export interface ProjectDetails {
  institution: string
  student: string
  course: string
  instructor: string
}

export const ARRANGEMENT_DISCLAIMER =
  'This counts unrestricted arrangements. It is not automatically the number of valid paths in a network.'

export const TOPOLOGY_DISCLAIMER =
  "The number of valid paths between two vertices depends on the graph's topology. The factorial formula applies to unrestricted arrangements under the stated assumptions, not universally to network path counts."

export const PATH_ENUM_WARNING =
  'The number of simple paths can grow exponentially with graph size. Exhaustive enumeration is intended for small educational graphs.'
