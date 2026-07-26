import { createFileRoute } from '@tanstack/react-router'

import type { MarketScope } from '../../contracts/markets'
import {
  ApiGatewayError,
  requestMarkets,
  requestValuation,
} from '../../lib/api-gateway.server'

export const Route = createFileRoute('/api/valuation')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const crop = url.searchParams.get('crop') ?? ''
        const quantityKg = Number(url.searchParams.get('quantityKg'))
        const scope =
          url.searchParams.get('scope') === 'export' ? 'export' : 'local'

        try {
          const markets = await requestMarkets(
            crop,
            quantityKg,
            scope satisfies MarketScope,
          )
          return Response.json(markets)
        } catch (error) {
          if (error instanceof ApiGatewayError) {
            return Response.json(
              { error: error.message, details: error.details },
              { status: error.status },
            )
          }

          console.error('Unexpected markets proxy error', error)
          return Response.json(
            { error: 'Unable to load markets.' },
            { status: 500 },
          )
        }
      },
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null)

        try {
          const valuation = await requestValuation(body)
          return Response.json(valuation)
        } catch (error) {
          if (error instanceof ApiGatewayError) {
            return Response.json(
              { error: error.message, details: error.details },
              { status: error.status },
            )
          }

          console.error('Unexpected valuation proxy error', error)
          return Response.json(
            { error: 'Unable to get a valuation.' },
            { status: 500 },
          )
        }
      },
    },
  },
})
