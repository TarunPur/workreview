export function generateSlug(name: string, company: string): string {
  const base = `${name}-${company}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return base
}
