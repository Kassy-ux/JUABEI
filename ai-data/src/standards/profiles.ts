export type VisualStandardsProfile = {
  id: string;
  version: string;
  crops: string[];
  visibleChecks: string[];
  limitations: string[];
};

const sharedLimitations = [
  'A photo cannot verify pesticide residue limits, certificates, traceability, or production records.',
  'Final export eligibility requires destination-specific standards checks and human verification.',
];

const profiles: VisualStandardsProfile[] = [
  {
    id: 'generic-produce-visual',
    version: '2026-07-01',
    crops: ['*'],
    visibleChecks: [
      'Look for visible rot, mould, pest damage, bruising, contamination, and severe size inconsistency.',
      'Assess whether lighting, focus, scale, and crop coverage are sufficient for a visual review.',
      'Do not infer invisible chemical, documentary, or regulatory compliance.',
    ],
    limitations: sharedLimitations,
  },
  {
    id: 'maize-visual',
    version: '2026-07-01',
    crops: ['maize', 'dry maize'],
    visibleChecks: [
      'Look for visible mould, discoloration, insect damage, foreign matter, broken kernels, and excess visible moisture.',
      'Assess uniformity only where individual kernels are clearly visible.',
    ],
    limitations: [
      ...sharedLimitations,
      'A photo cannot determine aflatoxin levels or moisture content.',
    ],
  },
  {
    id: 'beans-visual',
    version: '2026-07-01',
    crops: ['bean', 'beans', 'dry beans'],
    visibleChecks: [
      'Look for visible mould, insect holes, shrivelling, foreign matter, discoloration, and broken beans.',
      'Assess visible size and colour uniformity only where the sample is representative.',
    ],
    limitations: sharedLimitations,
  },
  {
    id: 'tomatoes-visual',
    version: '2026-07-01',
    crops: ['tomato', 'tomatoes'],
    visibleChecks: [
      'Look for visible rot, bruising, cracking, pest damage, contamination, and severe ripeness inconsistency.',
      'Assess packaging or handling damage only when it is visible in the supplied image.',
    ],
    limitations: sharedLimitations,
  },
];

export function getVisualStandardsProfile(crop: string, requestedId?: string) {
  const normalizedCrop = crop.trim().toLowerCase();
  if (requestedId) {
    const requested = profiles.find((profile) => profile.id === requestedId);
    if (!requested) throw new Error(`Unknown standards profile: ${requestedId}`);
    if (!requested.crops.includes('*') && !requested.crops.includes(normalizedCrop)) {
      throw new Error(`Standards profile ${requestedId} does not apply to ${crop}.`);
    }
    return requested;
  }

  return (
    profiles.find(
      (profile) =>
        profile.id !== 'generic-produce-visual' && profile.crops.includes(normalizedCrop),
    ) ?? profiles[0]
  );
}

export function listVisualStandardsProfiles() {
  return profiles.map(({ id, version, crops }) => ({ id, version, crops }));
}
