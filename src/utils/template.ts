export function renderTemplate(
  template: string,
  data: Record<string, string>,
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key: string) => {
    const trimmed = key.trim()
    return data[trimmed] ?? ''
  })
}

export function extractPlaceholders(template: string): string[] {
  const matches = template.matchAll(/\{\{([^}]+)\}\}/g)
  const seen = new Set<string>()
  const result: string[] = []
  for (const match of matches) {
    const key = match[1].trim()
    if (!seen.has(key)) {
      seen.add(key)
      result.push(key)
    }
  }
  return result
}
