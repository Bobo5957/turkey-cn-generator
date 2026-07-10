import type { TableBColumnConfig, TableConfig } from '../types'

function parseAmount(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const num = parseFloat(trimmed.replace(/,/g, ''))
  return Number.isFinite(num) ? num : null
}

function formatAmount(value: number | null): string {
  if (value === null) return ''
  const rounded = Math.round(value * 10) / 10
  return String(rounded)
}

export function transformToTableB(
  rowData: Record<string, string>,
  columns: TableBColumnConfig[],
): Record<string, string> {
  const result: Record<string, string> = {}

  for (const column of columns) {
    if (column.mappingType === 'vat_included') continue

    switch (column.mappingType) {
      case 'direct':
        result[column.name] = rowData[column.sourceField ?? ''] ?? ''
        break
      case 'amount': {
        const amount = parseAmount(rowData[column.sourceField ?? ''] ?? '')
        result[column.name] =
          amount !== null
            ? formatAmount(amount)
            : (rowData[column.sourceField ?? ''] ?? '')
        break
      }
      case 'currency_if': {
        const raw = rowData[column.sourceField ?? ''] ?? ''
        result[column.name] =
          raw.trim() === (column.whenValue ?? '').trim()
            ? (column.thenValue ?? '')
            : (column.elseValue ?? '')
        break
      }
    }
  }

  for (const column of columns) {
    if (column.mappingType !== 'vat_included') continue

    const amount = parseAmount(rowData[column.amountField ?? ''] ?? '')
    const currencyColumn = columns.find((item) => item.id === column.currencyColumnId)
    const currency = currencyColumn ? result[currencyColumn.name] : ''
    if (amount === null) {
      result[column.name] = ''
    } else if (currency === (column.vatWhenCurrency ?? 'TRY')) {
      result[column.name] = formatAmount(amount * (column.vatRate ?? 1.2))
    } else {
      result[column.name] = formatAmount(amount)
    }
  }

  return result
}

export function getTableBFieldNames(config: TableConfig): string[] {
  return config.tableBColumns.map((column) => column.name).filter(Boolean)
}

export function tableBRowsToTsv(
  tableBRows: Record<string, string>[],
  fieldNames: string[],
  includeHeader = true,
): string {
  const lines: string[] = []
  if (includeHeader) {
    lines.push(fieldNames.join('\t'))
  }
  for (const row of tableBRows) {
    lines.push(fieldNames.map((field) => row[field] ?? '').join('\t'))
  }
  return lines.join('\n')
}

export function tableBToTsv(
  tableBData: Record<string, string>,
  fieldNames: string[],
  includeHeader = true,
): string {
  return tableBRowsToTsv([tableBData], fieldNames, includeHeader)
}

export function hasTableBData(
  tableBRows: Record<string, string>[],
  fieldNames: string[],
): boolean {
  return tableBRows.some((row) =>
    fieldNames.some((field) => row[field]?.trim()),
  )
}
