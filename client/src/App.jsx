import { AuthProvider } from './context/AuthContext.jsx'
import { AppRouter } from './router/AppRouter.jsx'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App
