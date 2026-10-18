import {
  Activity,
  BookOpen,
  FlaskConical,
  GitCompare,
  LayoutDashboard,
  Menu,
  Network,
  Route,
  SunMoon,
  X,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useApp } from '../../hooks/AppProvider.tsx'
import type { PageId } from '../../types/app.ts'

const NAV: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'simulator', label: 'Network Simulator', icon: Network },
  { id: 'routes', label: 'Route Analysis', icon: Route },
  { id: 'combinatorics', label: 'Permutations & Combinations', icon: FlaskConical },
  { id: 'induction', label: 'Mathematical Induction', icon: BookOpen },
  { id: 'comparison', label: 'Algorithm Comparison', icon: GitCompare },
  { id: 'about', label: 'About Project', icon: Activity },
]

function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="14" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" />
      <circle cx="10" cy="12" r="3" fill="var(--surface-raised)" stroke="var(--accent)" />
      <circle cx="22" cy="12" r="3" fill="var(--surface-raised)" stroke="var(--accent)" />
      <circle cx="16" cy="22" r="3" fill="var(--surface-raised)" stroke="var(--accent-teal)" />
      <path d="M10 12 L16 22 L22 12" stroke="var(--border)" strokeWidth="1.2" fill="none" />
    </svg>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { page, navigate, toggleTheme, toast } = useApp()
  const [drawer, setDrawer] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  const NavButton = ({ id, label, icon: Icon }: (typeof NAV)[0]) => (
    <button
      type="button"
      onClick={() => {
        navigate(id)
        setDrawer(false)
      }}
      className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
        page === id
          ? 'bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[var(--text)] ring-1 ring-[var(--accent)]'
          : 'text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]'
      }`}
    >
      <Icon size={18} aria-hidden />
      {label}
    </button>
  )

  return (
    <div className="flex min-h-full flex-col bg-[var(--bg)]">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          className="rounded-lg border border-[var(--border)] p-2 lg:hidden"
          aria-label="Open menu"
          onClick={() => setDrawer(true)}
        >
          <Menu size={20} />
        </button>
        <Logo />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight">NetRoute</h1>
          <p className="truncate text-xs text-[var(--text-muted)]">
            Interactive routing &amp; discrete mathematics lab
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
          onClick={() => setInfoOpen(true)}
        >
          About
        </button>
        <button
          type="button"
          className="rounded-lg border border-[var(--border)] p-2"
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          <SunMoon size={18} />
        </button>
      </header>

      <div className="flex flex-1">
        <nav
          className="hidden w-64 shrink-0 flex-col gap-1 border-r border-[var(--border)] bg-[var(--surface)] p-3 lg:flex"
          aria-label="Main"
        >
          {NAV.map((item) => (
            <NavButton key={item.id} {...item} />
          ))}
          <p className="mt-auto px-2 pt-4 text-[10px] text-[var(--text-muted)]">
            Undirected, weighted, simple graph (no self-loops or parallel edges).
          </p>
        </nav>

        {drawer && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal>
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Close menu"
              onClick={() => setDrawer(false)}
            />
            <div className="absolute left-0 top-0 flex h-full w-[min(100%,280px)] flex-col gap-1 bg-[var(--surface)] p-3 shadow-xl">
              <div className="mb-2 flex justify-end">
                <button type="button" aria-label="Close" onClick={() => setDrawer(false)}>
                  <X />
                </button>
              </div>
              {NAV.map((item) => (
                <NavButton key={item.id} {...item} />
              ))}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 pb-20 lg:pb-4">{children}</main>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 flex justify-around border-t border-[var(--border)] bg-[var(--surface)] p-1 lg:hidden"
        aria-label="Mobile"
      >
        {NAV.slice(0, 5).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            className={`flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 px-1 text-[10px] ${
              page === id ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
            }`}
            aria-label={label}
            onClick={() => navigate(id)}
          >
            <Icon size={18} />
          </button>
        ))}
      </nav>

      {infoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close dialog"
            onClick={() => setInfoOpen(false)}
          />
          <div className="relative max-w-md rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-lg font-semibold">NetRoute</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Educational tool for graph-based routing, path enumeration, Dijkstra, BFS, combinatorics,
              and induction. Packet motion is a visual simulation only — no real traffic is routed.
            </p>
            <button
              type="button"
              className="mt-4 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white"
              onClick={() => setInfoOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-20 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2 text-sm shadow-lg lg:bottom-6"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
