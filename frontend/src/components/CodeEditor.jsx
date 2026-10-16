import { useRef, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { Decoration, EditorView, WidgetType } from '@codemirror/view'
import { StateField, StateEffect } from '@codemirror/state'

class CursorWidget extends WidgetType {
    toDOM() {
        const span = document.createElement('span')
        span.style.position = 'relative'
        span.style.borderLeft = '2px solid #3b82f6'
        span.style.marginLeft = '-1px'
        span.style.marginRight = '-1px'
        span.style.display = 'inline-block'
        span.style.height = '1.2em'
        span.style.verticalAlign = 'middle'
        
        const dot = document.createElement('div')
        dot.style.position = 'absolute'
        dot.style.top = '-4px'
        dot.style.left = '-3px'
        dot.style.width = '6px'
        dot.style.height = '6px'
        dot.style.backgroundColor = '#3b82f6'
        dot.style.borderRadius = '50%'
        
        span.appendChild(dot)
        return span
    }
}

const setRemoteCursor = StateEffect.define()

const remoteCursorField = StateField.define({
    create() {
        return Decoration.none
    },
    update(decorations, tr) {
        decorations = decorations.map(tr.changes)
        for (let e of tr.effects) {
            if (e.is(setRemoteCursor)) {
                if (e.value === null) return Decoration.none
                return Decoration.set([
                    Decoration.widget({
                        widget: new CursorWidget(),
                        side: 1
                    }).range(e.value)
                ])
            }
        }
        return decorations
    },
    provide: f => EditorView.decorations.from(f)
})

export default function CodeEditor({ value, onChange, language, onCursorChange, remoteCursorPos }) {
    const editorRef = useRef(null)

    const getExtension = () => {
        if (language === 'javascript') return javascript()
        return python()
    }

    const cursorListener = EditorView.updateListener.of((update) => {
        if (update.selectionSet && onCursorChange) {
            onCursorChange(update.state.selection.main.head)
        }
    })

    useEffect(() => {
        if (editorRef.current && editorRef.current.view && remoteCursorPos !== undefined && remoteCursorPos !== null) {
            const view = editorRef.current.view
            if (remoteCursorPos >= 0 && remoteCursorPos <= view.state.doc.length) {
                view.dispatch({
                    effects: setRemoteCursor.of(remoteCursorPos)
                })
            }
        }
    }, [remoteCursorPos])

    return (
        <div className="w-full h-full overflow-hidden">
            <CodeMirror
                ref={editorRef}
                value={value}
                height="100%"
                theme={vscodeDark}
                extensions={[getExtension(), remoteCursorField, cursorListener]}
                onChange={onChange}
                className="text-lg h-full"
            />
        </div>
    )
}