import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import type {
  ExportAssessmentRequest,
  ExportAssessmentResponse,
} from '../contracts/export-assessment'
import type {
  BrokerComparison,
  ValuationRequest,
  ValuationResponse,
} from '../contracts/valuation'
import type { EncodedImage } from '../lib/image'
import { compareBrokerOffer } from '../contracts/valuation'
import { prepareCropImage } from '../lib/image'

export const Route = createFileRoute('/')({ component: Home })

type ApiErrorBody = {
  error?: string
}

const initialValuation: ValuationRequest = {
  crop: '',
  variety: '',
  quantityKg: 0,
  county: '',
  grade: '',
  harvestStatus: '',
}

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = (await response.json().catch(() => null)) as
    ApiErrorBody | T | null

  if (!response.ok) {
    throw new Error(
      (body as ApiErrorBody | null)?.error ??
        'The request could not be completed.',
    )
  }

  return body as T
}

function formatMoney(value: number, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function Home() {
  const [isOnline, setIsOnline] = useState(true)
  const [valuationForm, setValuationForm] = useState(initialValuation)
  const [valuation, setValuation] = useState<ValuationResponse | null>(null)
  const [valuationError, setValuationError] = useState('')
  const [isValuing, setIsValuing] = useState(false)
  const [brokerOffer, setBrokerOffer] = useState('')
  const [brokerComparison, setBrokerComparison] =
    useState<BrokerComparison | null>(null)
  const [cropImage, setCropImage] = useState<EncodedImage | null>(null)
  const [imageError, setImageError] = useState('')
  const [exportDetails, setExportDetails] = useState({
    fertilizerOrManure: '',
    cropProtection: '',
    harvestDetails: '',
    productionRecords: '',
  })
  const [assessment, setAssessment] = useState<ExportAssessmentResponse | null>(
    null,
  )
  const [assessmentError, setAssessmentError] = useState('')
  const [isAssessing, setIsAssessing] = useState(false)

  useEffect(() => {
    const updateConnection = () => setIsOnline(navigator.onLine)
    updateConnection()
    window.addEventListener('online', updateConnection)
    window.addEventListener('offline', updateConnection)
    return () => {
      window.removeEventListener('online', updateConnection)
      window.removeEventListener('offline', updateConnection)
    }
  }, [])

  useEffect(
    () => () => {
      if (cropImage) URL.revokeObjectURL(cropImage.previewUrl)
    },
    [cropImage],
  )

  function updateValuationField<TKey extends keyof ValuationRequest>(
    key: TKey,
    value: ValuationRequest[TKey],
  ) {
    setValuationForm((current) => ({ ...current, [key]: value }))
  }

  async function submitValuation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsValuing(true)
    setValuationError('')
    setValuation(null)
    setBrokerComparison(null)

    try {
      const result = await postJson<ValuationResponse>(
        '/api/valuation',
        valuationForm,
      )
      setValuation(result)
    } catch (error) {
      setValuationError(
        error instanceof Error ? error.message : 'Unable to value this crop.',
      )
    } finally {
      setIsValuing(false)
    }
  }

  function compareOffer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valuation) return
    const offer = Number(brokerOffer)
    if (!Number.isFinite(offer) || offer <= 0) return
    setBrokerComparison(compareBrokerOffer(offer, valuation.priceRange))
  }

  async function selectImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setImageError('')

    try {
      const prepared = await prepareCropImage(file)
      setCropImage((current) => {
        if (current) URL.revokeObjectURL(current.previewUrl)
        return prepared
      })
    } catch (error) {
      setImageError(
        error instanceof Error ? error.message : 'Unable to use that photo.',
      )
      event.target.value = ''
    }
  }

  async function submitAssessment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!cropImage || !valuation) return
    setIsAssessing(true)
    setAssessmentError('')
    setAssessment(null)

    const payload: ExportAssessmentRequest = {
      crop: valuationForm.crop,
      quantityKg: valuationForm.quantityKg,
      imageBase64: cropImage.imageBase64,
      mimeType: cropImage.mimeType,
      ...exportDetails,
    }

    try {
      const result = await postJson<ExportAssessmentResponse>(
        '/api/export-assessment',
        payload,
      )
      setAssessment(result)
    } catch (error) {
      setAssessmentError(
        error instanceof Error ? error.message : 'Unable to assess this crop.',
      )
    } finally {
      setIsAssessing(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="JuaBei home">
          <span className="wordmark-mark" aria-hidden="true">
            J
          </span>
          JuaBei
        </a>
        <span className={`connection-status ${isOnline ? '' : 'is-offline'}`}>
          {isOnline ? 'Connected' : 'Offline'}
        </span>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">Fair crop pricing</p>
          <h1>Know your price before you sell.</h1>
          <p className="intro-copy">
            Compare current market evidence, check a broker offer, and explore
            export readiness from one simple flow.
          </p>
        </div>
        <aside className="trust-note" aria-label="How the estimate works">
          <strong>Built from evidence</strong>
          <span>KAMIS, cooperative records, and verified farmer sales.</span>
        </aside>
      </section>

      {!isOnline && (
        <div className="notice" role="status">
          You can continue filling the form. Reconnect before requesting a
          price.
        </div>
      )}

      <section className="flow-section" aria-labelledby="valuation-heading">
        <div className="section-heading">
          <span className="step-number">1</span>
          <div>
            <h2 id="valuation-heading">Tell us about your crop</h2>
            <p>Fields marked required help us find comparable prices.</p>
          </div>
        </div>

        <form className="form-grid" onSubmit={submitValuation}>
          <label>
            Crop
            <input
              required
              autoComplete="off"
              value={valuationForm.crop}
              onChange={(event) =>
                updateValuationField('crop', event.target.value)
              }
              placeholder="For example, maize"
            />
          </label>
          <label>
            Variety
            <input
              value={valuationForm.variety}
              onChange={(event) =>
                updateValuationField('variety', event.target.value)
              }
              placeholder="Optional"
            />
          </label>
          <label>
            Quantity in kilograms
            <input
              required
              inputMode="decimal"
              min="0.1"
              step="0.1"
              type="number"
              value={valuationForm.quantityKg || ''}
              onChange={(event) =>
                updateValuationField('quantityKg', Number(event.target.value))
              }
              placeholder="500"
            />
          </label>
          <label>
            County
            <input
              required
              value={valuationForm.county}
              onChange={(event) =>
                updateValuationField('county', event.target.value)
              }
              placeholder="For example, Nakuru"
            />
          </label>
          <label>
            Grade
            <select
              value={valuationForm.grade}
              onChange={(event) =>
                updateValuationField('grade', event.target.value)
              }
            >
              <option value="">Not sure</option>
              <option value="grade-1">Grade 1</option>
              <option value="grade-2">Grade 2</option>
              <option value="ungraded">Ungraded</option>
            </select>
          </label>
          <label>
            Harvest status
            <select
              value={valuationForm.harvestStatus}
              onChange={(event) =>
                updateValuationField('harvestStatus', event.target.value)
              }
            >
              <option value="">Select status</option>
              <option value="ready">Ready to harvest</option>
              <option value="harvested">Already harvested</option>
              <option value="planning">Planning ahead</option>
            </select>
          </label>

          {valuationError && (
            <p className="form-error form-span" role="alert">
              {valuationError}
            </p>
          )}

          <button
            className="primary-button form-span"
            disabled={isValuing || !isOnline}
          >
            {isValuing ? 'Checking market evidence...' : 'Get my fair price'}
          </button>
        </form>
      </section>

      {valuation && (
        <section className="result-section" aria-labelledby="result-heading">
          <div className="section-heading">
            <span className="step-number">2</span>
            <div>
              <h2 id="result-heading">Your price estimate</h2>
              <p>
                {valuationForm.quantityKg.toLocaleString()} kg of{' '}
                {valuationForm.crop}
              </p>
            </div>
          </div>

          <div className="price-result">
            <div>
              <span>Fair price range per kg</span>
              <strong>
                {formatMoney(valuation.priceRange.low)} -{' '}
                {formatMoney(valuation.priceRange.high)}
              </strong>
            </div>
            <dl>
              <div>
                <dt>Best estimate</dt>
                <dd>{formatMoney(valuation.weightedMedian)}/kg</dd>
              </div>
              <div>
                <dt>Estimated crop value</dt>
                <dd>{formatMoney(valuation.estimatedValue)}</dd>
              </div>
              <div>
                <dt>Confidence</dt>
                <dd>{Math.round(valuation.confidenceScore * 100)}%</dd>
              </div>
            </dl>
          </div>

          {valuation.evidence.length > 0 ? (
            <div className="evidence-list">
              <h3>Evidence used</h3>
              {valuation.evidence.map((item, index) => (
                <div key={`${item.source}-${item.recordedAt}-${index}`}>
                  <span>{item.source.replace('_', ' ')}</span>
                  <strong>{formatMoney(item.pricePerKg)}/kg</strong>
                  <time>
                    {new Date(item.recordedAt).toLocaleDateString('en-KE')}
                  </time>
                </div>
              ))}
            </div>
          ) : (
            <p className="notice">
              The pricing engine returned no evidence records. Person B still
              needs to connect the market-price fixture.
            </p>
          )}

          <form className="offer-check" onSubmit={compareOffer}>
            <label>
              What did the broker offer per kg?
              <input
                required
                inputMode="decimal"
                min="0.01"
                step="0.01"
                type="number"
                value={brokerOffer}
                onChange={(event) => setBrokerOffer(event.target.value)}
                placeholder="Enter the offer in KES"
              />
            </label>
            <button className="secondary-button">Compare offer</button>
          </form>

          {brokerComparison && (
            <div
              className={`comparison-result comparison-${brokerComparison}`}
              role="status"
            >
              <strong>
                {brokerComparison === 'above' &&
                  'This offer is above the fair range.'}
                {brokerComparison === 'within' &&
                  'This offer is within the fair range.'}
                {brokerComparison === 'below' &&
                  'This offer is below the fair range.'}
              </strong>
              <span>
                {brokerComparison === 'below'
                  ? `Consider negotiating toward at least ${formatMoney(valuation.priceRange.low)}/kg.`
                  : 'Confirm the final quantity, grade, deductions, and payment timing before selling.'}
              </span>
            </div>
          )}
        </section>
      )}

      {valuation && (
        <section className="flow-section" aria-labelledby="export-heading">
          <div className="section-heading">
            <span className="step-number">3</span>
            <div>
              <h2 id="export-heading">Check visible export quality</h2>
              <p>
                A photo can flag visible quality issues. Records and formal
                inspection are still required.
              </p>
            </div>
          </div>

          <form className="export-form" onSubmit={submitAssessment}>
            <label className="photo-input">
              <span>Crop photo</span>
              <input
                required
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                type="file"
                onChange={selectImage}
              />
              <small>
                Use a clear, well-lit photo. It will be reduced before upload.
              </small>
            </label>

            {cropImage && (
              <img
                className="photo-preview"
                src={cropImage.previewUrl}
                alt="Selected crop"
              />
            )}
            {imageError && (
              <p className="form-error" role="alert">
                {imageError}
              </p>
            )}

            <div className="form-grid">
              {(
                [
                  ['fertilizerOrManure', 'Fertilizer or manure used'],
                  ['cropProtection', 'Crop protection used'],
                  ['harvestDetails', 'Harvest details'],
                  ['productionRecords', 'Production records'],
                ] as const
              ).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <textarea
                    rows={3}
                    value={exportDetails[key]}
                    onChange={(event) =>
                      setExportDetails((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    placeholder="Add any details you have"
                  />
                </label>
              ))}
            </div>

            {assessmentError && (
              <p className="form-error" role="alert">
                {assessmentError}
              </p>
            )}
            <button
              className="primary-button"
              disabled={!cropImage || isAssessing || !isOnline}
            >
              {isAssessing
                ? 'Reviewing the crop photo...'
                : 'Check export readiness'}
            </button>
          </form>

          {assessment && (
            <div className="assessment-result" aria-live="polite">
              <strong>
                {assessment.eligible
                  ? 'The crop passed the current visual check.'
                  : 'The crop needs attention before export.'}
              </strong>
              <span>
                Visual confidence: {Math.round(assessment.confidence * 100)}%
              </span>

              {assessment.qualityIssues.length > 0 && (
                <div>
                  <h3>Visible quality issues</h3>
                  <ul>
                    {assessment.qualityIssues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {assessment.complianceGaps.length > 0 && (
                <div>
                  <h3>Requirements to confirm</h3>
                  <ul>
                    {assessment.complianceGaps.map((gap) => (
                      <li key={gap}>{gap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {assessment.internationalMarketPrice && (
                <div className="export-price">
                  <span>International benchmark</span>
                  <strong>
                    {formatMoney(
                      assessment.internationalMarketPrice.pricePerKg,
                      assessment.internationalMarketPrice.currency,
                    )}
                    /kg
                  </strong>
                  <small>
                    Estimated gross value:{' '}
                    {formatMoney(
                      assessment.internationalMarketPrice.estimatedExportValue,
                      assessment.internationalMarketPrice.currency,
                    )}
                    . Logistics and export costs are not deducted.
                  </small>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <footer>
        <strong>JuaBei</strong>
        <span>Evidence before negotiation.</span>
      </footer>
    </main>
  )
}
