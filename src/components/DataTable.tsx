import { normalizeDecimalString } from '../utils/numbers'

interface DataTableProps {
  fields: string[]
  amountFields: string[]
  rows: Record<string, string>[]
  onChange: (rows: Record<string, string>[]) => void
  onAddRow: () => void
  onClear: () => void
}

export function DataTable({
  fields,
  amountFields,
  rows,
  onChange,
  onAddRow,
  onClear,
}: DataTableProps) {
  const amountFieldSet = new Set(amountFields)

  const updateCell = (rowIndex: number, field: string, value: string) => {
    const nextRows = rows.map((row, index) =>
      index === rowIndex ? { ...row, [field]: value } : row,
    )
    onChange(nextRows)
  }

  const finalizeCell = (rowIndex: number, field: string, value: string) => {
    if (!amountFieldSet.has(field)) return
    const normalized = normalizeDecimalString(value)
    if (normalized === value) return
    updateCell(rowIndex, field, normalized)
  }

  const deleteRow = (rowIndex: number) => {
    if (rows.length <= 1) {
      onClear()
      return
    }
    onChange(rows.filter((_, index) => index !== rowIndex))
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>表格 A · 原始数据</h2>
          <p className="panel-desc">
            支持多行数据，共 {rows.length} 行 · 粘贴或手动填写
          </p>
        </div>
        <div className="panel-actions">
          <button type="button" className="btn btn-secondary" onClick={onAddRow}>
            添加一行
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClear}>
            清空数据
          </button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="data-table data-table-multi">
          <thead>
            <tr>
              <th className="col-row-num">#</th>
              {fields.map((field) => (
                <th key={field}>{field || '未命名'}</th>
              ))}
              <th className="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="col-row-num">{rowIndex + 1}</td>
                {fields.map((field) => (
                  <td key={field}>
                    <input
                      type="text"
                      value={row[field] ?? ''}
                      onChange={(e) => updateCell(rowIndex, field, e.target.value)}
                      onBlur={(e) => finalizeCell(rowIndex, field, e.target.value)}
                      placeholder={`输入${field || '内容'}`}
                    />
                  </td>
                ))}
                <td className="col-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-compact"
                    onClick={() => deleteRow(rowIndex)}
                    title="删除此行"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
