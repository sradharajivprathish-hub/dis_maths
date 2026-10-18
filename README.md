# NetRoute

**Interactive Network Routing and Path Analysis System Using Discrete Mathematics**

NetRoute is a client-side educational web app that models communication networks as undirected weighted graphs. Edit topologies, enumerate simple paths, run Dijkstra and BFS, explore permutations/combinations, and walk through an induction proof — with SVG visualization and a visual-only packet animation.

## Features

- Dashboard with live stats from graph state
- Network simulator (select, add, connect, delete) with undo/redo
- Route analysis: path tables, failure simulation, packet animation
- Permutations & combinations lab (`BigInt` exact arithmetic)
- Mathematical induction walkthrough for \(n!\)
- Algorithm comparison (DFS enumeration vs BFS vs Dijkstra)
- Dark/light theme (persisted in `localStorage`)

## Technologies

React 19, TypeScript (strict), Vite 8, Tailwind CSS 4, lucide-react, SVG canvas, Vitest.

## Folder structure

```
src/
  algorithms/   # DFS enumeration, Dijkstra, BFS, connectivity
  components/   # Layout, graph canvas, results panel
  data/         # Sample network A–F
  graph/        # Pure graph operations & validation
  hooks/        # App state, analysis, packet animation
  math/         # Factorial, P, C
  pages/        # Route views
  types/
```

## Installation & commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run test
```

## Algorithms

### Simple paths (DFS + backtracking)

Enumerates simple paths over **active** edges only. Default cap: 500 paths; when truncated, UI shows **at least N**. Source equals destination: one trivial path of cost 0 and hop count 0.

### Dijkstra (O(V²) array version)

Non-negative weights only. Tie-breaking: settle lexicographically smallest label when distances tie; count equal-cost shortest routes.

### BFS

Minimum-hop route (ignores weights for routing, reports hop count and incidental total weight).

## Mathematical notes

- \(0! = 1\), \(P(n,r) = n!/(n-r)!\), \(C(n,r)\) via multiplicative formula with `min(r, n-r)`.
- **Arrangement disclaimer:** factorial counts unrestricted arrangements; it is not automatically the number of valid paths in a network. Path counts depend on **topology**.

## Deployment (Vercel)

Push to GitHub, import in Vercel, preset **Vite**, build `npm run build`, output `dist`. No environment variables required.

## Known limitations

- Exhaustive path enumeration is exponential — intended for small graphs.
- Dijkstra rejects negative edge weights.
- Step-by-step Dijkstra trace UI is minimal on the comparison page (full trace is a future enhancement).
- No graph import/export yet.

## License

MIT (placeholder — add your institution’s requirements if different.)
