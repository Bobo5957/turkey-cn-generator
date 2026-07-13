import type { ContactMapping } from '../types'
import { normalizeEmails } from './contacts'

export type ContactEmailField = '收件人地址' | 'CC地址'
export type ContactBatchTarget = ContactEmailField | 'both'

export function splitEmails(raw: string): string[] {
  return normalizeEmails(raw)
    .split(';')
    .map((email) => email.trim())
    .filter(Boolean)
}

export function joinEmails(emails: string[]): string {
  return emails.join(';')
}

function normalizeEmailKey(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return normalizeEmailKey(email).includes('@')
}

export function addEmailToField(raw: string, email: string): string {
  const nextEmail = email.trim()
  if (!isValidEmail(nextEmail)) return normalizeEmails(raw)

  const key = normalizeEmailKey(nextEmail)
  const emails = splitEmails(raw)
  if (emails.some((item) => normalizeEmailKey(item) === key)) {
    return joinEmails(emails)
  }
  return joinEmails([...emails, nextEmail])
}

export function removeEmailFromField(raw: string, email: string): string {
  const key = normalizeEmailKey(email)
  if (!key) return normalizeEmails(raw)

  return joinEmails(
    splitEmails(raw).filter((item) => normalizeEmailKey(item) !== key),
  )
}

export function applyEmailBatchUpdate(
  raw: string,
  email: string,
  action: 'add' | 'remove',
): string {
  const normalized = normalizeEmails(raw)
  return action === 'add'
    ? addEmailToField(normalized, email)
    : removeEmailFromField(normalized, email)
}

export interface ContactBatchOptions {
  target: ContactBatchTarget
  email: string
  action: 'add' | 'remove'
  onlyMatched: boolean
  matchedContactIds: Set<string>
}

export function batchUpdateContactEmails(
  contacts: ContactMapping[],
  options: ContactBatchOptions,
): { contacts: ContactMapping[]; affectedCount: number } {
  const email = options.email.trim()
  if (!isValidEmail(email)) {
    return { contacts, affectedCount: 0 }
  }

  const fields: ContactEmailField[] =
    options.target === 'both' ? ['收件人地址', 'CC地址'] : [options.target]

  let affectedCount = 0

  const nextContacts = contacts.map((contact) => {
    if (options.onlyMatched && !options.matchedContactIds.has(contact.id)) {
      return contact
    }

    let changed = false
    const nextContact = { ...contact }

    for (const field of fields) {
      const updated = applyEmailBatchUpdate(contact[field], email, options.action)
      if (updated !== contact[field]) {
        nextContact[field] = updated
        changed = true
      }
    }

    if (changed) {
      affectedCount += 1
      return nextContact
    }

    return contact
  })

  return { contacts: nextContacts, affectedCount }
}
