import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Sliders,
  Calculator,
  Server,
  Cloud,
  Database,
  ShieldAlert,
  Code,
  CheckCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import {
  calculateExposureScore,
  DEFAULT_SCORING_WEIGHTS,
  ScoringWeights,
} from '../utils/scoringEngine';

export const MethodologyPage: React.FC = () => {
  // Interactive Simulator state
  const [temp, setTemp] = useState<number>(36);
  const [hour, setHour] = useState<number>(13);
  const [duration, setDuration] = useState<number>(18);
  const [shadePct, setShadePct] = useState<number>(70);
  const [canopyPct, setCanopyPct] = useState<number>(60);
  const [confidence, setConfidence] = useState<number>(85);
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_SCORING_WEIGHTS);
  const [copiedCode, setCopiedCode] = useState(false);

  // Compute live simulated score
  const result = calculateExposureScore(
    {
      ambientTempC: temp,
      timeOfDayHour: hour,
      routeDurationMin: duration,
      shadeCoveragePercent: shadePct,
      treeCanopyPercent: canopyPct,
      coveredWalkwayPercent: Math.max(0, shadePct - canopyPct),
      dataConfidencePercent: confidence,
    },
    weights
  );

  const copyDeploymentSnippet = () => {
    navigator.clipboard.writeText(`sam build\nsam deploy --guided`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex-1 bg-stone-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Scoring Methodology &amp; AWS Architecture
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Transparent mathematical formulas, configurable parameters, and serverless AWS deployment blueprint.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors shadow-sm"
            >
              <Compass className="w-4 h-4 text-lime-300" />
              <span>Back to Route Planner</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-8">
        
        {/* Section 1: Scoring Equation & Weight Simulator */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-6">
          <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                1. Mathematical Formulation &amp; Interactive Simulator
              </h2>
              <p className="text-xs text-stone-500">
                Formula normalized on a 0–100 scale. Higher scores indicate greater estimated heat stress.
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md font-semibold">
              v1.2 Algorithmic Standard
            </span>
          </div>

          {/* Mathematical Equation Display */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 font-mono text-xs text-stone-800 space-y-2">
            <div className="font-bold text-emerald-900">
              ExposureScore = clamp(0, 100, (w_t &times; TempFactor + w_s &times; SolarPenalty + w_d &times; DurationPenalty + w_a &times; SurfacePenalty) - ShadeMitigation)
            </div>
            <div className="text-[11px] text-stone-600 leading-relaxed">
              Where: <br />
              &bull; <strong>TempFactor</strong> = ((clampedTemp - 20) / 24) &times; 100 <br />
              &bull; <strong>SolarPenalty</strong> = SolarIntensity(hour) &times; (1 - ShadeFraction) &times; 100 <br />
              &bull; <strong>DurationPenalty</strong> = (Duration / 40)^0.85 &times; (1 - ShadeFraction) &times; 100 <br />
              &bull; <strong>ShadeMitigation</strong> = ((Canopy% &times; 0.6 + Covered% &times; 0.4) / 100) &times; 45 &times; 0.3
            </div>
          </div>

          {/* Interactive Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Controls (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                Simulate Environmental Inputs:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs text-stone-700 mb-1">
                    <span>Ambient Air Temp</span>
                    <span className="font-bold font-mono text-amber-800">{temp}°C</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="48"
                    value={temp}
                    onChange={(e) => setTemp(parseInt(e.target.value))}
                    className="w-full accent-amber-700 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-stone-700 mb-1">
                    <span>Time of Day (Sun Zenith)</span>
                    <span className="font-bold font-mono text-emerald-800">{hour}:00</span>
                  </div>
                  <input
                    type="range"
                    min="7"
                    max="19"
                    value={hour}
                    onChange={(e) => setHour(parseInt(e.target.value))}
                    className="w-full accent-emerald-800 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-stone-700 mb-1">
                    <span>Walking Duration</span>
                    <span className="font-bold font-mono text-stone-800">{duration} mins</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="60"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full accent-stone-700 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-stone-700 mb-1">
                    <span>Shade Coverage</span>
                    <span className="font-bold font-mono text-emerald-800">{shadePct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={shadePct}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setShadePct(v);
                      if (canopyPct > v) setCanopyPct(v);
                    }}
                    className="w-full accent-emerald-800 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-stone-700 mb-1">
                    <span>Tree Canopy Subset</span>
                    <span className="font-bold font-mono text-emerald-800">{canopyPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={shadePct}
                    value={canopyPct}
                    onChange={(e) => setCanopyPct(parseInt(e.target.value))}
                    className="w-full accent-emerald-800 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-stone-700 mb-1">
                    <span>Data Confidence (Test &lt;25%)</span>
                    <span className="font-bold font-mono text-stone-800">{confidence}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={confidence}
                    onChange={(e) => setConfidence(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Right Live Output (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-stone-50 rounded-xl p-5 border border-stone-200 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Live Engine Output
                </span>
                <span className="text-xs font-semibold text-stone-600 font-mono">
                  Confidence: {result.confidenceScore}%
                </span>
              </div>

              {result.isAvailable ? (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-stone-600">Exposure Score:</span>
                    <div className="text-3xl font-extrabold font-mono text-stone-900">
                      {result.score} <span className="text-xs font-normal text-stone-500">/ 100</span>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-stone-800">
                    Tier: <span className="text-emerald-800">{result.tier}</span> &middot; {result.confidence}
                  </div>

                  <div className="space-y-1 text-[11px] font-mono text-stone-600 border-t border-stone-200 pt-2">
                    <div className="flex justify-between">
                      <span>Base Temp Stress:</span>
                      <span>+{result.breakdown.baseTemperaturePenalty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Solar Radiation Penalty:</span>
                      <span>+{result.breakdown.solarRadiationPenalty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration Unshaded Penalty:</span>
                      <span>+{result.breakdown.unshadedDurationPenalty}</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-bold">
                      <span>Shade Mitigation Credit:</span>
                      <span>-{result.breakdown.shadeMitigationCredit}</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 italic leading-relaxed pt-2 border-t border-stone-200">
                    &quot;{result.explanation}&quot;
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>Shade Data Unavailable</span>
                  </div>
                  <p>{result.unavailableReason}</p>
                  <p className="text-[11px] text-amber-700 italic">
                    The engine refuses to fabricate a random score when survey coverage drops below 25%.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Section 2: AWS Architecture Blueprint */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-6">
          <div className="border-b border-stone-100 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-amber-600" />
                <span>2. AWS Serverless Architecture &amp; Deployment</span>
              </h2>
              <p className="text-xs text-stone-500">
                Production serverless pipeline for high concurrency during heatwave events.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md">
                Current State: Local Full-Stack &amp; AWS Blueprint Ready
              </span>
            </div>
          </div>

          {/* Architecture Diagram in Visual Box */}
          <div className="p-5 rounded-xl bg-stone-900 text-stone-100 space-y-4 font-mono text-xs">
            <div className="text-amber-400 font-bold text-xs uppercase tracking-wider">
              Mermaid Architecture Topology
            </div>
            <div className="overflow-x-auto whitespace-pre leading-relaxed text-stone-300">
{`[React 19 + Leaflet Client]
         |
         | HTTPS (JSON REST)
         v
[Amazon API Gateway HTTP API]
         |
         | Lambda Proxy Integration (Payload v2.0)
         v
[AWS Lambda: shade-scoring-service] (Node.js 22 LTS / ARM64)
    ├── Calculates Solar Diurnal Zenith & Canopy Intersection
    ├── Queries Open-Meteo & OSRM Walk Network
    └── Persists & Reads Community Shade Reports
         |
         | DynamoDB DocumentClient
         v
[Amazon DynamoDB: ShadeReports Table]
    └── PK: reportId (String)
    └── GSI: category-createdAt-index`}
            </div>
          </div>

          {/* AWS Endpoints Specification */}
          <div className="space-y-3">
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
              API Gateway Endpoints Specification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="font-mono font-bold text-emerald-800">GET /health</div>
                <div className="text-stone-600 text-[11px] mt-1">
                  Returns status 200 OK, runtime version, and database connectivity state.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="font-mono font-bold text-emerald-800">POST /api/routes/compare</div>
                <div className="text-stone-600 text-[11px] mt-1">
                  Accepts start, destination, ambient temperature, and hour. Returns scored route alternatives.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="font-mono font-bold text-emerald-800">GET /api/reports</div>
                <div className="text-stone-600 text-[11px] mt-1">
                  Returns verified and community-submitted shade points and water fountains.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="font-mono font-bold text-emerald-800">POST /api/reports</div>
                <div className="text-stone-600 text-[11px] mt-1">
                  Validates inputs and saves new community pedestrian cooling reports to DynamoDB.
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-Step SAM Deployment Guide */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-stone-700" />
                <span>AWS SAM Deployment Commands</span>
              </div>
              <button
                onClick={copyDeploymentSnippet}
                className="text-[11px] text-emerald-800 font-semibold hover:underline flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'Copied!' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="bg-stone-900 text-stone-200 p-3 rounded-lg overflow-x-auto text-[11px] font-mono">
{`# 1. Install AWS SAM CLI & Configure Credentials
aws configure

# 2. Build Serverless Artifacts
cd aws && sam build

# 3. Deploy to AWS Cloud (API Gateway + Lambda + DynamoDB)
sam deploy --guided --stack-name shaderoute-production`}
            </pre>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Complete CloudFormation template located at <code className="bg-stone-200 px-1 py-0.5 rounded font-mono">/aws/template.yaml</code> and handler code at <code className="bg-stone-200 px-1 py-0.5 rounded font-mono">/aws/lambda/index.ts</code>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
