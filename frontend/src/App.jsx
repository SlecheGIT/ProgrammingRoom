import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Room from './pages/Room'
import TeacherRoom from './pages/TeacherRoom'
import Auth from './pages/Auth'

const ProtectedRoute = ({ children }) => {
    const user = localStorage.getItem('user')
    if (!user) return <Navigate to="/login" replace />
    return children
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Auth />} />
                
                <Route path="/" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                
                <Route path="/room/:id" element={
                    <ProtectedRoute>
                        <Room />
                    </ProtectedRoute>
                } />
                
                <Route path="/teacher/room/:id" element={
                    <ProtectedRoute>
                        <TeacherRoom />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    )
}