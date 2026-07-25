import { createFileRoute } from '@tanstack/react-router'

import type {
  ValuationRequest,
  ValuationResponse,
} from '../../contracts/valuation'
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

type UssdSession = {
  request: ValuationRequest
  valuation: ValuationResponse
  updatedAt: number
}

const sessions = new Map<string, UssdSession>()
const SESSION_TTL_MS = 10 * 60 * 1000

export const Route = createFileRoute('/webhooks/ussd')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData()
        const sessionId = String(form.get('sessionId') ?? '')
        const text = String(form.get('text') ?? '')
        const steps = text ? text.split('*') : []

        pruneSessions()

        if (steps.length === 0) {
          return ussd(
            `CON Welcome to JuaBei.\nChoose your crop:\n${optionMenu(cropOptions)}`,
          )
        }

        const crop = resolveOption(steps[0], cropOptions)
        if (!crop)
          return ussd(
            'END That crop option is not available. Please try again.',
          )

        if (steps.length === 1) {
          return ussd(`CON Enter the quantity of ${crop.label} in kilograms:`)
        }

        const quantityKg = positiveNumber(steps[1])
        if (!quantityKg)
          return ussd('END Enter a valid quantity greater than zero.')

        if (steps.length === 2) {
          return ussd(`CON Choose your county:\n${optionMenu(countyOptions)}`)
        }

        const county = resolveOption(steps[2], countyOptions)
        if (!county)
          return ussd(
            'END That county option is not available. Please try again.',
          )

        const valuationRequest = makeValuationRequest(
          crop.value,
          quantityKg,
          county.value,
        )

        if (steps.length === 3) {
          try {
            const valuation = await requestValuation(valuationRequest)
            if (!hasUsableValuation(valuation)) {
              return ussd(
                'END Market prices are still being prepared. Please try again shortly.',
              )
            }

            sessions.set(sessionId, {
              request: valuationRequest,
              valuation,
              updatedAt: Date.now(),
            })

            return ussd(
              `CON Fair range: ${valuationSummary(valuation)}\nEnter the broker offer per kg, or 0 to finish:`,
            )
          } catch (error) {
            console.error('USSD valuation failed', error)
            return ussd(
              'END We could not check the market price. Please try again later.',
            )
          }
        }

        if (steps.length === 4) {
          const brokerOffer = Number(steps[3])
          if (!Number.isFinite(brokerOffer) || brokerOffer < 0) {
            return ussd('END Enter a valid broker offer.')
          }

          if (brokerOffer === 0) {
            return ussd(
              `END JuaBei fair range for ${crop.label}: ${valuationSummary(
                sessions.get(sessionId)?.valuation ??
                  (await requestValuation(valuationRequest)),
              )}`,
            )
          }

          try {
            const valuation =
              sessions.get(sessionId)?.valuation ??
              (await requestValuation(valuationRequest))
            sessions.delete(sessionId)

            if (brokerOffer < valuation.priceRange.low) {
              return ussd(
                `END The offer is below the fair range. Consider negotiating toward at least KES ${compactPrice(
                  valuation.priceRange.low,
                )}/kg.`,
              )
            }

            if (brokerOffer > valuation.priceRange.high) {
              return ussd(
                'END The offer is above the fair range. Confirm grade, deductions, and payment timing before selling.',
              )
            }

            return ussd(
              'END The offer is within the fair range. Confirm quantity, deductions, and payment timing before selling.',
            )
          } catch (error) {
            console.error('USSD broker comparison failed', error)
            return ussd(
              'END We could not compare the offer. Please try again later.',
            )
          }
        }

        return ussd(
          'END This session has ended. Dial again to start a new valuation.',
        )
      },
    },
  },
})

function ussd(body: string) {
  return new Response(body, {
    headers: {
      'cache-control': 'no-store',
      'content-type': 'text/plain; charset=utf-8',
    },
  })
}

function pruneSessions() {
  const cutoff = Date.now() - SESSION_TTL_MS
  for (const [sessionId, session] of sessions) {
    if (session.updatedAt < cutoff) sessions.delete(sessionId)
  }
}
