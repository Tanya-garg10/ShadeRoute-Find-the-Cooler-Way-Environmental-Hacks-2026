export interface LatLng {
  lat: number;
  lng: number;
}

export type RouteType = 'shade-optimized' | 'direct' | 'canopy-max';

export interface RouteSegment {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  shadeLevel: 'dense_canopy' | 'moderate_shade' | 'open_sun' | 'unknown';
  shadePercent: number;
  surfaceType?: 'asphalt' | 'concrete_pavement' | 'green_walkway' | 'covered_arcade';
}

export interface RouteAlternative {
  id: RouteType;
  name: string;
  badgeLabel: string;
  distanceMeters: number;
  durationMinutes: number;
  shadeCoveragePercent: number;
  exposureScore: number; // 0 (coolest/lowest exposure) to 100 (extreme heat exposure)
  exposureTier: 'Low Exposure' | 'Moderate Exposure' | 'High Exposure' | 'Extreme Heat Risk';
  confidence: 'High' | 'Moderate' | 'Limited (Sparse Shade Data)';
  confidenceScore: number; // 0 to 100
  coordinates: [number, number][]; // [lat, lng]
  segments: RouteSegment[];
  recommendationReason: string;
  treeCanopyPercent: number;
  coveredWalkwayPercent: number;
  waterPointsEnRoute: number;
  shadedRestSpotsEnRoute: number;
  scoreBreakdown: {
    baseTemperaturePenalty: number;
    solarRadiationPenalty: number;
    unshadedDurationPenalty: number;
    surfaceAlbedoPenalty: number;
    shadeMitigationCredit: number;
  };
  tradeoffSummary: string;
  isRecommended: boolean;
}

export interface ShadeFeature {
  id: string;
  type: 'tree_canopy_polygon' | 'shaded_corridor' | 'water_fountain' | 'shaded_bench' | 'community_report';
  name: string;
  coordinates: [number, number] | [number, number][]; // point or polygon
  verified: boolean;
  canopyDensity?: number; // 0-100%
  description?: string;
  reportedAt?: string;
}

export type ComfortMode = 'max-shade' | 'balanced' | 'fastest' | 'accessible-rest';

export interface ShadeGapStreet {
  id: string;
  streetName: string;
  locality: string;
  coordinates: [number, number][];
  lengthMeters: number;
  status: 'severe_gap' | 'low_shade' | 'well_shaded' | 'unknown_data';
  shadePercent: number;
  pedestrianVolume: 'High' | 'Moderate' | 'Low';
  priorityForGreening: 'Urgent' | 'Medium' | 'Sufficient';
  communityPlantingVotes: number;
  description: string;
}

export interface TimeShiftSlot {
  hour: number;
  displayTime: string;
  tempC: number;
  uvIndex: number;
  solarIrradianceWpm2: number;
  estimatedExposureScore: number;
  exposureTier: 'Low Exposure' | 'Moderate Exposure' | 'High Exposure' | 'Extreme Heat Risk';
  recommendation: 'Ideal Window' | 'Moderate Heat' | 'High Sun' | 'Hazardous Peak';
  exposureDiffPercent: number; // e.g. -42% vs current
  isCurrentHour?: boolean;
}

export type CommunityCategory = 
  | 'shaded_path'
  | 'tree_canopy'
  | 'shaded_bench'
  | 'water_point'
  | 'broken_shade'
  | 'tree_planting_target';

export interface CommunityReport {
  id: string;
  category: CommunityCategory;
  title: string;
  description: string;
  lat: number;
  lng: number;
  locationName: string;
  createdAt: string;
  verificationCount: number;
  status: 'community_submitted' | 'verified' | 'under_review';
  reportedBy: string;
  upvotedBySession?: boolean;
}

export interface WeatherData {
  temperatureC: number;
  apparentTemperatureC: number;
  relativeHumidity: number;
  uvIndex: number;
  directRadiationWpm2: number;
  condition: string;
  timestamp: string;
  isSimulated?: boolean;
}

export interface ScoringParams {
  ambientTempC: number;
  timeOfDayHour: number; // 0-23
  routeDurationMin: number;
  shadeCoveragePercent: number;
  treeCanopyPercent: number;
  coveredWalkwayPercent: number;
  dataConfidencePercent: number;
  uvIndex?: number;
}

export interface LocationPreset {
  id: string;
  city: string;
  name: string;
  start: { name: string; lat: number; lng: number };
  end: { name: string; lat: number; lng: number };
  context: string;
}
