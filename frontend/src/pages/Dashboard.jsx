import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
    const [roomCode, setRoomCode] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const user = JSON.parse(localStorage.getItem('user')) || {}

    const handleCreateRoom = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/rooms/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            })
            if (!res.ok) throw new Error('Falha ao gerar sala.')
            const data = await res.json()
            navigate(`/teacher/room/${data.roomId}`)
        } catch (err) {
            setError(err.message)
        }
    }

    const handleJoinRoom = async (e) => {
        e.preventDefault()
        if (!roomCode.trim()) return
        setError('')
        
        try {
            const res = await fetch(`http://localhost:3000/api/rooms/validate/${roomCode.trim()}`)
            if (!res.ok) {
                throw new Error('A sala informada nao existe ou foi encerrada.')
            }
            navigate(`/room/${roomCode.trim()}`)
        } catch (err) {
            setError(err.message)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('user')
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative">
            <div className="absolute top-6 right-6 flex items-center gap-4">
                <span className="text-gray-400">ola, {user.name}</span>
                <button 
                    onClick={handleLogout} 
                    className="text-sm text-red-400 hover:text-red-300 font-semibold underline"
                >
                    sair
                </button>
            </div>

            <h1 className="text-4xl font-bold mb-10 tracking-wider">ProgrammingRoom</h1>
            
            {error && (
                <div className="mb-6 w-full max-w-3xl bg-red-500/20 border border-red-500 text-red-400 p-4 rounded text-center font-semibold">
                    {error}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl bg-gray-800 p-10 rounded-xl border border-gray-700 shadow-2xl">
                {/* secao do professor */}
                <div className="flex-1 flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-700 pb-8 md:pb-0 md:pr-8">
                    <h2 className="text-2xl font-bold text-green-400 mb-4 uppercase tracking-wide">Criar Sala</h2>
                    <p className="text-gray-400 text-center mb-8">Crie ambiente de programacao para instruir seus alunos.</p>
                    <button 
                        onClick={handleCreateRoom}
                        className="w-full bg-green-600 hover:bg-green-700 px-6 py-4 rounded font-bold text-lg transition-colors mt-auto"
                    >
                        Criar Nova Sala
                    </button>
                </div>

                {/* secao do aluno */}
                <div className="flex-1 flex flex-col items-center pt-8 md:pt-0 md:pl-8">
                    <h2 className="text-2xl font-bold text-blue-400 mb-4 uppercase tracking-wide">Entrar em uma sala</h2>
                    <p className="text-gray-400 text-center mb-8">Digite o codigo de uma sala existente para entrar no ambiente.</p>
                    <form onSubmit={handleJoinRoom} className="w-full flex flex-col gap-4 mt-auto">
                        <input 
                            type="text" 
                            placeholder="codigo (ex: ABC123)" 
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-4 text-center text-white outline-none focus:border-blue-500 font-mono tracking-widest text-lg"
                        />
                        <button 
                            type="submit"
                            disabled={!roomCode.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-4 rounded font-bold text-lg transition-colors"
                        >
                            Entrar na Sala
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}