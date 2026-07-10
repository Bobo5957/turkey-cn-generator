import { useEffect, useMemo, useState } from 'react'
import { ContactConfig } from './components/ContactConfig'
import { DataTable } from './components/DataTable'
import { RowResults } from './components/RowResults'
import { TableConfigPanel } from './components/TableConfigPanel'
import { PasteArea } from './components/PasteArea'
import { TemplatePanel } from './components/TemplatePanel'
import type { ContactMapping, TableConfig } from './types'
import { loadContacts, resetContacts, saveContacts } from './utils/contactStorage'
import {
  createEmptyRowData,
  createEmptyRows,
  DEFAULT_FIELDS,
  ENGLISH_TEMPLATE,
  TURKISH_TEMPLATE,
} from './utils/defaults'
import { getTemplateVariant } from './utils/emailTemplate'
import { processRows } from './utils/rowProcessing'
import { loadSettings, saveSettings } from './utils/storage'
import {
  createDefaultTableConfig,
  migrateRowsByFieldOrder,
  syncKeyFieldsOnRename,
  syncTableBSourcesOnFieldRename,
} from './utils/tableConfig'
import './App.css'

function App() {
  const [englishTemplate, setEnglishTemplate] = useState(ENGLISH_TEMPLATE)
  const [turkishTemplate, setTurkishTemplate] = useState(TURKISH_TEMPLATE)
  const [tableConfig, setTableConfig] = useState<TableConfig>(createDefaultTableConfig())
  const [rows, setRows] = useState<Record<string, string>[]>(() =>
    createEmptyRows(DEFAULT_FIELDS, 1),
  )
  const [contacts, setContacts] = useState<ContactMapping[]>([])
  const [loaded, setLoaded] = useState(false)

  const tableAFields = tableConfig.tableAFields

  useEffect(() => {
    const saved = loadSettings()
    setEnglishTemplate(saved.englishTemplate)
    setTurkishTemplate(saved.turkishTemplate)
    setTableConfig(saved.tableConfig ?? createDefaultTableConfig())
    setRows(createEmptyRows(saved.fields, 1))
    setContacts(loadContacts())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    saveSettings({
      englishTemplate,
      turkishTemplate,
      fields: tableAFields,
      tableConfig,
    })
  }, [englishTemplate, turkishTemplate, tableAFields, tableConfig, loaded])

  useEffect(() => {
    if (!loaded) return
    saveContacts(contacts)
  }, [contacts, loaded])

  const processedGroups = useMemo(
    () => processRows(rows, contacts, tableConfig),
    [rows, contacts, tableConfig],
  )

  const matchedContactIds = useMemo(() => {
    const ids = new Set<string>()
    for (const group of processedGroups) {
      if (group.contactMatch.matched && group.contactMatch.contactId) {
        ids.add(group.contactMatch.contactId)
      }
    }
    return ids
  }, [processedGroups])

  const unmatchedGroupCount = useMemo(
    () =>
      processedGroups.filter(
        (group) =>
          !group.contactMatch.matched &&
          (group.trader.trim() || group.activity.trim()),
      ).length,
    [processedGroups],
  )

  const activeVariant = useMemo(() => {
    const firstCurrency = rows.find((row) => row[tableConfig.currencyField]?.trim())?.[
      tableConfig.currencyField
    ] ?? ''
    return getTemplateVariant(firstCurrency)
  }, [rows, tableConfig.currencyField])

  const handleTemplateChange = (variant: 'english' | 'turkish', value: string) => {
    if (variant === 'turkish') {
      setTurkishTemplate(value)
    } else {
      setEnglishTemplate(value)
    }
  }

  const handleTableConfigChange = (nextConfig: TableConfig) => {
    const oldFields = tableConfig.tableAFields
    const newFields = nextConfig.tableAFields

    const syncedConfig: TableConfig = {
      ...nextConfig,
      tableBColumns: syncTableBSourcesOnFieldRename(
        nextConfig.tableBColumns,
        oldFields,
        newFields,
      ),
      ...syncKeyFieldsOnRename(nextConfig, oldFields, newFields),
    }

    setTableConfig(syncedConfig)
    setRows((currentRows) => migrateRowsByFieldOrder(currentRows, oldFields, newFields))
  }

  const handleParsed = (parsedRows: Record<string, string>[]) => {
    setRows(parsedRows)
  }

  const handleAddRow = () => {
    setRows((currentRows) => [...currentRows, createEmptyRowData(tableAFields)])
  }

  const handleClearData = () => {
    setRows(createEmptyRows(tableAFields, 1))
  }

  const handleResetTemplate = () => {
    setEnglishTemplate(ENGLISH_TEMPLATE)
    setTurkishTemplate(TURKISH_TEMPLATE)
  }

  const handleResetTableConfig = () => {
    const defaults = createDefaultTableConfig()
    setTableConfig(defaults)
    setRows((currentRows) =>
      migrateRowsByFieldOrder(currentRows, tableAFields, defaults.tableAFields),
    )
  }

  const handleResetContacts = () => {
    setContacts(resetContacts())
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>小米土耳其CN邮件生成器</h1>
        <p>粘贴多行表格 A，相同交易客户 + 活动客户的行将合并生成表格 B 和邮件正文</p>
      </header>

      <main className="app-main">
        <PasteArea tableAFields={tableAFields} onParsed={handleParsed} />
        <DataTable
          fields={tableAFields}
          rows={rows}
          onChange={setRows}
          onAddRow={handleAddRow}
          onClear={handleClearData}
        />
        <RowResults
          processedGroups={processedGroups}
          tableConfig={tableConfig}
          englishTemplate={englishTemplate}
          turkishTemplate={turkishTemplate}
        />
        <ContactConfig
          contacts={contacts}
          matchedContactIds={matchedContactIds}
          unmatchedGroupCount={unmatchedGroupCount}
          onChange={setContacts}
          onReset={handleResetContacts}
        />
        <div className="config-grid">
          <TemplatePanel
            englishTemplate={englishTemplate}
            turkishTemplate={turkishTemplate}
            activeVariant={activeVariant}
            onChange={handleTemplateChange}
            onReset={handleResetTemplate}
          />
        </div>
        <TableConfigPanel
          tableConfig={tableConfig}
          onChange={handleTableConfigChange}
          onReset={handleResetTableConfig}
        />
      </main>
    </div>
  )
}

export default App
