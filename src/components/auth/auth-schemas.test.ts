import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Schemas mirrored from the form components — testing validation rules in isolation
const loginSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
  password: z.string().min(1, 'Bitte gib dein Passwort ein'),
})

const registerSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
  password: z.string().min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein'),
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
})

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein'),
})

describe('loginSchema', () => {
  it('accepts valid email and non-empty password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'abc' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'abc' })
    expect(result.success).toBe(false)
    const error = result.error!.issues.find(i => i.path[0] === 'email')
    expect(error?.message).toBe('Bitte gib eine gültige E-Mail-Adresse ein')
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' })
    expect(result.success).toBe(false)
    const error = result.error!.issues.find(i => i.path[0] === 'password')
    expect(error?.message).toBe('Bitte gib dein Passwort ein')
  })

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'somepass' })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('accepts valid email and password with 8+ chars', () => {
    const result = registerSchema.safeParse({ email: 'user@example.com', password: '12345678' })
    expect(result.success).toBe(true)
  })

  it('rejects password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({ email: 'user@example.com', password: '1234567' })
    expect(result.success).toBe(false)
    const error = result.error!.issues.find(i => i.path[0] === 'password')
    expect(error?.message).toBe('Das Passwort muss mindestens 8 Zeichen lang sein')
  })

  it('accepts password with exactly 8 characters', () => {
    const result = registerSchema.safeParse({ email: 'user@example.com', password: '12345678' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email format', () => {
    const result = registerSchema.safeParse({ email: 'bad', password: '12345678' })
    expect(result.success).toBe(false)
    const error = result.error!.issues.find(i => i.path[0] === 'email')
    expect(error?.message).toBe('Bitte gib eine gültige E-Mail-Adresse ein')
  })
})

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'notanemail' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty email', () => {
    const result = forgotPasswordSchema.safeParse({ email: '' })
    expect(result.success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('accepts password with 8+ characters', () => {
    const result = resetPasswordSchema.safeParse({ password: 'newpass1' })
    expect(result.success).toBe(true)
  })

  it('rejects password shorter than 8 characters', () => {
    const result = resetPasswordSchema.safeParse({ password: 'short' })
    expect(result.success).toBe(false)
    const error = result.error!.issues.find(i => i.path[0] === 'password')
    expect(error?.message).toBe('Das Passwort muss mindestens 8 Zeichen lang sein')
  })

  it('rejects empty password', () => {
    const result = resetPasswordSchema.safeParse({ password: '' })
    expect(result.success).toBe(false)
  })
})
