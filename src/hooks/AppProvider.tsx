import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createSampleGraph, DEFAULT_DEST, DEFAULT_SOURCE } from '../data/sampleGraph.ts'
import type { Graph, GraphResult, NodeId } from '../types/graph.ts'
import type { PageId, ProjectDetails, SimulatorMode } from '../types/app.ts'
import { restoreAllEdges } from '../graph/operations.ts'

const HISTORY_LIMIT = 40

interface AppContextValue {
  graph: Graph
  setGraph: (g: Graph, pushHistory?: boolean) => void
  applyGraphOp: (result: GraphResult<Graph>) => boolean
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  sourceId: NodeId | null
  destId: NodeId | null
  setSourceId: (id: NodeId | null) => void
  setDestId: (id: NodeId | null) => void
  page: PageId
  navigate: (p: PageId) => void
  simulatorMode: SimulatorMode
  setSimulatorMode: (m: SimulatorMode) => void
  selectedNodeId: NodeId | null
  setSelectedNodeId: (id: NodeId | null) => void
  selectedPathKey: string | null
  setSelectedPathKey: (key: string | null) => void
  snapToGrid: boolean
  setSnapToGrid: (v: boolean) => void
  theme: 'dark' | 'light'
  toggleTheme: () => void
  toast: string | null
  showToast: (msg: string) => void
  projectDetails: ProjectDetails
  setProjectDetails: (d: ProjectDetails) => void
  loadSample: () => void
  clearGraph: () => void
  restoreEdges: () => void
  prevShortestCost: number | null
  setPrevShortestCost: (n: number | null) => void
  animSpeed: number
  setAnimSpeed: (n: number) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function parsePage(hash: string): PageId {
  const raw = hash.replace(/^#/, '') || 'dashboard'
  const allowed: PageId[] = [
    'dashboard',
    'simulator',
    'routes',
    'combinatorics',
    'induction',
    'comparison',
    'about',
  ]
  return allowed.includes(raw as PageId) ? (raw as PageId) : 'dashboard'
}

function pathKey(nodes: NodeId[]): string {
  return nodes.join('→')
}

export { pathKey }

export function AppProvider({ children }: { children: ReactNode }) {
  const [graph, setGraphState] = useState<Graph>(() => createSampleGraph())
  const [past, setPast] = useState<Graph[]>([])
  const [future, setFuture] = useState<Graph[]>([])
  const [sourceId, setSourceId] = useState<NodeId | null>(DEFAULT_SOURCE)
  const [destId, setDestId] = useState<NodeId | null>(DEFAULT_DEST)
  const [page, setPage] = useState<PageId>(() =>
    typeof window !== 'undefined' ? parsePage(window.location.hash) : 'dashboard',
  )
  const [simulatorMode, setSimulatorMode] = useState<SimulatorMode>('select')
  const [selectedNodeId, setSelectedNodeId] = useState<NodeId | null>(null)
  const [selectedPathKey, setSelectedPathKey] = useState<string | null>(null)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark'
    return (localStorage.getItem('netroute-theme') as 'dark' | 'light') || 'dark'
  })
  const [toast, setToast] = useState<string | null>(null)
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    institution: '',
    student: '',
    course: '',
    instructor: '',
  })
  const [prevShortestCost, setPrevShortestCost] = useState<number | null>(null)
  const [animSpeed, setAnimSpeed] = useState(1)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('netroute-theme', theme)
  }, [theme])

  useEffect(() => {
    const onHash = () => setPage(parsePage(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((p: PageId) => {
    window.location.hash = p
    setPage(p)
  }, [])

  const setGraph = useCallback((g: Graph, pushHistory = true) => {
    setGraphState((prev) => {
      if (pushHistory) {
        setPast((h) => [...h.slice(-HISTORY_LIMIT + 1), prev])
        setFuture([])
      }
      return g
    })
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 3200)
  }, [])

  const applyGraphOp = useCallback(
    (result: GraphResult<Graph>): boolean => {
      if (!result.ok) {
        showToast(result.message)
        return false
      }
      setGraph(result.value)
      return true
    },
    [setGraph, showToast],
  )

  const undo = useCallback(() => {
    setPast((h) => {
      if (h.length === 0) return h
      const prev = h[h.length - 1]!
      setFuture((f) => [graph, ...f])
      setGraphState(prev)
      return h.slice(0, -1)
    })
  }, [graph])

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f
      const next = f[0]!
      setPast((h) => [...h, graph])
      setGraphState(next)
      return f.slice(1)
    })
  }, [graph])

  const loadSample = useCallback(() => {
    setGraph(createSampleGraph())
    setSourceId(DEFAULT_SOURCE)
    setDestId(DEFAULT_DEST)
    showToast('Sample network loaded.')
  }, [setGraph, showToast])

  const clearGraph = useCallback(() => {
    setGraph({ nodes: [], edges: [] })
    setSourceId(null)
    setDestId(null)
  }, [setGraph])

  const restoreEdges = useCallback(() => {
    setGraph(restoreAllEdges(graph))
    showToast('All links restored.')
  }, [graph, setGraph, showToast])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(
    (): AppContextValue => ({
      graph,
      setGraph,
      applyGraphOp,
      undo,
      redo,
      canUndo: past.length > 0,
      canRedo: future.length > 0,
      sourceId,
      destId,
      setSourceId,
      setDestId,
      page,
      navigate,
      simulatorMode,
      setSimulatorMode,
      selectedNodeId,
      setSelectedNodeId,
      selectedPathKey,
      setSelectedPathKey,
      snapToGrid,
      setSnapToGrid,
      theme,
      toggleTheme,
      toast,
      showToast,
      projectDetails,
      setProjectDetails,
      loadSample,
      clearGraph,
      restoreEdges,
      prevShortestCost,
      setPrevShortestCost,
      animSpeed,
      setAnimSpeed,
    }),
    [
      graph,
      setGraph,
      applyGraphOp,
      undo,
      redo,
      past.length,
      future.length,
      sourceId,
      destId,
      page,
      navigate,
      simulatorMode,
      selectedNodeId,
      selectedPathKey,
      snapToGrid,
      theme,
      toggleTheme,
      toast,
      showToast,
      projectDetails,
      loadSample,
      clearGraph,
      restoreEdges,
      prevShortestCost,
      animSpeed,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
