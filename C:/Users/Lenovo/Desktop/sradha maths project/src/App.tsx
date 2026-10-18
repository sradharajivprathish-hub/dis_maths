import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { AppShell } from './components/layout/AppShell.tsx'
import { AppProvider, useApp } from './hooks/AppProvider.tsx'
import { AboutPage } from './pages/AboutPage.tsx'
import { CombinatoricsPage } from './pages/CombinatoricsPage.tsx'
import { ComparisonPage } from './pages/ComparisonPage.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { InductionPage } from './pages/InductionPage.tsx'
import { RouteAnalysisPage } from './pages/RouteAnalysisPage.tsx'
import { SimulatorPage } from './pages/SimulatorPage.tsx'

function Router() {
  const { page } = useApp()
  switch (page) {
    case 'simulator':
      return <SimulatorPage />
    case 'routes':
      return <RouteAnalysisPage />
    case 'combinatorics':
      return <CombinatoricsPage />
    case 'induction':
      return <InductionPage />
    case 'comparison':
      return <ComparisonPage />
    case 'about':
      return <AboutPage />
    default:
      return <DashboardPage />
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppShell>
          <Router />
        </AppShell>
      </AppProvider>
    </ErrorBoundary>
  )
}
