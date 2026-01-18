import { WeeklyView } from './pages/WeeklyView'
import { OAuthCallback } from './pages/OAuthCallback'

function App() {
  // Simple routing based on pathname
  const path = window.location.pathname;

  if (path === '/oauth/callback') {
    return <OAuthCallback />;
  }

  return <WeeklyView />;
}

export default App
