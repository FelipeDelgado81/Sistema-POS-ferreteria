import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <h1 className="text-2xl font-bold text-gray-800"> Login exitoso</h1>
        <p className="text-gray-500 mt-2">Dashboard en construccion...</p>
        <button
          onClick={() => {
            localStorage.removeItem('usuario')
            window.location.href = '/login'
          }}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

function App() {
  const usuario = localStorage.getItem('usuario')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={usuario ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App