import type { TemplateVariant } from '../types'
import { TRY_CURRENCY_LABEL } from './defaults'

export function isTryCurrency(currency: string): boolean {
  return currency.trim() === TRY_CURRENCY_LABEL
}

export function getTemplateVariant(currency: string): TemplateVariant {
  return isTryCurrency(currency) ? 'turkish' : 'english'
}

export const TEMPLATE_VARIANT_LABELS: Record<TemplateVariant, string> = {
  english: 'English（USD）',
  turkish: '土耳其语（TRY）',
}
