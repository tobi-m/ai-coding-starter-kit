import { test, expect } from '@playwright/test'

// AC: Unauthenticated user on protected route → redirect to /login
test('unauthenticated user visiting / is redirected to /login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/login')
})

// AC: Unauthenticated user on /login sees the login form
test('login page renders email, password fields and submit button', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByLabel('E-Mail-Adresse')).toBeVisible()
  await expect(page.getByLabel('Passwort')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Anmelden' })).toBeVisible()
})

// AC: Login page has links to /forgot-password and /register
test('login page has working navigation links', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('link', { name: 'Passwort vergessen?' })).toHaveAttribute('href', '/forgot-password')
  await expect(page.getByRole('link', { name: 'Jetzt registrieren' })).toHaveAttribute('href', '/register')
})

// AC: Wrong credentials → generic error message (no user enumeration)
test('login with wrong credentials shows generic error', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-Mail-Adresse').fill('nobody@example-nonexistent.com')
  await page.getByLabel('Passwort').fill('wrongpassword')
  await page.getByRole('button', { name: 'Anmelden' }).click()
  await expect(page.getByText('E-Mail oder Passwort ist falsch.')).toBeVisible()
})

// AC: Client-side validation — invalid email format on login
test('login form shows validation error for invalid email', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-Mail-Adresse').fill('notanemail')
  await page.getByLabel('Passwort').fill('somepassword')
  await page.getByRole('button', { name: 'Anmelden' }).click()
  await expect(page.getByText('Bitte gib eine gültige E-Mail-Adresse ein')).toBeVisible()
})

// AC: Register page renders correctly
test('register page renders email, password fields and submit button', async ({ page }) => {
  await page.goto('/register')
  await expect(page.getByLabel('E-Mail-Adresse')).toBeVisible()
  await expect(page.getByLabel('Passwort')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Konto erstellen' })).toBeVisible()
})

// AC: Register page has link to /login
test('register page has link to login', async ({ page }) => {
  await page.goto('/register')
  await expect(page.getByRole('link', { name: 'Jetzt anmelden' })).toHaveAttribute('href', '/login')
})

// AC: Register — password < 8 chars → client-side validation error
test('register form shows error for password shorter than 8 characters', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel('E-Mail-Adresse').fill('test@example.com')
  await page.getByLabel('Passwort').fill('1234567')
  await page.getByRole('button', { name: 'Konto erstellen' }).click()
  await expect(page.getByText('Das Passwort muss mindestens 8 Zeichen lang sein')).toBeVisible()
})

// AC: Register — password exactly 8 chars passes client validation and submits
test('register form accepts password with exactly 8 characters', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel('E-Mail-Adresse').fill('test-qa@example-nonexistent.com')
  await page.getByLabel('Passwort').fill('12345678')
  await page.getByRole('button', { name: 'Konto erstellen' }).click()
  // Should either show success or an error — no client-side validation error
  await expect(page.getByText('Das Passwort muss mindestens 8 Zeichen lang sein')).not.toBeVisible()
})

// AC: Forgot-password page renders correctly
test('forgot-password page renders email field and submit button', async ({ page }) => {
  await page.goto('/forgot-password')
  await expect(page.getByLabel('E-Mail-Adresse')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reset-Link senden' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Zurück zum Login' })).toBeVisible()
})

// AC: Forgot-password always shows neutral confirmation (registered email)
test('forgot-password shows neutral message for registered email', async ({ page }) => {
  await page.goto('/forgot-password')
  await page.getByLabel('E-Mail-Adresse').fill('test@example.com')
  await page.getByRole('button', { name: 'Reset-Link senden' }).click()
  await expect(page.getByText('Wenn ein Konto mit dieser E-Mail-Adresse existiert')).toBeVisible({ timeout: 10000 })
})

// AC: Forgot-password shows same neutral message for unknown email (no user enumeration)
test('forgot-password shows same neutral message for unknown email', async ({ page }) => {
  await page.goto('/forgot-password')
  await page.getByLabel('E-Mail-Adresse').fill('unknown-nobody@example-nonexistent.com')
  await page.getByRole('button', { name: 'Reset-Link senden' }).click()
  await expect(page.getByText('Wenn ein Konto mit dieser E-Mail-Adresse existiert')).toBeVisible({ timeout: 10000 })
})

// AC: Reset-password page renders correctly
test('reset-password page renders password field and submit button', async ({ page }) => {
  await page.goto('/reset-password')
  await expect(page.getByLabel('Neues Passwort')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Passwort speichern' })).toBeVisible()
})

// AC: Reset-password — password < 8 chars → client-side validation error
test('reset-password form shows error for password shorter than 8 characters', async ({ page }) => {
  await page.goto('/reset-password')
  await page.getByLabel('Neues Passwort').fill('short')
  await page.getByRole('button', { name: 'Passwort speichern' }).click()
  await expect(page.getByText('Das Passwort muss mindestens 8 Zeichen lang sein')).toBeVisible()
})

// Responsive: Login page renders correctly on mobile (375px)
test('login page is usable on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/login')
  await expect(page.getByLabel('E-Mail-Adresse')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Anmelden' })).toBeVisible()
})

// Responsive: Register page renders correctly on tablet (768px)
test('register page is usable on tablet viewport', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('/register')
  await expect(page.getByLabel('E-Mail-Adresse')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Konto erstellen' })).toBeVisible()
})

// URL error parameter: /login?error=... shows the error
test('login page displays error from URL parameter', async ({ page }) => {
  await page.goto('/login?error=Der%20Link%20ist%20abgelaufen')
  await expect(page.getByText('Der Link ist abgelaufen')).toBeVisible()
})
