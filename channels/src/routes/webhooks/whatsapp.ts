import { createHmac, timingSafeEqual } from 'node:crypto'

import { createFileRoute } from '@tanstack/react-router'

import type { ValuationResponse } from '../../contracts/valuation'
import { compareBrokerOffer } from '../../contracts/valuation'
import {
  compactPrice,
  countyOptions,
  cropOptions,
  hasUsableValuation,
  makeValuationRequest,
  optionMenu,
  positiveNumber,
  resolveOption,
  valuationSummary,
} from '../../lib/channel-flow'
import { requestValuation } from '../../lib/api-gateway.server'

type ConversationStage = 'crop' | 'quantity' | 'county' | 'broker-offer'

type Conversation = {
  stage: ConversationStage
  crop?: string
  cropLabel?: string
  quantityKg?: number
  county?: string
  valuation?: ValuationResponse
  updatedAt: number
}

type WhatsAppTextMessage = {
  from: string
  id: string
  timestamp?: string
  type: string
  text?: { body?: string }
}

type WhatsAppPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: WhatsAppTextMessage[]
      }
    }>
  }>
}

const conversations = new Map<string, Conversation>()
const processedMessageIds = new Map<string, number>()
const CONVERSATION_TTL_MS = 30 * 60 * 1000

export const Route = createFileRoute('/webhooks/whatsapp')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const mode = url.searchParams.get('hub.mode')
        const token = url.searchParams.get('hub.verify_token')
        const challenge = url.searchParams.get('hub.challenge')
        const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN

        if (!expectedToken) {
          return new Response('WhatsApp verification is not configured.', {
            status: 503,
          })
        }

        if (mode === 'subscribe' && token === expectedToken && challenge) {
          return new Response(challenge, {
            headers: { 'content-type': 'text/plain; charset=utf-8' },
          })
        }

        return new Response('Verification failed.', { status: 403 })
      },
      POST: async ({ request }) => {
        const rawBody = await request.text()
        const signature = request.headers.get('x-hub-signature-256')

        if (!isValidMetaSignature(rawBody, signature)) {
          return new Response('Invalid signature.', { status: 401 })
        }

        let payload: WhatsAppPayload
        try {
          payload = JSON.parse(rawBody) as WhatsAppPayload
        } catch {
          return new Response('Invalid JSON.', { status: 400 })
        }

        const messages = extractMessages(payload)
        pruneConversations()

        try {
          for (const message of messages) {
            if (message.type !== 'text' || !message.text?.body) continue
            if (processedMessageIds.has(message.id)) continue
            const reply = await handleMessage(message.from, message.text.body)
            await sendWhatsAppText(message.from, reply)
            processedMessageIds.set(message.id, Date.now())
          }
        } catch (error) {
          console.error('WhatsApp channel processing failed', error)
          return Response.json({ received: false }, { status: 500 })
        }

        return Response.json({ received: true })
      },
    },
  },
})

function extractMessages(payload: WhatsAppPayload) {
  return (
    payload.entry?.flatMap(
      (entry) =>
        entry.changes?.flatMap((change) => change.value?.messages ?? []) ?? [],
    ) ?? []
  )
}

function isValidMetaSignature(rawBody: string, signature: string | null) {
  const secret = process.env.WHATSAPP_APP_SECRET

  if (!secret) {
    if (process.env.NODE_ENV === 'production') return false
    console.warn(
      'WHATSAPP_APP_SECRET is not set; signature check skipped outside production.',
    )
    return true
  }

  if (!signature?.startsWith('sha256=')) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest()
  const suppliedHex = signature.slice('sha256='.length)
  if (!/^[a-f0-9]{64}$/i.test(suppliedHex)) return false
  const supplied = Buffer.from(suppliedHex, 'hex')
  return (
    expected.length === supplied.length && timingSafeEqual(expected, supplied)
  )
}

async function handleMessage(from: string, rawText: string): Promise<string> {
  const text = rawText.trim()
  const normalized = text.toLowerCase()

  if (['start', 'menu', 'hello', 'hi', 'price'].includes(normalized)) {
    conversations.set(from, { stage: 'crop', updatedAt: Date.now() })
    return `Welcome to JuaBei. Choose your crop:\n${optionMenu(cropOptions)}`
  }

  const current = conversations.get(from)
  if (!current) {
    conversations.set(from, { stage: 'crop', updatedAt: Date.now() })
    return `Welcome to JuaBei. Reply with a crop number:\n${optionMenu(cropOptions)}`
  }

  current.updatedAt = Date.now()

  if (current.stage === 'crop') {
    const crop = resolveOption(text, cropOptions)
    if (!crop) return `Choose one of these crops:\n${optionMenu(cropOptions)}`
    Object.assign(current, {
      stage: 'quantity' as const,
      crop: crop.value,
      cropLabel: crop.label,
    })
    return `How many kilograms of ${crop.label} do you have?`
  }

  if (current.stage === 'quantity') {
    const quantityKg = positiveNumber(text)
    if (!quantityKg)
      return 'Enter a quantity greater than zero, for example 500.'
    Object.assign(current, { stage: 'county' as const, quantityKg })
    return `Choose your county:\n${optionMenu(countyOptions)}`
  }

  if (current.stage === 'county') {
    const county = resolveOption(text, countyOptions)
    if (!county)
      return `Choose one of these counties:\n${optionMenu(countyOptions)}`
    if (!current.crop || !current.quantityKg) {
      conversations.delete(from)
      return 'Your session expired. Reply START to begin again.'
    }

    const valuation = await requestValuation(
      makeValuationRequest(current.crop, current.quantityKg, county.value),
    )

    if (!hasUsableValuation(valuation)) {
      conversations.delete(from)
      return 'Market prices are still being prepared. Reply START to try again shortly.'
    }

    Object.assign(current, {
      stage: 'broker-offer' as const,
      county: county.value,
      valuation,
    })
    return `Fair range for ${current.cropLabel}: ${valuationSummary(
      valuation,
    )}\nReply with the broker offer per kg, or 0 to finish.`
  }

  const brokerOffer = Number(text)
  if (!Number.isFinite(brokerOffer) || brokerOffer < 0) {
    return 'Enter the broker offer per kg, or 0 to finish.'
  }

  if (!current.valuation) {
    conversations.delete(from)
    return 'Your session expired. Reply START to begin again.'
  }

  if (brokerOffer === 0) {
    conversations.delete(from)
    return `Your JuaBei estimate is ${valuationSummary(
      current.valuation,
    )} Reply START whenever you want another valuation.`
  }

  const comparison = compareBrokerOffer(
    brokerOffer,
    current.valuation.priceRange,
  )
  conversations.delete(from)

  if (comparison === 'below') {
    return `That offer is below the fair range. Consider negotiating toward at least KES ${compactPrice(
      current.valuation.priceRange.low,
    )}/kg. Reply START for another valuation.`
  }

  if (comparison === 'above') {
    return 'That offer is above the fair range. Confirm grade, deductions, and payment timing before selling. Reply START for another valuation.'
  }

  return 'That offer is within the fair range. Confirm quantity, deductions, and payment timing before selling. Reply START for another valuation.'
}

async function sendWhatsAppText(to: string, body: string) {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const graphApiBaseUrl = process.env.WHATSAPP_GRAPH_API_BASE_URL

  if (!token || !phoneNumberId || !graphApiBaseUrl) {
    throw new Error(
      'WhatsApp sending requires WHATSAPP_CLOUD_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID, and WHATSAPP_GRAPH_API_BASE_URL.',
    )
  }

  const response = await fetch(
    `${graphApiBaseUrl.replace(/\/$/, '')}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body },
      }),
      signal: AbortSignal.timeout(10_000),
    },
  )

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`WhatsApp reply failed with ${response.status}: ${details}`)
  }
}

function pruneConversations() {
  const cutoff = Date.now() - CONVERSATION_TTL_MS
  for (const [phoneNumber, conversation] of conversations) {
    if (conversation.updatedAt < cutoff) conversations.delete(phoneNumber)
  }
  for (const [messageId, processedAt] of processedMessageIds) {
    if (processedAt < cutoff) processedMessageIds.delete(messageId)
  }
}
