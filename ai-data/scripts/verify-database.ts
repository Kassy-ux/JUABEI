import { randomUUID } from 'node:crypto';

import { app } from '../src/app.js';
import { closeDatabaseConnection, getPool } from '../src/db/client.js';

const crop = `integration-test-${randomUUID()}`;
let transactionId: string | undefined;

try {
  const reportResponse = await app.request('/data/transactions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      crop,
      county: 'Nairobi',
      quantityKg: 100,
      pricePerKg: 50,
      channel: 'local_broker',
      buyerReference: 'automated-integration-check',
      reportedBy: 'ai-data-verifier',
      occurredAt: new Date().toISOString(),
    }),
  });
  if (reportResponse.status !== 201) {
    throw new Error(`Transaction report failed: ${reportResponse.status}`);
  }
  const reportBody = (await reportResponse.json()) as {
    transaction: { id: string };
  };
  transactionId = reportBody.transaction.id;

  const pendingResponse = await app.request(`/data/transactions/${transactionId}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      status: 'pending_verification',
      verifiedBy: 'ai-data-verifier',
    }),
  });
  if (pendingResponse.status !== 200) {
    throw new Error(`Pending-verification transition failed: ${pendingResponse.status}`);
  }

  const verifyResponse = await app.request(`/data/transactions/${transactionId}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      status: 'verified',
      verifiedBy: 'ai-data-verifier',
    }),
  });
  if (verifyResponse.status !== 200) {
    throw new Error(`Transaction verification failed: ${verifyResponse.status}`);
  }

  const evidenceResponse = await app.request(
    `/data/market-data?crop=${encodeURIComponent(crop)}&county=Nairobi`,
  );
  const evidenceBody = (await evidenceResponse.json()) as {
    evidence: Array<{ source: string; sourceRecordId: string }>;
  };
  const verifiedEvidence = evidenceBody.evidence.some(
    (point) => point.source === 'verified_sales' && point.sourceRecordId === transactionId,
  );
  if (!verifiedEvidence) {
    throw new Error('Verified transaction did not become market evidence.');
  }

  console.log('Database transaction-to-evidence lifecycle: ok');
} finally {
  if (transactionId) {
    await getPool().query('delete from market_data_points where source_record_id = $1', [
      transactionId,
    ]);
    await getPool().query('delete from transactions where id = $1', [transactionId]);
  }
  await closeDatabaseConnection();
}
