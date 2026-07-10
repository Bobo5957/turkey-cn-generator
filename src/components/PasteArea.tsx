import { useState } from 'react'
import { parseClipboardPaste, parseTsvPaste } from '../utils/parse'

interface PasteAreaProps {
  tableAFields: string[]
  onParsed: (rows: Record<string, string>[]) => void
}

export function PasteArea({ tableAFields, onParsed }: PasteAreaProps) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const applyParseResult = (result: ReturnType<typeof parseTsvPaste>) => {
    if (!result || result.rows.length === 0) {
      setSuccess('')
      setError('无法解析：请粘贴表头+数据行，或粘贴一行/多行数据')
      return false
    }

    setError('')
    setSuccess(
      `已解析 ${result.rows.length} 行，按表格配置中的 ${tableAFields.length} 个字段映射`,
    )
    onParsed(result.rows)
    setText('')
    return true
  }

  const handleParse = () => {
    applyParseResult(parseTsvPaste(text, tableAFields))
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const plainText = event.clipboardData.getData('text/plain')
    const htmlText = event.clipboardData.getData('text/html')
    const result = parseClipboardPaste(plainText, htmlText, tableAFields)

    if (result) {
      event.preventDefault()
      applyParseResult(result)
      return
    }

    setSuccess('')
    setError('')
  }

  const handleClear = () => {
    setText('')
    setError('')
    setSuccess('')
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>粘贴数据</h2>
          <p className="panel-desc">
            从 Excel 复制后直接 Ctrl+V 粘贴；表头行会被忽略，数据按列顺序映射到表格 A 配置字段
          </p>
        </div>
        <div className="panel-actions">
          <button type="button" className="btn btn-ghost" onClick={handleClear}>
            清空
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleParse}>
            手动解析
          </button>
        </div>
      </div>
      <textarea
        className="paste-input"
        value={text}
        onPaste={handlePaste}
        onChange={(e) => {
          setText(e.target.value)
          if (error) setError('')
          if (success) setSuccess('')
        }}
        rows={4}
        placeholder={'从 Excel 复制后在此粘贴（支持表头+多行数据，或仅数据行）'}
        spellCheck={false}
      />
      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}
    </section>
  )
}
