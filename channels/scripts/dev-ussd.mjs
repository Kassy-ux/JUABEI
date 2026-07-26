import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import ngrok from '@ngrok/ngrok'

const channelsDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const repositoryDir = path.resolve(channelsDir, '..')
const envFile = path.join(repositoryDir, '.env')
const npmExecutable = process.env.npm_execpath
const children = []
let listener
let shuttingDown = false

if (existsSync(envFile)) process.loadEnvFile(envFile)

if (!process.env.NGROK_AUTHTOKEN) {
  console.error(
    [
      'NGROK_AUTHTOKEN is missing.',
      'Add it to the root .env file, then run this command again:',
      '  NGROK_AUTHTOKEN=your_token_from_ngrok',
      'Get a token at https://dashboard.ngrok.com/get-started/your-authtoken',
    ].join('\n'),
  )
  process.exit(1)
}

function start(label, args, cwd) {
  const command = npmExecutable ? process.execPath : 'npm'
  const commandArgs = npmExecutable ? [npmExecutable, ...args] : args
  const child = spawn(command, commandArgs, {
    cwd,
    env: process.env,
    stdio: 'inherit',
  })
  children.push(child)
  child.on('error', (error) => {
    console.error(`${label} failed to start:`, error)
    void shutdown(1)
  })
  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.error(`${label} stopped (${signal ?? `exit ${code}`}).`)
      void shutdown(code ?? 1)
    }
  })
  return child
}

async function waitFor(url, label) {
  const deadline = Date.now() + 45_000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // The dev server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`${label} did not become ready at ${url}`)
}

async function shutdown(exitCode = 0) {
  if (shuttingDown) return
  shuttingDown = true

  await listener?.close().catch(() => undefined)
  await ngrok.kill().catch(() => undefined)
  for (const child of children) child.kill('SIGTERM')

  setTimeout(() => process.exit(exitCode), 250).unref()
}

process.once('SIGINT', () => void shutdown())
process.once('SIGTERM', () => void shutdown())

try {
  start('API Gateway', ['run', 'dev', '--prefix', 'services'], repositoryDir)
  start('Channels', ['run', 'dev'], channelsDir)

  await Promise.all([
    waitFor('http://localhost:4000/health', 'API Gateway'),
    waitFor('http://localhost:3000/', 'Channels'),
  ])

  listener = await ngrok.forward({
    addr: 3000,
    authtoken_from_env: true,
    ...(process.env.NGROK_DOMAIN ? { domain: process.env.NGROK_DOMAIN } : {}),
  })

  const publicUrl = listener.url()
  if (!publicUrl) throw new Error('ngrok did not return a public URL')

  console.log(
    [
      '',
      'USSD development environment is ready.',
      `Africa's Talking callback URL: ${publicUrl}/webhooks/ussd`,
      '',
      'Paste that HTTPS URL into the Africa’s Talking USSD callback field.',
      'Keep this terminal open; press Ctrl+C to stop all three processes.',
      '',
    ].join('\n'),
  )
} catch (error) {
  console.error('Could not start the USSD environment:', error)
  await shutdown(1)
}
