import type { ContactMapping, ContactMatch, TableConfig, TemplateVariant } from '../types'
import { matchContact } from './contacts'
import { getTemplateVariant } from './emailTemplate'
import { transformToTableB } from './tableB'

export interface ProcessedGroup {
  groupKey: string
  label: string
  trader: string
  activity: string
  sourceRowIndices: number[]
  rowDataList: Record<string, string>[]
  tableBRows: Record<string, string>[]
  contactMatch: ContactMatch
  templateVariant: TemplateVariant
  templateData: Record<string, string>
}

function isNonEmptyRow(rowData: Record<string, string>): boolean {
  return Object.values(rowData).some((value) => value.trim())
}

function buildGroupKey(trader: string, activity: string): string {
  return `${trader}\0${activity}`
}

function buildGroupLabel(
  trader: string,
  activity: string,
  sourceRowIndices: number[],
): string {
  const customerLabel = `${trader || '—'} / ${activity || '—'}`
  if (sourceRowIndices.length === 1) {
    return `第 ${sourceRowIndices[0] + 1} 行 — ${customerLabel}`
  }
  const rowNumbers = sourceRowIndices.map((index) => index + 1).join('、')
  return `${customerLabel}（第 ${rowNumbers} 行，共 ${sourceRowIndices.length} 行）`
}

export function processRows(
  rows: Record<string, string>[],
  contacts: ContactMapping[],
  tableConfig: TableConfig,
): ProcessedGroup[] {
  const { traderField, activityField, currencyField, tableBColumns } = tableConfig

  const groups = new Map<
    string,
    {
      trader: string
      activity: string
      sourceRowIndices: number[]
      rowDataList: Record<string, string>[]
    }
  >()

  rows.forEach((rowData, index) => {
    if (!isNonEmptyRow(rowData)) return

    const trader = rowData[traderField]?.trim() ?? ''
    const activity = rowData[activityField]?.trim() ?? ''
    const groupKey = buildGroupKey(trader, activity)

    const existing = groups.get(groupKey)
    if (existing) {
      existing.sourceRowIndices.push(index)
      existing.rowDataList.push(rowData)
      return
    }

    groups.set(groupKey, {
      trader,
      activity,
      sourceRowIndices: [index],
      rowDataList: [rowData],
    })
  })

  return Array.from(groups.entries()).map(([groupKey, group]) => {
    const tableBRows = group.rowDataList.map((rowData) =>
      transformToTableB(rowData, tableBColumns),
    )
    const primaryRowData = group.rowDataList[0]
    const primaryTableB = tableBRows[0]
    const templateVariant = getTemplateVariant(primaryRowData[currencyField] ?? '')
    const contactMatch = matchContact(contacts, group.trader, group.activity)

    const templateData = {
      ...primaryRowData,
      ...primaryTableB,
      收件人地址: contactMatch.to,
      收件人: contactMatch.to,
      CC地址: contactMatch.cc,
      CC: contactMatch.cc,
    }

    return {
      groupKey,
      trader: group.trader,
      activity: group.activity,
      sourceRowIndices: group.sourceRowIndices,
      rowDataList: group.rowDataList,
      tableBRows,
      contactMatch,
      templateVariant,
      templateData,
      label: buildGroupLabel(group.trader, group.activity, group.sourceRowIndices),
    }
  })
}

export function getTemplateForVariant(
  variant: TemplateVariant,
  englishTemplate: string,
  turkishTemplate: string,
): string {
  return variant === 'turkish' ? turkishTemplate : englishTemplate
}
