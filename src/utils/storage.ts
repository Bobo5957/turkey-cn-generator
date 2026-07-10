import type { StorageData, TableConfig } from '../types'
import { DEFAULT_FIELDS, ENGLISH_TEMPLATE, TURKISH_TEMPLATE } from './defaults'
import { createDefaultTableConfig, migrateTableConfig } from './tableConfig'

const STORAGE_KEY = 'turkey-cn-generator-settings'

function normalizeSettings(parsed: Partial<StorageData>): StorageData {
  const englishTemplate =
    typeof parsed.englishTemplate === 'string'
      ? parsed.englishTemplate
      : typeof parsed.defaultTemplate === 'string'
        ? parsed.defaultTemplate
        : typeof parsed.template === 'string'
          ? parsed.template
          : ENGLISH_TEMPLATE

  const turkishTemplate =
    typeof parsed.turkishTemplate === 'string'
      ? parsed.turkishTemplate
      : TURKISH_TEMPLATE

  const fields =
    Array.isArray(parsed.fields) && parsed.fields.length > 0
      ? parsed.fields.filter((f) => typeof f === 'string' && f.trim())
      : [...DEFAULT_FIELDS]

  const tableConfig = migrateTableConfig(parsed.tableConfig ?? {}, fields)

  return {
    englishTemplate,
    turkishTemplate,
    fields: tableConfig.tableAFields,
    tableConfig,
  }
}

export function loadSettings(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const tableConfig = createDefaultTableConfig()
      return {
        englishTemplate: ENGLISH_TEMPLATE,
        turkishTemplate: TURKISH_TEMPLATE,
        fields: tableConfig.tableAFields,
        tableConfig,
      }
    }
    return normalizeSettings(JSON.parse(raw) as Partial<StorageData>)
  } catch {
    const tableConfig = createDefaultTableConfig()
    return {
      englishTemplate: ENGLISH_TEMPLATE,
      turkishTemplate: TURKISH_TEMPLATE,
      fields: tableConfig.tableAFields,
      tableConfig,
    }
  }
}

export function saveSettings(data: StorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getTableConfigFromSettings(data: StorageData): TableConfig {
  return data.tableConfig ?? migrateTableConfig({}, data.fields)
}
