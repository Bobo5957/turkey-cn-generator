import type { TableBColumnConfig, TableConfig } from '../types'
import { DEFAULT_FIELDS, TRY_CURRENCY_LABEL } from './defaults'

export const TABLE_B_MAPPING_LABELS: Record<TableBColumnConfig['mappingType'], string> = {
  direct: '直接映射',
  amount: '金额',
  currency_if: '币种 IF',
  vat_included: '含税公式',
}

export const DEFAULT_TABLE_B_COLUMNS: TableBColumnConfig[] = [
  {
    id: 'tb-cn',
    name: 'CN NO.',
    mappingType: 'direct',
    sourceField: 'CN',
  },
  {
    id: 'tb-country',
    name: 'Country',
    mappingType: 'direct',
    sourceField: '所属国家',
  },
  {
    id: 'tb-distributor',
    name: 'Distributor Name',
    mappingType: 'direct',
    sourceField: '交易客户',
  },
  {
    id: 'tb-sales',
    name: 'Sales Entity',
    mappingType: 'direct',
    sourceField: '销售主体',
  },
  {
    id: 'tb-amount',
    name: 'CN Amount',
    mappingType: 'amount',
    sourceField: '本次结算总金额（不含税）',
  },
  {
    id: 'tb-vat',
    name: 'CN Amount (VAT included)',
    mappingType: 'vat_included',
    amountField: '本次结算总金额（不含税）',
    currencyColumnId: 'tb-currency',
    vatRate: 1.2,
    vatWhenCurrency: 'TRY',
  },
  {
    id: 'tb-currency',
    name: 'Currency',
    mappingType: 'currency_if',
    sourceField: '币种',
    whenValue: TRY_CURRENCY_LABEL,
    thenValue: 'TRY',
    elseValue: 'USD',
  },
  {
    id: 'tb-deal',
    name: 'Deal Letter',
    mappingType: 'direct',
    sourceField: '活动政策单号',
  },
]

export function getAmountFieldsFromConfig(config: TableConfig): string[] {
  const fields = new Set<string>()
  for (const column of config.tableBColumns) {
    if (column.mappingType === 'amount' && column.sourceField?.trim()) {
      fields.add(column.sourceField.trim())
    }
    if (column.mappingType === 'vat_included' && column.amountField?.trim()) {
      fields.add(column.amountField.trim())
    }
  }
  return Array.from(fields)
}

export function createDefaultTableConfig(): TableConfig {
  return {
    tableAFields: [...DEFAULT_FIELDS],
    tableBColumns: DEFAULT_TABLE_B_COLUMNS.map((column) => ({ ...column })),
    traderField: '交易客户',
    activityField: '活动客户',
    currencyField: '币种',
  }
}

export function createEmptyTableBColumn(index: number): TableBColumnConfig {
  return {
    id: `tb-new-${Date.now()}-${index}`,
    name: `列${index + 1}`,
    mappingType: 'direct',
    sourceField: '',
  }
}

export function getTableBFieldNames(columns: TableBColumnConfig[]): string[] {
  return columns.map((column) => column.name).filter(Boolean)
}

export function migrateTableConfig(parsed: Partial<TableConfig>, fields: string[]): TableConfig {
  const defaults = createDefaultTableConfig()
  const tableAFields =
    Array.isArray(parsed.tableAFields) && parsed.tableAFields.length > 0
      ? parsed.tableAFields.filter((field) => typeof field === 'string' && field.trim())
      : fields.length > 0
        ? [...fields]
        : defaults.tableAFields

  const tableBColumns =
    Array.isArray(parsed.tableBColumns) && parsed.tableBColumns.length > 0
      ? parsed.tableBColumns
          .filter((column) => column && typeof column.name === 'string')
          .map((column, index) => ({
            id: typeof column.id === 'string' ? column.id : `tb-saved-${index}`,
            name: column.name.trim(),
            mappingType: column.mappingType ?? 'direct',
            sourceField: column.sourceField ?? '',
            whenValue: column.whenValue ?? '',
            thenValue: column.thenValue ?? '',
            elseValue: column.elseValue ?? '',
            amountField: column.amountField ?? '',
            currencyColumnId: column.currencyColumnId ?? '',
            vatRate:
              typeof column.vatRate === 'number' && Number.isFinite(column.vatRate)
                ? column.vatRate
                : 1.2,
            vatWhenCurrency: column.vatWhenCurrency ?? 'TRY',
          }))
      : defaults.tableBColumns

  return {
    tableAFields,
    tableBColumns,
    traderField:
      typeof parsed.traderField === 'string' && parsed.traderField.trim()
        ? parsed.traderField
        : defaults.traderField,
    activityField:
      typeof parsed.activityField === 'string' && parsed.activityField.trim()
        ? parsed.activityField
        : defaults.activityField,
    currencyField:
      typeof parsed.currencyField === 'string' && parsed.currencyField.trim()
        ? parsed.currencyField
        : defaults.currencyField,
  }
}

export function migrateRowsByFieldOrder(
  rows: Record<string, string>[],
  oldFields: string[],
  newFields: string[],
): Record<string, string>[] {
  return rows.map((row) => {
    const nextRow: Record<string, string> = {}
    newFields.forEach((field, index) => {
      const oldField = oldFields[index]
      nextRow[field] = oldField ? (row[oldField] ?? '') : (row[field] ?? '')
    })
    return nextRow
  })
}

export function syncTableBSourcesOnFieldRename(
  columns: TableBColumnConfig[],
  oldFields: string[],
  newFields: string[],
): TableBColumnConfig[] {
  const renameMap = new Map<string, string>()
  oldFields.forEach((oldField, index) => {
    const newField = newFields[index]
    if (newField && oldField !== newField) {
      renameMap.set(oldField, newField)
    }
  })

  if (renameMap.size === 0) return columns

  const rename = (field?: string) => {
    if (!field) return field
    return renameMap.get(field) ?? field
  }

  return columns.map((column) => ({
    ...column,
    sourceField: rename(column.sourceField),
    amountField: rename(column.amountField),
  }))
}

export function syncKeyFieldsOnRename(
  config: TableConfig,
  oldFields: string[],
  newFields: string[],
): Pick<TableConfig, 'traderField' | 'activityField' | 'currencyField'> {
  const rename = (field: string) => {
    const index = oldFields.indexOf(field)
    if (index >= 0 && newFields[index]) return newFields[index]
    return field
  }

  return {
    traderField: rename(config.traderField),
    activityField: rename(config.activityField),
    currencyField: rename(config.currencyField),
  }
}
