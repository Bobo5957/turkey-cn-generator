import type { TableBColumnConfig, TableBMappingType, TableConfig } from '../types'
import {
  TABLE_B_MAPPING_LABELS,
  createEmptyTableBColumn,
} from '../utils/tableConfig'

interface TableConfigPanelProps {
  tableConfig: TableConfig
  onChange: (config: TableConfig) => void
  onReset: () => void
}

const MAPPING_TYPES: TableBMappingType[] = [
  'direct',
  'amount',
  'currency_if',
  'vat_included',
]

export function TableConfigPanel({
  tableConfig,
  onChange,
  onReset,
}: TableConfigPanelProps) {
  const { tableAFields, tableBColumns } = tableConfig

  const updateTableAField = (index: number, value: string) => {
    const nextFields = [...tableAFields]
    nextFields[index] = value
    onChange({ ...tableConfig, tableAFields: nextFields })
  }

  const addTableAField = () => {
    onChange({
      ...tableConfig,
      tableAFields: [...tableAFields, `字段${tableAFields.length + 1}`],
    })
  }

  const removeTableAField = (index: number) => {
    if (tableAFields.length <= 1) return
    onChange({
      ...tableConfig,
      tableAFields: tableAFields.filter((_, i) => i !== index),
    })
  }

  const updateKeyField = (
    key: 'traderField' | 'activityField' | 'currencyField',
    value: string,
  ) => {
    onChange({ ...tableConfig, [key]: value })
  }

  const updateTableBColumn = (
    id: string,
    patch: Partial<TableBColumnConfig>,
  ) => {
    onChange({
      ...tableConfig,
      tableBColumns: tableBColumns.map((column) =>
        column.id === id ? { ...column, ...patch } : column,
      ),
    })
  }

  const addTableBColumn = () => {
    onChange({
      ...tableConfig,
      tableBColumns: [...tableBColumns, createEmptyTableBColumn(tableBColumns.length)],
    })
  }

  const removeTableBColumn = (id: string) => {
    if (tableBColumns.length <= 1) return
    onChange({
      ...tableConfig,
      tableBColumns: tableBColumns.filter((column) => column.id !== id),
    })
  }

  const currencyColumnOptions = tableBColumns.filter(
    (column) => column.mappingType === 'currency_if' || column.mappingType === 'direct',
  )

  return (
    <section className="panel panel-table-config">
      <div className="panel-header">
        <div>
          <h2>表格配置</h2>
          <p className="panel-desc">
            自定义表格 A / B 字段及勾稽关系；粘贴 Excel 时按列位置映射，表头始终使用下方配置
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onReset}>
          恢复默认
        </button>
      </div>

      <div className="table-config-section">
        <div className="table-config-section-header">
          <h3>表格 A 字段</h3>
          <button type="button" className="btn btn-secondary btn-compact" onClick={addTableAField}>
            + 添加列
          </button>
        </div>
        <p className="table-config-hint">
          编辑原始数据列名。从 Excel 粘贴时，第一行表头会被忽略，数据按列顺序填入这些字段。
        </p>
        <div className="fields-grid">
          {tableAFields.map((field, index) => (
            <div key={`${index}-${field}`} className="field-item">
              <span className="field-index">{index + 1}</span>
              <input
                type="text"
                value={field}
                onChange={(e) => updateTableAField(index, e.target.value)}
                placeholder="字段名"
              />
              <button
                type="button"
                className="btn-icon"
                onClick={() => removeTableAField(index)}
                disabled={tableAFields.length <= 1}
                title="删除字段"
                aria-label={`删除字段 ${field}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="table-config-key-fields">
          <label>
            合并分组字段（交易客户）
            <select
              value={tableConfig.traderField}
              onChange={(e) => updateKeyField('traderField', e.target.value)}
            >
              {tableAFields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </label>
          <label>
            合并分组字段（活动客户）
            <select
              value={tableConfig.activityField}
              onChange={(e) => updateKeyField('activityField', e.target.value)}
            >
              {tableAFields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </label>
          <label>
            邮件模板币种字段
            <select
              value={tableConfig.currencyField}
              onChange={(e) => updateKeyField('currencyField', e.target.value)}
            >
              {tableAFields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="table-config-section">
        <div className="table-config-section-header">
          <h3>表格 B 字段与公式</h3>
          <button type="button" className="btn btn-secondary btn-compact" onClick={addTableBColumn}>
            + 添加列
          </button>
        </div>
        <p className="table-config-hint">
          配置表格 B 列名及映射规则。含税公式可引用任意币种列，不受列顺序限制。
        </p>

        <div className="table-b-config-wrapper">
          <table className="table-b-config">
            <thead>
              <tr>
                <th>列名</th>
                <th>映射类型</th>
                <th>配置</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tableBColumns.map((column) => (
                <tr key={column.id}>
                  <td>
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) =>
                        updateTableBColumn(column.id, { name: e.target.value })
                      }
                      placeholder="表格 B 列名"
                    />
                  </td>
                  <td>
                    <select
                      value={column.mappingType}
                      onChange={(e) =>
                        updateTableBColumn(column.id, {
                          mappingType: e.target.value as TableBMappingType,
                        })
                      }
                    >
                      {MAPPING_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {TABLE_B_MAPPING_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {column.mappingType === 'direct' && (
                      <label className="config-inline">
                        来源字段
                        <select
                          value={column.sourceField ?? ''}
                          onChange={(e) =>
                            updateTableBColumn(column.id, { sourceField: e.target.value })
                          }
                        >
                          <option value="">选择字段</option>
                          {tableAFields.map((field) => (
                            <option key={field} value={field}>
                              {field}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                    {column.mappingType === 'amount' && (
                      <label className="config-inline">
                        金额来源
                        <select
                          value={column.sourceField ?? ''}
                          onChange={(e) =>
                            updateTableBColumn(column.id, { sourceField: e.target.value })
                          }
                        >
                          <option value="">选择字段</option>
                          {tableAFields.map((field) => (
                            <option key={field} value={field}>
                              {field}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                    {column.mappingType === 'currency_if' && (
                      <div className="config-formula">
                        <label>
                          来源
                          <select
                            value={column.sourceField ?? ''}
                            onChange={(e) =>
                              updateTableBColumn(column.id, { sourceField: e.target.value })
                            }
                          >
                            <option value="">选择字段</option>
                            {tableAFields.map((field) => (
                              <option key={field} value={field}>
                                {field}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          当值 =
                          <input
                            type="text"
                            value={column.whenValue ?? ''}
                            onChange={(e) =>
                              updateTableBColumn(column.id, { whenValue: e.target.value })
                            }
                            placeholder="新土耳其里拉"
                          />
                        </label>
                        <label>
                          则
                          <input
                            type="text"
                            value={column.thenValue ?? ''}
                            onChange={(e) =>
                              updateTableBColumn(column.id, { thenValue: e.target.value })
                            }
                            placeholder="TRY"
                          />
                        </label>
                        <label>
                          否则
                          <input
                            type="text"
                            value={column.elseValue ?? ''}
                            onChange={(e) =>
                              updateTableBColumn(column.id, { elseValue: e.target.value })
                            }
                            placeholder="USD"
                          />
                        </label>
                      </div>
                    )}

                    {column.mappingType === 'vat_included' && (
                      <div className="config-formula">
                        <label>
                          金额来源
                          <select
                            value={column.amountField ?? ''}
                            onChange={(e) =>
                              updateTableBColumn(column.id, { amountField: e.target.value })
                            }
                          >
                            <option value="">选择字段</option>
                            {tableAFields.map((field) => (
                              <option key={field} value={field}>
                                {field}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          币种列
                          <select
                            value={column.currencyColumnId ?? ''}
                            onChange={(e) =>
                              updateTableBColumn(column.id, {
                                currencyColumnId: e.target.value,
                              })
                            }
                          >
                            <option value="">选择列</option>
                            {currencyColumnOptions.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          适用币种
                          <input
                            type="text"
                            value={column.vatWhenCurrency ?? 'TRY'}
                            onChange={(e) =>
                              updateTableBColumn(column.id, {
                                vatWhenCurrency: e.target.value,
                              })
                            }
                            placeholder="TRY"
                          />
                        </label>
                        <label>
                          税率 ×
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={column.vatRate ?? 1.2}
                            onChange={(e) =>
                              updateTableBColumn(column.id, {
                                vatRate: Number(e.target.value) || 1.2,
                              })
                            }
                          />
                        </label>
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => removeTableBColumn(column.id)}
                      disabled={tableBColumns.length <= 1}
                      title="删除列"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
