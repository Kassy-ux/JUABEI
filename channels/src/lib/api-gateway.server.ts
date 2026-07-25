import type {
  ExportAssessmentRequest,
  ExportAssessmentResponse,
} from '../contracts/export-assessment'
import type {
  ValuationRequest,
  ValuationResponse,
} from '../contracts/valuation'

const DEFAULT_GATEWAY_URL = 'http://localhost:4000'
const REQUEST_TIMEOUT_MS = 15_000

export class ApiGatewayError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiGatewayError'
  }
}

function gatewayUrl() {
  return (process.env.API_GATEWAY_URL ?? DEFAULT_GATEWAY_URL).replace(/\/$/, '')
}

async function postJson<TResponse>(
  path: string,
  payload: unknown,
): Promise<TResponse> {
  let response: Response

  try {
    response = await fetch(`${gatewayUrl()}${path}`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'TimeoutError'
        ? 'The pricing service took too long to respond.'
        : 'The pricing service is currently unavailable.'
    throw new ApiGatewayError(message, 503, error)
  }

  const body = (await response.json().catch(() => null)) as unknown

  if (!response.ok) {
    throw new ApiGatewayError(
      response.status === 400
        ? 'Some of the submitted details are invalid.'
        : 'The pricing service could not complete this request.',
      response.status,
      body,
    )
  }

  return body as TResponse
}

export function requestValuation(payload: ValuationRequest) {
  return postJson<ValuationResponse>('/valuation', payload)
}

export function requestExportAssessment(payload: ExportAssessmentRequest) {
  return postJson<ExportAssessmentResponse>('/export-assessment', payload)
}
