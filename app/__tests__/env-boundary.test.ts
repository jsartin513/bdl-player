import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  forbiddenEnvKeysInExample,
  forbiddenProcessEnvInSource,
} from '@/app/lib/env-boundary'

function listTsFiles(dir: string): string[] {
  const entries = readdirSync(dir)
  const files: string[] = []
  for (const entry of entries) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      if (entry === '__tests__' || entry === 'node_modules') continue
      files.push(...listTsFiles(full))
      continue
    }
    if (entry.endsWith('.ts') && !entry.endsWith('.test.ts')) {
      files.push(full)
    }
  }
  return files
}

describe('env boundary', () => {
  it('.env.example does not list admin or sensitive database URLs', () => {
    const text = readFileSync(join(process.cwd(), '.env.example'), 'utf8')
    expect(forbiddenEnvKeysInExample(text)).toEqual([])
  })

  it('app source does not reference admin database env names', () => {
    const appDir = join(process.cwd(), 'app')
    const violations: string[] = []
    for (const file of listTsFiles(appDir)) {
      const text = readFileSync(file, 'utf8')
      const forbidden = forbiddenProcessEnvInSource(text)
      if (forbidden.length > 0) {
        violations.push(`${file}: ${forbidden.join(', ')}`)
      }
    }
    expect(violations).toEqual([])
  })
})
