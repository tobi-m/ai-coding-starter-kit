import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ mock: 'client' })),
}))

describe('supabase browser client', () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
  })

  it('throws a clear error when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    await expect(import('./supabase')).rejects.toThrow('Missing Supabase environment variables')
  })

  it('throws a clear error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    await expect(import('./supabase')).rejects.toThrow('Missing Supabase environment variables')
  })

  it('throws a clear error when both env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    await expect(import('./supabase')).rejects.toThrow('Missing Supabase environment variables')
  })

  it('exports createClient when env vars are set', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    const mod = await import('./supabase')
    expect(mod.createClient).toBeDefined()
    expect(typeof mod.createClient).toBe('function')
  })

  it('createClient returns a Supabase client instance', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    const { createClient } = await import('./supabase')
    const client = createClient()
    expect(client).toBeDefined()
  })
})
