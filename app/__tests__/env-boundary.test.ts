import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { forbiddenEnvKeysInExample } from '@/app/lib/env-boundary'

describe('env boundary', () => {
  it('.env.example does not list admin or sensitive database URLs', () => {
    const text = readFileSync(join(process.cwd(), '.env.example'), 'utf8')
    expect(forbiddenEnvKeysInExample(text)).toEqual([])
  })
})
