import React from 'react';
import { RouteAlternative } from '../types';
import { ArrowRight, CheckCircle2, ShieldCheck, Clock, TreePine, Sun } from 'lucide-react';

interface LiveDecisionCardProps {
  directRoute?: RouteAlternative;
  shadeRoute?: RouteAlternative;
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
  className?: string;
}

export const LiveDecisionCard: React.FC<LiveDecisionCardProps> = ({
  directRoute,
  shadeRoute,
  selectedRouteId,
  onSelectRoute,
  className = '',
}) => {
  if (!directRoute || !shadeRoute) return null;

  const isShadeSelected = selectedRouteId === shadeRoute.id;
  const isDirectSelected = selectedRouteId === directRoute.id;

  const extraMinutes = Math.max(0, shadeRoute.durationMinutes - directRoute.durationMinutes);
  const heatReductionPercent = Math.max(
    0,
    Math.round(((directRoute.exposureScore - shadeRoute.exposureScore) / directRoute.exposureScore) * 100)
  );

  return (
    <div className={`bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
            Decision Intelligence
          </span>
          <h3 className="text-base font-bold text-stone-900 tracking-tight">Your walk, your choice</h3>
        </div>
        <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md">
          {shadeRoute.confidence}
        </span>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Option 1: Fastest / Direct */}
        <button
          type="button"
          onClick={() => onSelectRoute(directRoute.id)}
          className={`p-4 rounded-xl border text-left transition-all relative ${
            isDirectSelected
              ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-stone-50/70 border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-stone-600">Fastest Route</span>
            {isDirectSelected && (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-mono tabular-nums mb-1">
            {directRoute.durationMinutes} <span className="text-xs font-medium text-stone-500">min</span>
          </div>
          <div className="text-xs text-stone-600 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-500">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>Less walking time</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700 font-medium">
              <Sun className="w-3.5 h-3.5" />
              <span>{directRoute.shadeCoveragePercent}% Mapped Shade ({directRoute.exposureScore}/100 Exposure)</span>
            </div>
          </div>
        </button>

        {/* Option 2: Shade-Preferred */}
        <button
          type="button"
          onClick={() => onSelectRoute(shadeRoute.id)}
          className={`p-4 rounded-xl border text-left transition-all relative ${
            isShadeSelected
              ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
              : 'bg-stone-50/70 border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-900">Shade-Preferred</span>
            {isShadeSelected && (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>
          <div className="text-2xl font-extrabold text-emerald-950 font-mono tabular-nums mb-1">
            {shadeRoute.durationMinutes} <span className="text-xs font-medium text-stone-500">min</span>
          </div>
          <div className="text-xs text-stone-600 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <TreePine className="w-3.5 h-3.5 text-emerald-700" />
              <span>{shadeRoute.shadeCoveragePercent}% Mapped Shade ({shadeRoute.exposureScore}/100 Exposure)</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-500">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>+{extraMinutes} min detour for ~{heatReductionPercent}% less sun</span>
            </div>
          </div>
        </button>
      </div>

      {/* Algorithmic Recommendation Callout */}
      <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-stone-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Recommendation:</span>
        </div>
        <p className="leading-relaxed">
          Choose the shade-preferred route if you are comfortable with{' '}
          <strong className="text-stone-900 font-mono">+{extraMinutes} minutes</strong> of walking and the verified tree canopy supports it. It cuts direct solar radiation by an estimated{' '}
          <strong className="text-emerald-800 font-mono">{heatReductionPercent}%</strong>.
        </p>
      </div>
    </div>
  );
};
