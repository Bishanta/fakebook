import './App.css'
import { Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages'
import Login from './pages/login'
import AuthGuardedComponent from './components/AuthGuardedComponent'

function App() {
  return (
    <div>
      <Routes>
        <Route element={<AuthGuardedComponent />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </div>

  )
}

export default App
