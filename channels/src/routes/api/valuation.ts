import { createFileRoute } from '@tanstack/react-router'

import { ApiGatewayError, requestValuation } from '../../lib/api-gateway.server'

export const Route = createFileRoute('/api/valuation')({
  server: {
    handlers: {
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
