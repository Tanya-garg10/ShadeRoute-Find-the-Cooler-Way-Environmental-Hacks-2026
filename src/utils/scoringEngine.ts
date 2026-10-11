import { ScoringParams } from '../types';

export interface ScoringWeights {
  temperatureWeight: number;    // Weight of ambient heat base (default: 0.30)
  solarIrradianceWeight: number; // Weight of unshaded direct sunlight / solar angle (default: 0.35)
  durationWeight: number;       // Weight of total time spent walking under sun (default: 0.20)
  surfaceAlbedoWeight: number;  // Weight of heat reradiation from unshaded asphalt (default: 0.15)
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  temperatureWeight: 0.30,
  solarIrradianceWeight: 0.35,
  durationWeight: 0.20,
  surfaceAlbedoWeight: 0.15,
};

export interface ExposureScoreResult {
  score: number | null; // null if shade data is completely unavailable or confidence < 20%
  isAvailable: boolean;
  unavailableReason?: string;
  tier: 'Low Exposure' | 'Moderate Exposure' | 'High Exposure' | 'Extreme Heat Risk' | 'Unavailable';
  confidence: 'High' | 'Moderate' | 'Limited (Sparse Shade Data)' | 'Insufficient Data';
  confidenceScore: number; // 0-100%
  breakdown: {
    baseTemperaturePenalty: number;
    solarRadiationPenalty: number;
    unshadedDurationPenalty: number;
    surfaceAlbedoPenalty: number;
    shadeMitigationCredit: number;
  };
  explanation: string;
  recommendationReason: string;
  disclaimer: string;
}

/**
 * Calculates solar intensity multiplier (0.0 to 1.0) based on hour of day (solar elevation proxy)
 * Peak zenith between 11:30 and 14:30. Zero before dawn (<6h) and after dusk (>19h).
 */
export function calculateSolarIntensity(hour: number): number {
  if (hour < 6 || hour >= 19) {
    return 0.05; // Ambient twilight/night diffuse baseline
  }
  // Model zenith angle using normalized diurnal sine curve peaking at 13:00 (1 PM)
  const normalizedPeak = 13.0;
  const radians = ((hour - 6) / (19 - 6)) * Math.PI;
  const baseCurve = Math.sin(radians);
  // Enhance midday intensity curve
  return Math.max(0.05, Math.min(1.0, Math.pow(baseCurve, 0.85)));
}

/**
 * Evaluates estimated pedestrian heat-risk on a 0-100 scale.
 * 0 = Minimal thermal stress (night or full continuous canopy at mild temps)
 * 100 = Severe heat risk (extended midday walk under blazing sun on unshaded blacktop)
 */
export function calculateExposureScore(
  params: ScoringParams,
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): ExposureScoreResult {
  const {
    ambientTempC,
    timeOfDayHour,
    routeDurationMin,
    shadeCoveragePercent,
    treeCanopyPercent,
    coveredWalkwayPercent,
    dataConfidencePercent,
    uvIndex,
  } = params;

  // RULE: If data confidence is below 25%, refuse to invent a fake precision score
  if (dataConfidencePercent < 25) {
    return {
      score: null,
      isAvailable: false,
      unavailableReason: 'Insufficient mapped shade or tree canopy data for this segment.',
      tier: 'Unavailable',
      confidence: 'Insufficient Data',
      confidenceScore: Math.round(dataConfidencePercent),
      breakdown: {
        baseTemperaturePenalty: 0,
        solarRadiationPenalty: 0,
        unshadedDurationPenalty: 0,
        surfaceAlbedoPenalty: 0,
        shadeMitigationCredit: 0,
      },
      explanation: 'Route covers urban sectors without verified tree canopy inventories or shade survey data.',
      recommendationReason: 'Shade data unavailable for this route alternative.',
      disclaimer: 'Estimates suppressed to avoid misleading pedestrians when survey data is sparse.',
    };
  }

  // 1. Ambient temperature factor (normalizes 20°C - 45°C into 0 - 100)
  // Below 20°C is low heat stress; 42°C+ approaches extreme physiological stress
  const clampedTemp = Math.max(15, Math.min(50, ambientTempC));
  const tempFactor = Math.max(0, Math.min(100, ((clampedTemp - 20) / 24) * 100));

  // 2. Solar radiation factor
  const solarIntensity = calculateSolarIntensity(timeOfDayHour);
  const uvFactor = uvIndex !== undefined ? Math.min(12, uvIndex) / 10 : solarIntensity;
  const effectiveSunStrength = Math.max(solarIntensity, uvFactor * 0.9);

  // 3. Unshaded fraction of the route
  const clampedShade = Math.max(0, Math.min(100, shadeCoveragePercent));
  const unshadedFraction = (100 - clampedShade) / 100;

  // Solar radiation penalty: directly proportional to sun intensity and unshaded portion
  const solarPenalty = Math.round(effectiveSunStrength * unshadedFraction * 100);

  // 4. Duration penalty: walking under heat stress compounds non-linearly
  // 10 mins walk = low fatigue; 30+ mins = substantial thermal accumulation
  const durationNormalized = Math.min(1.0, Math.pow(routeDurationMin / 40, 0.85));
  const unshadedDurationPenalty = Math.round(durationNormalized * unshadedFraction * 100);

  // 5. Surface Albedo & Microclimate:
  // Asphalt exposed to midday sun reradiates 10-15°C higher surface heat than grass/canopied paths
  const surfaceAlbedoPenalty = Math.round(effectiveSunStrength * unshadedFraction * 85);

  // 6. Shade mitigation credit
  const shadeMitigationCredit = Math.round(
    ((treeCanopyPercent * 0.6 + coveredWalkwayPercent * 0.4) / 100) * 45
  );

  // Weighted raw exposure score calculation
  const weightedScore =
    tempFactor * weights.temperatureWeight +
    solarPenalty * weights.solarIrradianceWeight +
    unshadedDurationPenalty * weights.durationWeight +
    surfaceAlbedoPenalty * weights.surfaceAlbedoWeight;

  // Apply shade mitigation dampening
  const finalScore = Math.max(0, Math.min(100, Math.round(weightedScore - shadeMitigationCredit * 0.3)));

  // Determine Exposure Tier
  let tier: ExposureScoreResult['tier'] = 'Low Exposure';
  if (finalScore >= 75) {
    tier = 'Extreme Heat Risk';
  } else if (finalScore >= 52) {
    tier = 'High Exposure';
  } else if (finalScore >= 32) {
    tier = 'Moderate Exposure';
  } else {
    tier = 'Low Exposure';
  }

  // Determine Confidence Tier
  let confidence: ExposureScoreResult['confidence'] = 'Moderate';
  if (dataConfidencePercent >= 75) {
    confidence = 'High';
  } else if (dataConfidencePercent < 45) {
    confidence = 'Limited (Sparse Shade Data)';
  }

  // Synthesize qualitative explanation
  const explanation = `${clampedShade}% estimated shade coverage with ${Math.round(ambientTempC)}°C ambient air. Solar intensity is ${(effectiveSunStrength * 100).toFixed(0)}% at ${timeOfDayHour}:00.`;

  let recommendationReason = '';
  if (finalScore < 35) {
    recommendationReason = 'Excellent tree canopy shields majority of walking corridor from direct radiation.';
  } else if (finalScore < 55) {
    recommendationReason = 'Balanced route with intermittent shade, reducing peak midday heat burden.';
  } else if (finalScore < 75) {
    recommendationReason = 'Substantial unshaded pavement exposure; recommend carrying water and sun protection.';
  } else {
    recommendationReason = 'High continuous exposure to midday sunlight and hot pavement; consider shade detours.';
  }

  return {
    score: finalScore,
    isAvailable: true,
    tier,
    confidence,
    confidenceScore: Math.round(dataConfidencePercent),
    breakdown: {
      baseTemperaturePenalty: Math.round(tempFactor),
      solarRadiationPenalty: solarPenalty,
      unshadedDurationPenalty,
      surfaceAlbedoPenalty,
      shadeMitigationCredit,
    },
    explanation,
    recommendationReason,
    disclaimer: 'Exposure score is a relative algorithmic estimate based on tree canopy models and solar geometry. It does not measure body temperature or guarantee thermal comfort.',
  };
}
