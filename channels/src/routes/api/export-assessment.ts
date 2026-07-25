import { createFileRoute } from '@tanstack/react-router'

import {
  ApiGatewayError,
  requestExportAssessment,
} from '../../lib/api-gateway.server'

export const Route = createFileRoute('/api/export-assessment')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null)

        try {
          const assessment = await requestExportAssessment(body)
          return Response.json(assessment)
        } catch (error) {
          if (error instanceof ApiGatewayError) {
            return Response.json(
              { error: error.message, details: error.details },
              { status: error.status },
            )
          }

          console.error('Unexpected export assessment proxy error', error)
          return Response.json(
            { error: 'Unable to assess this crop for export.' },
            { status: 500 },
          )
        }
      },
    },
  },
})
