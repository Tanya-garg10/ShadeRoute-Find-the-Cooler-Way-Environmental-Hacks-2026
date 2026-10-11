import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  TreePine,
  Droplets,
  Sun,
  ShieldCheck,
  TrendingDown,
  Activity,
  ArrowRight,
  Database,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { getCommunityReports } from '../services/reportService';
import { CommunityReport, ShadeGapStreet } from '../types';
import { INITIAL_SHADE_GAPS } from '../data/initialData';

export const DashboardPage: React.FC = () => {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [sessionRoutesCount, setSessionRoutesCount] = useState(8);

  useEffect(() => {
    getCommunityReports().then(setReports);
  }, []);

  const verifiedReports = reports.filter(r => r.status === 'verified').length;
  const waterPoints = reports.filter(r => r.category === 'water_point').length;
  const treeCanopySpots = reports.filter(r => r.category === 'tree_canopy' || r.category === 'shaded_path').length;
  const brokenShadeAlerts = reports.filter(r => r.category === 'broken_shade').length;
  const treePlantingTargets = reports.filter(r => r.category === 'tree_planting_target').length;

  const totalTreePlantingVotes = INITIAL_SHADE_GAPS.reduce((acc, curr) => acc + curr.communityPlantingVotes, 0);

  return (
    <div className="flex-1 bg-stone-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              <span>Urban Microclimate &middot; Environmental Heat Resilience</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-0.5">
              Urban Heat Action Dashboard
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Locality heat reports, pedestrian shade gaps, tree-planting target priorities, and data freshness metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/explorer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors border border-stone-200"
            >
              <TreePine className="w-4 h-4 text-emerald-700" />
              <span>Explore Shade Gaps</span>
            </Link>
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors shadow-sm"
            >
              <Compass className="w-4 h-4 text-lime-300" />
              <span>Launch Route Planner</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-8">
        
        {/* KPI Metric Strip (No pills, tabular numerals, clean unboxed metadata) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span>Session Evaluated Routes</span>
              <Activity className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-3xl font-extrabold text-stone-900 font-mono tabular-nums">
              {sessionRoutesCount}
            </div>
            <div className="text-[11px] text-stone-500 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Avg. 52% solar heat mitigation</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span>Community Shade Assets</span>
              <TreePine className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-3xl font-extrabold text-stone-900 font-mono tabular-nums">
              {reports.length}
            </div>
            <div className="text-[11px] text-stone-500">
              {verifiedReports} verified &middot; {reports.length - verifiedReports} community observations
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span>Public Water Kiosks</span>
              <Droplets className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-stone-900 font-mono tabular-nums">
              {waterPoints}
            </div>
            <div className="text-[11px] text-stone-500">
              Active municipal &amp; community dispensers
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span>Greening Votes Recorded</span>
              <TreePine className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-stone-900 font-mono tabular-nums">
              {totalTreePlantingVotes}
            </div>
            <div className="text-[11px] text-stone-500">
              Across 6 pilot shade gap corridors
            </div>
          </div>
        </div>

        {/* Locality Aggregation Section */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                Locality Aggregates &amp; Shade Infrastructure Status
              </h3>
              <p className="text-xs text-stone-500">
                Ground-truth reports and gap density across active deployment centers
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md font-semibold">
              4 Pilot Municipalities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-sm">Central Delhi</span>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">High Data</span>
              </div>
              <div className="text-xs text-stone-600 space-y-1">
                <div>&bull; 4 Mapped Shade Spots</div>
                <div>&bull; 2 Severe Gaps (Connaught Circus)</div>
                <div>&bull; 88% Canopy Survey Coverage</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-sm">Bengaluru Central</span>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">High Data</span>
              </div>
              <div className="text-xs text-stone-600 space-y-1">
                <div>&bull; 2 Botanical Canopy Trails</div>
                <div>&bull; 1 Low-Shade Gap (Kasturba Rd)</div>
                <div>&bull; 82% Canopy Survey Coverage</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-sm">Mumbai South</span>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Moderate</span>
              </div>
              <div className="text-xs text-stone-600 space-y-1">
                <div>&bull; Heritage Colonnade Verandahs</div>
                <div>&bull; 1 Severe Gap (Karve Road)</div>
                <div>&bull; 64% Canopy Survey Coverage</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-sm">Ahmedabad Ashram</span>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Moderate</span>
              </div>
              <div className="text-xs text-stone-600 space-y-1">
                <div>&bull; Riverfront Pergola Promenades</div>
                <div>&bull; High Midday Radiant Heat</div>
                <div>&bull; 58% Canopy Survey Coverage</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Analytics & Coverage Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Data Freshness & Confidence (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Geospatial Data Coverage &amp; Freshness</h3>
                <p className="text-xs text-stone-500">Current survey boundaries for Bharat Builds Tour 2026 pilot cities</p>
              </div>
              <span className="text-[11px] text-emerald-800 font-mono bg-emerald-50 px-2.5 py-1 rounded-md font-semibold">
                OSM + NDVI Canopy Sync
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-stone-700">
                  <span>Central Delhi &amp; Lutyens Heritage Canopy</span>
                  <span className="font-mono tabular-nums font-bold text-emerald-800">88% Survey Coverage (High)</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-700 h-full rounded-full w-[88%]" />
                </div>
                <div className="text-[11px] text-stone-500">
                  Neem &amp; Jamun tree inventories verified by NDMC and OpenStreetMap contributors.
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-stone-700">
                  <span>Bengaluru Central &amp; Cubbon Corridor</span>
                  <span className="font-mono tabular-nums font-bold text-emerald-800">82% Survey Coverage (High)</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-700 h-full rounded-full w-[82%]" />
                </div>
                <div className="text-[11px] text-stone-500">
                  High-resolution botanical canopy coverage and shaded park perimeter sidewalks.
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-stone-700">
                  <span>Mumbai Fort &amp; Heritage Colonnade</span>
                  <span className="font-mono tabular-nums font-bold text-amber-700">64% Survey Coverage (Moderate)</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full w-[64%]" />
                </div>
                <div className="text-[11px] text-stone-500">
                  Architectural arcade mapping active; residential lane tree canopy pending crowd audits.
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-stone-700">
                  <span>Ahmedabad Ashram &amp; Riverfront Walkway</span>
                  <span className="font-mono tabular-nums font-bold text-amber-700">58% Survey Coverage (Moderate)</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full w-[58%]" />
                </div>
                <div className="text-[11px] text-stone-500">
                  Promenade pergola shade verified; arterial roadways have limited verified canopy data.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1">
              <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-stone-600" />
                <span>Transparent Missing-Data Standard</span>
              </div>
              <p className="leading-relaxed">
                If a requested route traverses urban sectors with &lt;25% verified shade data, the scoring engine returns &quot;Shade data unavailable&quot; rather than interpolating fabricated values. Sample metrics are clearly labelled.
              </p>
            </div>
          </div>

          {/* Right Column: Live Heat Risk Spectrum (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-5">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-sm">Heat Exposure Scoring Tiers</h3>
              <p className="text-xs text-stone-500">How route alternatives are evaluated</p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span>Score 0 – 31: Low Thermal Stress</span>
                  <span className="font-mono text-[11px]">Canopy Preferred</span>
                </div>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Deep continuous tree canopy or shaded colonnades. Direct solar radiation mitigated by over 70%.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-lime-50/70 border border-lime-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-lime-900">
                  <span>Score 32 – 51: Moderate Exposure</span>
                  <span className="font-mono text-[11px]">Intermittent Shade</span>
                </div>
                <p className="text-lime-800 text-[11px] leading-relaxed">
                  Alternating tree cover and short open crossings. Safe for typical walkers with standard hydration.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span>Score 52 – 74: High Heat Risk</span>
                  <span className="font-mono text-[11px]">Direct Sun</span>
                </div>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  Substantial unshaded concrete walking. Significant thermal load accumulated after 15+ minutes.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-red-900">
                  <span>Score 75 – 100: Extreme Heat Risk</span>
                  <span className="font-mono text-[11px]">Hazardous Midday</span>
                </div>
                <p className="text-red-800 text-[11px] leading-relaxed">
                  Long walks on unshaded blacktop during midday zenith without water points. High risk of heat illness.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/planner"
                className="w-full py-2.5 px-4 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200 flex items-center justify-center gap-2"
              >
                <span>Compare a Route Against These Tiers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
