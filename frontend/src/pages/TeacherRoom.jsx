import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import socket from '../services/socket'
import StudentCard from '../components/StudentCard'
import CodeEditor from '../components/CodeEditor'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const DEFAULT_PYTHON = 'print("Bem vindo ao ProgrammingRoom!")'
const DEFAULT_JS = 'console.log("Bem vindo ao ProgrammingRoom!")'

export default function TeacherRoom() {
    const { id: roomId } = useParams()
    const navigate = useNavigate()
    const [students, setStudents] = useState({})
    const [expandedStudent, setExpandedStudent] = useState(null)
    
    const [showBlackboard, setShowBlackboard] = useState(false)
    const [blackboardLanguage, setBlackboardLanguage] = useState(() => localStorage.getItem(`room_${roomId}_teacher_lang`) || 'python')
    const [blackboardCode, setBlackboardCode] = useState(() => localStorage.getItem(`room_${roomId}_teacher_code`) || (localStorage.getItem(`room_${roomId}_teacher_lang`) === 'javascript' ? DEFAULT_JS : DEFAULT_PYTHON))
    const [showTerminal, setShowTerminal] = useState(false)
    const [terminalOutput, setTerminalOutput] = useState('>\n')
    const [isPyodideReady, setIsPyodideReady] = useState(false)
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [copied, setCopied] = useState(false)

    const [user] = useState(() => JSON.parse(localStorage.getItem('user')) || {})
    const userId = user.id
    const userName = user.name

    const handleExpandStudent = useCallback((student) => {
        setExpandedStudent(student)
    }, [])

    useEffect(() => {
        socket.connect()

        const handleConnect = () => {
            socket.emit('join_room', { roomId, userId, userName: `${userName} (Prof)`, role: 'teacher' })
        }
        
        socket.on('connect', handleConnect)
        if (socket.connected) handleConnect()

        socket.on('room_closed', () => {
            navigate('/')
        })

        socket.on('sync_students', (studentList) => {
            setStudents((prev) => {
                const newState = { ...prev }
                studentList.forEach(s => {
                    if (!newState[s.userId]) {
                        newState[s.userId] = { ...s, code: '', language: 'python', status: 'green' }
                    } else {
                        newState[s.userId].status = 'green'
                    }
                })
                return newState
            })
        })

        socket.on('user_joined', (data) => {
            if (data.userId === userId) return
            setStudents((prev) => {
                const existing = prev[data.userId]
                if (existing && existing.code) {
                    return {
                        ...prev,
                        [data.userId]: { ...existing, status: 'green' }
                    }
                }
                return {
                    ...prev,
                    [data.userId]: { ...data, code: '', language: 'python', status: 'green' }
                }
            })
        })

        socket.on('code_update', (data) => {
            setStudents((prev) => {
                if (!prev[data.userId]) return prev
                return {
                    ...prev,
                    [data.userId]: { ...prev[data.userId], code: data.code, language: data.language }
                }
            })
            
            setExpandedStudent((prev) => {
                if (prev && prev.userId === data.userId) {
                    return { ...prev, code: data.code }
                }
                return prev
            })
        })

        socket.on('status_update', (data) => {
            setStudents((prev) => {
                if (!prev[data.userId]) return prev
                return {
                    ...prev,
                    [data.userId]: { ...prev[data.userId], status: data.status }
                }
            })
        })

        socket.on('user_left', (data) => {
            setStudents((prev) => {
                if (!prev[data.userId]) return prev
                return {
                    ...prev,
                    [data.userId]: { ...prev[data.userId], status: 'gray' }
                }
            })
        })

        socket.on('room_joined', () => {
            setIsAuthorized(true)
        })

        async function initPython() {
            try {
                window.pyodide = await window.loadPyodide({
                    stdout: (msg) => setTerminalOutput((prev) => prev + msg + '\n'),
                    stderr: (msg) => setTerminalOutput((prev) => prev + msg + '\n')
                })
                setIsPyodideReady(true)
                setTerminalOutput('>\n')
            } catch (err) {
                setTerminalOutput('erro ao carregar python: ' + err.message)
            }
        }
        initPython()

        return () => {
            socket.off('connect', handleConnect)
            socket.off('room_closed')
            socket.off('room_joined')
            socket.off('sync_students')
            socket.off('user_joined')
            socket.off('code_update')
            socket.off('status_update')
            socket.off('user_left')
            socket.disconnect()
            if (window.teacherJsWorker) window.teacherJsWorker.terminate()
        }
    }, [roomId, userId, userName])

    const handleTeacherEdit = (newCode) => {
        setExpandedStudent((prev) => ({ ...prev, code: newCode }))
        setStudents((prev) => ({
            ...prev,
            [expandedStudent.userId]: { ...prev[expandedStudent.userId], code: newCode }
        }))
        
        socket.emit('teacher_code_change', {
            roomId,
            userId: expandedStudent.userId,
            code: newCode
        })
    }

    const handleCursorChange = (pos) => {
        socket.emit('teacher_cursor', {
            roomId,
            userId: expandedStudent.userId,
            position: pos
        })
    }

    const handleBlackboardChange = (val) => {
        setBlackboardCode(val)
        localStorage.setItem(`room_${roomId}_teacher_code`, val)
    }

    const handleBlackboardLangChange = (e) => {
        const newLang = e.target.value
        setBlackboardLanguage(newLang)
        localStorage.setItem(`room_${roomId}_teacher_lang`, newLang)
        
        let nextCode = blackboardCode
        if (blackboardCode === DEFAULT_PYTHON || blackboardCode === DEFAULT_JS) {
            nextCode = newLang === 'python' ? DEFAULT_PYTHON : DEFAULT_JS
        }
        
        setBlackboardCode(nextCode)
        localStorage.setItem(`room_${roomId}_teacher_code`, nextCode)
        setTerminalOutput('>\n')
    }

    const handleBroadcast = () => {
        socket.emit('broadcast_code', { roomId, code: blackboardCode, language: blackboardLanguage })
    }

    const handleRunTeacherCode = async () => {
        setTerminalOutput('')
        setShowTerminal(true)
        
        if (blackboardLanguage === 'python') {
            if (!isPyodideReady) {
                setTerminalOutput('aguarde o carregamento do ambiente python.\n')
                return
            }
            try {
                await window.pyodide.runPythonAsync(blackboardCode)
            } catch (err) {
                setTerminalOutput((prev) => prev + err.message + '\n')
            }
        } else if (blackboardLanguage === 'javascript') {
            if (window.teacherJsWorker) {
                window.teacherJsWorker.terminate()
            }
            const workerCode = `
                const console = { log: (...args) => postMessage({ type: 'log', message: args.join(' ') }) };
                try {
                    ${blackboardCode}
                    postMessage({ type: 'success' });
                } catch (err) {
                    postMessage({ type: 'error', message: err.toString() });
                }
            `;
            const blob = new Blob([workerCode], { type: 'application/javascript' })
            const worker = new Worker(URL.createObjectURL(blob))
            window.teacherJsWorker = worker
            
            worker.onmessage = (e) => {
                if (e.data.type === 'log' || e.data.type === 'error') {
                    setTerminalOutput(prev => prev + e.data.message + '\n')
                }
            }
            setTimeout(() => {
                if (window.teacherJsWorker === worker) worker.terminate()
            }, 10000)
        }
    }

    const handleDownloadAll = () => {
        const zip = new JSZip()
        Object.values(students).forEach((student) => {
            const ext = student.language === 'javascript' ? 'js' : 'py'
            const filename = `codigo_${student.userName}_${student.userId.substring(0,4)}.${ext}`
            zip.file(filename, student.code || '')
        })
        zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, `sala_${roomId}_codigos.zip`)
        })
    }

    const handleLeaveRoom = () => {
        navigate('/')
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-400 flex items-center justify-center">
                <p>carregando...</p>
            </div>
        )
    }

    if (expandedStudent) {
        return (
            <div className="h-screen bg-gray-900 text-white flex flex-col">
                <header className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-blue-400">Pair Programming</h1>
                        <p className="text-sm text-gray-400">corrigindo codigo de: {expandedStudent.userName}</p>
                    </div>
                    <button 
                        onClick={() => setExpandedStudent(null)}
                        className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-semibold"
                    >
                        Sair da Correcao
                    </button>
                </header>
                <main className="flex-1 p-4">
                    <div className="h-full rounded border border-gray-600 overflow-hidden">
                        <CodeEditor 
                            value={expandedStudent.code} 
                            onChange={handleTeacherEdit} 
                            onCursorChange={handleCursorChange}
                            language={expandedStudent.language} 
                        />
                    </div>
                </main>
            </div>
        )
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(roomId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col">
            <header className="mb-6 flex justify-between items-center border-b border-gray-700 pb-4">
                <div>
                    <h1 
                        onClick={handleCopy} 
                        className="text-2xl font-bold cursor-pointer hover:text-gray-300 transition-colors" 
                        title="Copiar codigo da sala"
                    >
                        Painel do Professor - Sala {copied ? 'Copiado!' : roomId}
                    </h1>
                    <span className="text-gray-400 text-sm">Professor: {userName}</span>
                </div>
                <div>
                    <button 
                        onClick={handleDownloadAll}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold text-sm mr-4"
                    >
                        Baixar Codigos
                    </button>
                    <button 
                        onClick={() => setShowBlackboard(!showBlackboard)}
                        className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-semibold text-sm mr-4"
                    >
                        {showBlackboard ? 'Ocultar Quadro Global' : 'Mostrar Quadro Global'}
                    </button>
                    <button onClick={handleLeaveRoom} className="text-sm text-red-400 hover:text-red-300 font-semibold underline">
                        Sair da Sala
                    </button>
                </div>
            </header>

            {showBlackboard && (
                <section className="bg-gray-800 border border-gray-700 rounded-md mb-6 transition-all duration-300 flex flex-col overflow-hidden h-96">
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                        <h2 className="text-lg font-bold text-green-400">Quadro Global</h2>
                        <div className="flex gap-2 items-center">
                            <select 
                                value={blackboardLanguage}
                                onChange={handleBlackboardLangChange}
                                className="bg-gray-700 border border-gray-600 text-sm rounded px-3 py-1 outline-none text-white mr-2"
                            >
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                            </select>
                            <button onClick={handleRunTeacherCode} className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-sm font-semibold">
                                Executar codigo
                            </button>
                            <button onClick={() => setShowTerminal(!showTerminal)} className="bg-gray-600 hover:bg-gray-700 px-4 py-1 rounded text-sm font-semibold">
                                {showTerminal ? 'Ocultar Terminal' : 'Mostrar Terminal'}
                            </button>
                            <button onClick={handleBroadcast} className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm font-semibold">
                                Enviar aos Alunos
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden p-1 flex gap-1">
                        <div className="flex-1 rounded border border-gray-600 overflow-hidden relative">
                            <CodeEditor value={blackboardCode} onChange={handleBlackboardChange} language={blackboardLanguage} />
                        </div>
                        {showTerminal && (
                            <div className="w-1/3 bg-black rounded border border-gray-600 p-2 flex flex-col overflow-hidden">
                                <h3 className="text-xs text-gray-400 mb-1 uppercase font-semibold">Terminal</h3>
                                <pre className="font-mono text-sm text-gray-300 flex-1 overflow-auto whitespace-pre-wrap">{terminalOutput}</pre>
                            </div>
                        )}
                    </div>
                </section>
            )}

            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 content-start">
                {Object.values(students).length === 0 ? (
                    <p className="text-gray-400">nenhum aluno conectado.</p>
                ) : (
                    Object.values(students).map((student) => (
                        <StudentCard 
                            key={student.userId} 
                            student={student} 
                            onExpand={handleExpandStudent} 
                        />
                    ))
                )}
            </main>
        </div>
    )
}
