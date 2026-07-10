import type { ContactMapping } from '../types'
import { createDefaultContacts } from './contacts'

const STORAGE_KEY = 'turkey-cn-generator-contacts'

export function loadContacts(): ContactMapping[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultContacts()

    const parsed = JSON.parse(raw) as Partial<ContactMapping>[]
    if (!Array.isArray(parsed) || parsed.length === 0) return createDefaultContacts()

    return parsed
      .filter((c) => c && typeof c.交易客户 === 'string')
      .map((c, i) => ({
        id: typeof c.id === 'string' ? c.id : `saved-${i}`,
        交易客户: c.交易客户 ?? '',
        活动客户: c.活动客户 ?? '',
        收件人地址: c.收件人地址 ?? '',
        CC地址: c.CC地址 ?? '',
      }))
  } catch {
    return createDefaultContacts()
  }
}

export function saveContacts(contacts: ContactMapping[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
}

export function resetContacts(): ContactMapping[] {
  const defaults = createDefaultContacts()
  saveContacts(defaults)
  return defaults
}
