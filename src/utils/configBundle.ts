import type { ContactMapping, StorageData, TableConfig } from '../types'
import { createDefaultContacts } from './contacts'
import { ENGLISH_TEMPLATE, TURKISH_TEMPLATE } from './defaults'
import { createDefaultTableConfig, migrateTableConfig } from './tableConfig'

export const CONFIG_BUNDLE_VERSION = 1

export interface AppConfigBundle {
  version: number
  exportedAt: string
  app: 'turkey-cn-generator'
  settings: {
    englishTemplate: string
    turkishTemplate: string
    tableConfig: TableConfig
  }
  contacts: ContactMapping[]
}

export function createConfigBundle(
  englishTemplate: string,
  turkishTemplate: string,
  tableConfig: TableConfig,
  contacts: ContactMapping[],
): AppConfigBundle {
  return {
    version: CONFIG_BUNDLE_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'turkey-cn-generator',
    settings: {
      englishTemplate,
      turkishTemplate,
      tableConfig,
    },
    contacts: contacts.map((contact) => ({ ...contact })),
  }
}

export function parseConfigBundle(raw: unknown): AppConfigBundle {
  if (!raw || typeof raw !== 'object') {
    throw new Error('配置文件格式无效')
  }

  const bundle = raw as Partial<AppConfigBundle>
  if (bundle.app !== 'turkey-cn-generator') {
    throw new Error('这不是土耳其 CN 生成器的配置文件')
  }

  const englishTemplate =
    typeof bundle.settings?.englishTemplate === 'string'
      ? bundle.settings.englishTemplate
      : ENGLISH_TEMPLATE
  const turkishTemplate =
    typeof bundle.settings?.turkishTemplate === 'string'
      ? bundle.settings.turkishTemplate
      : TURKISH_TEMPLATE

  const tableConfig = migrateTableConfig(
    bundle.settings?.tableConfig ?? {},
    createDefaultTableConfig().tableAFields,
  )

  const contacts = Array.isArray(bundle.contacts)
    ? bundle.contacts
        .filter((contact) => contact && typeof contact.交易客户 === 'string')
        .map((contact, index) => ({
          id:
            typeof contact.id === 'string' && contact.id.trim()
              ? contact.id
              : `imported-${index}`,
          交易客户: contact.交易客户 ?? '',
          活动客户: contact.活动客户 ?? '',
          收件人地址: contact.收件人地址 ?? '',
          CC地址: contact.CC地址 ?? '',
        }))
    : createDefaultContacts()

  if (contacts.length === 0) {
    throw new Error('配置文件里没有有效的收件人规则')
  }

  return {
    version: bundle.version ?? CONFIG_BUNDLE_VERSION,
    exportedAt: bundle.exportedAt ?? new Date().toISOString(),
    app: 'turkey-cn-generator',
    settings: {
      englishTemplate,
      turkishTemplate,
      tableConfig,
    },
    contacts,
  }
}

export function serializeConfigBundle(bundle: AppConfigBundle): string {
  return JSON.stringify(bundle, null, 2)
}

export function downloadConfigBundle(bundle: AppConfigBundle): void {
  const blob = new Blob([serializeConfigBundle(bundle)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const date = new Date().toISOString().slice(0, 10)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `turkey-cn-config-${date}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function settingsFromBundle(bundle: AppConfigBundle): StorageData {
  return {
    englishTemplate: bundle.settings.englishTemplate,
    turkishTemplate: bundle.settings.turkishTemplate,
    fields: bundle.settings.tableConfig.tableAFields,
    tableConfig: bundle.settings.tableConfig,
  }
}
