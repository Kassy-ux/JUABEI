import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main>
      <h1>JuaBei</h1>
      <p>
        Channels lane baseline (PWA / USSD / WhatsApp entry point). Edit{' '}
        <code>src/routes/index.tsx</code> to get started.
      </p>
    </main>
  )
}
