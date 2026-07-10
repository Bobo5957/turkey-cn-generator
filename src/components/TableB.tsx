import { useState } from 'react'
import { getTableBFieldNames, tableBRowsToTsv, hasTableBData } from '../utils/tableB'
import type { TableConfig } from '../types'

interface TableBProps {
  tableBRows: Record<string, string>[]
  tableConfig: TableConfig
  compact?: boolean
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

export function TableB({ tableBRows, tableConfig, compact = false }: TableBProps) {
  const [copiedRow, setCopiedRow] = useState(false)
  const [copiedFull, setCopiedFull] = useState(false)
  const fieldNames = getTableBFieldNames(tableConfig)

  const handleCopyRow = async () => {
    await copyText(tableBRowsToTsv(tableBRows, fieldNames, false))
    setCopiedRow(true)
    setTimeout(() => setCopiedRow(false), 2000)
  }

  const handleCopyFull = async () => {
    await copyText(tableBRowsToTsv(tableBRows, fieldNames, true))
    setCopiedFull(true)
    setTimeout(() => setCopiedFull(false), 2000)
  }

  const hasData = hasTableBData(tableBRows, fieldNames)

  return (
    <section className={`panel panel-table-b${compact ? ' panel-nested' : ''}`}>
      <div className="panel-header">
        <div>
          <h2>{compact ? '表格 B' : '表格 B · 转换结果'}</h2>
          {!compact && (
            <p className="panel-desc">由表格 A 自动计算生成，可直接复制粘贴到 Excel</p>
          )}
        </div>
        <div className="panel-actions">
          <button
            type="button"
            className={`btn btn-secondary ${copiedRow ? 'copied' : ''}`}
            onClick={handleCopyRow}
            disabled={!hasData}
          >
            {copiedRow ? '✓ 已复制数据行' : '复制数据行'}
          </button>
          <button
            type="button"
            className={`btn btn-primary ${copiedFull ? 'copied' : ''}`}
            onClick={handleCopyFull}
            disabled={!hasData}
          >
            {copiedFull ? '✓ 已复制完整表' : '复制完整表'}
          </button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="data-table table-b">
          <thead>
            <tr>
              {fieldNames.map((field) => (
                <th key={field}>{field}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableBRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {fieldNames.map((field) => (
                  <td key={field}>
                    <span className="table-b-cell">{row[field] || '—'}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
