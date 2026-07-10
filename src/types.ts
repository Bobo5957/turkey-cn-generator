export type TemplateVariant = 'english' | 'turkish'

export type TableBMappingType = 'direct' | 'amount' | 'currency_if' | 'vat_included'

export interface TableBColumnConfig {
  id: string
  name: string
  mappingType: TableBMappingType
  sourceField?: string
  whenValue?: string
  thenValue?: string
  elseValue?: string
  amountField?: string
  currencyColumnId?: string
  vatRate?: number
  vatWhenCurrency?: string
}

export interface TableConfig {
  tableAFields: string[]
  tableBColumns: TableBColumnConfig[]
  traderField: string
  activityField: string
  currencyField: string
}

export interface StorageData {
  englishTemplate: string
  turkishTemplate: string
  fields: string[]
  tableConfig?: TableConfig
  /** @deprecated legacy storage */
  defaultTemplate?: string
  /** @deprecated legacy single-template storage */
  template?: string
}

export interface ContactMapping {
  id: string
  交易客户: string
  活动客户: string
  收件人地址: string
  CC地址: string
}

export interface ContactMatch {
  to: string
  cc: string
  matched: boolean
  contactId?: string
}
