import { LogoutButton } from '@/components/auth/LogoutButton'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <p className="text-muted-foreground">Messliste folgt in PROJ-4.</p>
      <LogoutButton />
    </main>
  )
}
