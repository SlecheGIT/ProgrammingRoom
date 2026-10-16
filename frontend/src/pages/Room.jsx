import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CodeEditor from '../components/CodeEditor'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import socket from '../services/socket'

const DEFAULT_PYTHON = 'print("Bem vindo ao ProgrammingRoom!")'
const DEFAULT_JS = 'console.log("Bem vindo ao ProgrammingRoom!")'

export default function Room() {
    const { id: roomId } = useParams()
    const navigate = useNavigate()
    const [language, setLanguage] = useState(() => localStorage.getItem(`room_${roomId}_lang`) || 'python')
    const [code, setCode] = useState(() => {
        const saved = localStorage.getItem(`room_${roomId}_code`)
        if (saved) return saved
        const lang = localStorage.getItem(`room_${roomId}_lang`) || 'python'
        return lang === 'python' ? DEFAULT_PYTHON : DEFAULT_JS
    })
    const [output, setOutput] = useState('>\n')
    const [isReady, setIsReady] = useState(false)

    const [teacherCode, setTeacherCode] = useState('')
    const [teacherLanguage, setTeacherLanguage] = useState('python')
    const [showTeacherCode, setShowTeacherCode] = useState(false)
    const [teacherCursor, setTeacherCursor] = useState(null)
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [copied, setCopied] = useState(false)

    const [user] = useState(() => JSON.parse(localStorage.getItem('user')) || {})
    const userId = user.id || 'sem-id'
    const userName = user.name || 'Aluno Desconhecido'

    const typingTimerRef = useRef(null)
    const statusRef = useRef('green')

    const updateStatus = (newStatus) => {
        statusRef.current = newStatus
        socket.emit('student_status', { roomId, userId, status: newStatus })
    }

    const resetIdleTimer = () => {
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current)
        }
        typingTimerRef.current = setTimeout(() => {
            if (statusRef.current === 'green') {
                updateStatus('yellow')
            }
        }, 300000)
    }

    useEffect(() => {
        socket.connect()

        const handleConnect = () => {
            socket.emit('join_room', { roomId, userId, userName, role: 'student' })
            socket.emit('code_change', { roomId, userId, code, language })
            updateStatus('green')
            resetIdleTimer()
        }
        
        socket.on('connect', handleConnect)
        if (socket.connected) handleConnect()

        socket.on('room_closed', () => {
            alert('A sala esta fechada ou o professor encerrou a conexao.')
            navigate('/')
        })

        socket.on('force_code_update', (data) => {
            if (data.userId === userId) {
                setCode(data.code)
                if (statusRef.current === 'yellow') updateStatus('green')
                resetIdleTimer()
            }
        })
        
        socket.on('blackboard_update', (data) => {
            setTeacherCode(data.code)
            if (data.language) setTeacherLanguage(data.language)
            setShowTeacherCode(true)
        })

        socket.on('request_code_sync', () => {
            const currentCode = localStorage.getItem(`room_${roomId}_code`) || ''
            const currentLang = localStorage.getItem(`room_${roomId}_lang`) || 'python'
            socket.emit('code_change', { roomId, userId, code: currentCode, language: currentLang })
            socket.emit('student_status', { roomId, userId, status: statusRef.current })
        })

        socket.on('teacher_cursor_moved', (data) => {
            if (data.targetUserId === userId) {
                setTeacherCursor(data.position)
            }
        })

        socket.on('room_joined', () => {
            setIsAuthorized(true)
        })

        async function initPython() {
            try {
                window.pyodide = await window.loadPyodide({
                    stdout: (msg) => setOutput((prev) => prev + msg + '\n'),
                    stderr: (msg) => setOutput((prev) => prev + msg + '\n')
                })
                setIsReady(true)
                setOutput('>\n')
            } catch (err) {
                setOutput('erro no python: ' + err.message)
            }
        }
        initPython()

        return () => {
            socket.off('connect', handleConnect)
            socket.off('room_closed')
            socket.off('force_code_update')
            socket.off('blackboard_update')
            socket.off('teacher_cursor_moved')
            socket.off('request_code_sync')
            socket.off('room_joined')
            socket.disconnect()
            if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
            if (window.jsWorker) window.jsWorker.terminate()
        }
    }, [roomId, userId, userName])

    const handleCodeChange = (val) => {
        setCode(val)
        localStorage.setItem(`room_${roomId}_code`, val)
        socket.emit('code_change', { roomId, userId, code: val, language })
        
        if (statusRef.current === 'yellow') {
            updateStatus('green')
        }
        resetIdleTimer()
    }

    const handleRunCode = async () => {
        setOutput('')

        if (language === 'python') {
            if (!isReady) return
            try {
                await window.pyodide.runPythonAsync(code)
                updateStatus('green')
            } catch (err) {
                setOutput((prev) => prev + err.message + '\n')
                updateStatus('red')
            }
            resetIdleTimer()
        } else if (language === 'javascript') {
            if (window.jsWorker) {
                window.jsWorker.terminate()
            }
            
            const workerCode = `
                const console = {
                    log: (...args) => {
                        postMessage({ type: 'log', message: args.join(' ') });
                    }
                };
                try {
                    ${code}
                    postMessage({ type: 'success' });
                } catch (err) {
                    postMessage({ type: 'error', message: err.toString() });
                }
            `;
            
            const blob = new Blob([workerCode], { type: 'application/javascript' })
            const worker = new Worker(URL.createObjectURL(blob))
            window.jsWorker = worker
            
            worker.onmessage = (e) => {
                const data = e.data
                if (data.type === 'log') {
                    setOutput((prev) => prev + data.message + '\n')
                } else if (data.type === 'error') {
                    setOutput((prev) => prev + data.message + '\n')
                    updateStatus('red')
                } else if (data.type === 'success') {
                    updateStatus('green')
                }
            }
            
            setTimeout(() => {
                if (window.jsWorker === worker) {
                    worker.terminate()
                }
            }, 10000)
            
            resetIdleTimer()
        }
    }

    const handleLanguageChange = (e) => {
        const newLang = e.target.value
        setLanguage(newLang)
        localStorage.setItem(`room_${roomId}_lang`, newLang)
        
        let nextCode = code
        if (code === DEFAULT_PYTHON || code === DEFAULT_JS) {
            nextCode = newLang === 'python' ? DEFAULT_PYTHON : DEFAULT_JS
        }
        
        setCode(nextCode)
        localStorage.setItem(`room_${roomId}_code`, nextCode)
        socket.emit('code_change', { roomId, userId, code: nextCode, language: newLang })
        
        if (statusRef.current === 'yellow') {
            updateStatus('green')
        }
        resetIdleTimer()
        setOutput('>\n')
    }

    const getExtension = () => {
        return language === 'javascript' ? javascript() : python()
    }

    const handleLeaveRoom = () => {
        navigate('/')
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(roomId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-400 flex items-center justify-center">
                <p>carregando...</p>
            </div>
        )
    }

    return (
        <div className="h-screen bg-gray-900 text-white flex flex-col">
            <header className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 
                        onClick={handleCopy}
                        className="text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors"
                        title="Copiar codigo da sala"
                    >
                        Sala: {copied ? 'Copiado!' : roomId}
                    </h1>
                    <span className="text-gray-400 text-sm">Aluno: {userName}</span>
                    <select 
                        value={language}
                        onChange={handleLanguageChange}
                        className="bg-gray-700 border border-gray-600 text-sm rounded px-3 py-1 outline-none"
                    >
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                    </select>
                </div>
                <div>
                    <button 
                        onClick={() => setShowTeacherCode(!showTeacherCode)}
                        className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-semibold text-sm mr-4 transition-colors"
                    >
                        {showTeacherCode ? 'Ocultar Quadro Global' : 'Mostrar Quadro Global'}
                    </button>
                    <button 
                        onClick={handleRunCode}
                        disabled={language === 'python' && !isReady}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-6 py-2 rounded font-semibold mr-4"
                    >
                        Executar Codigo
                    </button>
                    <button onClick={handleLeaveRoom} className="text-sm text-red-400 hover:text-red-300 font-semibold underline">
                        Sair da Sala
                    </button>
                </div>
            </header>
            
            <main className="flex-1 flex p-3 gap-3 overflow-hidden">
                <div className="flex-1 bg-[#1e1e1e] rounded-md border border-gray-700 p-3 flex flex-col overflow-hidden">
                    <h2 className="text-sm text-gray-400 mb-2 uppercase font-semibold tracking-wider">Editor</h2>
                    <div className="flex-1 overflow-hidden relative">
                        <CodeEditor 
                            value={code} 
                            onChange={handleCodeChange} 
                            remoteCursorPos={teacherCursor} 
                            language={language} 
                        />
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                    {showTeacherCode && (
                        <div className="flex-1 bg-[#1e1e1e] rounded-md border border-gray-700 p-3 flex flex-col overflow-hidden">
                            <h2 className="text-sm text-gray-400 mb-2 uppercase font-semibold tracking-wider">Quadro Global</h2>
                            <div className="flex-1 overflow-hidden relative">
                                <CodeMirror
                                    value={teacherCode}
                                    height="100%"
                                    theme={vscodeDark}
                                    extensions={[teacherLanguage === 'javascript' ? javascript() : python()]}
                                    readOnly={true}
                                    className="absolute inset-0 text-sm h-full"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex-1 bg-black rounded-md border border-gray-700 p-3 overflow-hidden flex flex-col">
                        <h2 className="text-sm text-gray-400 mb-2 uppercase font-semibold tracking-wider">Terminal</h2>
                        <pre className="font-mono text-sm text-gray-300 flex-1 overflow-auto whitespace-pre-wrap">{output}</pre>
                    </div>
                </div>
            </main>
        </div>
    )
}
