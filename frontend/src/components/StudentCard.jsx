import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { memo } from 'react'

const StudentCard = memo(function StudentCard({ student, onExpand }) {
    const getExtension = () => {
        if (student.language === 'javascript') return javascript()
        return python()
    }

    const getStatusColor = () => {
        if (student.status === 'red') return 'bg-red-500'
        if (student.status === 'yellow') return 'bg-yellow-500'
        if (student.status === 'gray') return 'bg-gray-500'
        return 'bg-green-500'
    }

    const handleDownload = () => {
        const ext = student.language === 'javascript' ? 'js' : 'py'
        const blob = new Blob([student.code], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `codigo_${student.userName}.${ext}`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-md p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
                    <h3 className="font-semibold">{student.userName}</h3>
                </div>
                <div>
                    <button 
                        onClick={handleDownload}
                        className="text-xs bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded font-semibold mr-2"
                    >
                        Salvar
                    </button>
                    <button 
                        onClick={() => onExpand(student)}
                        className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded font-semibold"
                    >
                        Corrigir
                    </button>
                </div>
            </div>
            
            <div className="h-48 overflow-hidden rounded border border-gray-600 mt-2">
                <CodeMirror
                    value={student.code || ''}
                    height="100%"
                    theme={vscodeDark}
                    extensions={[getExtension()]}
                    readOnly={true}
                    className="text-sm"
                />
            </div>
        </div>
    )
})

export default StudentCard