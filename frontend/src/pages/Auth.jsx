import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const url = isLogin ? 'http://localhost:3000/api/users/login' : 'http://localhost:3000/api/users/register'
        const payload = isLogin ? { email, password } : { name, email, password }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.erro || 'Falha na autenticacao')
            }

            // salva no localStorage
            localStorage.setItem('user', JSON.stringify({ id: data.id, name: data.name }))
            
            // redireciona para o dashboard principal
            navigate('/')
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-lg border border-gray-700 p-8 shadow-xl">
                <h1 className="text-2xl font-bold text-white text-center mb-6">
                    {isLogin ? 'Entrar no ProgrammingRoom' : 'Criar Nova Conta'}
                </h1>
                
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Nome Completo</label>
                            <input 
                                type="text" 
                                required 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white outline-none focus:border-blue-500"
                            />
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">E-mail</label>
                        <input 
                            type="email" 
                            required 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Senha</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 pr-20 text-white outline-none focus:border-blue-500"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        {isLogin ? 'Entrar' : 'Cadastrar'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400">
                    {isLogin ? 'Ainda nao tem conta?' : 'Ja possui uma conta?'}
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="ml-2 text-blue-400 hover:underline font-semibold"
                    >
                        {isLogin ? 'Cadastre-se' : 'Faca login'}
                    </button>
                </p>
            </div>
        </div>
    )
}
