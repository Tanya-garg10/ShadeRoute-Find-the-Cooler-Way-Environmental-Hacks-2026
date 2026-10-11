import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Sun,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Compass,
  AlertCircle,
  Thermometer,
  CloudSun,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { fetchHourlyForecast } from '../services/weatherService';
import { TimeShiftSlot, LocationPreset } from '../types';
import { LOCATION_PRESETS } from '../data/initialData';
import { getAIAdvice } from '../services/aiService';

export const TimeShiftPage: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<LocationPreset>(LOCATION_PRESETS[0]);
  const [hourlySlots, setHourlySlots] = useState<TimeShiftSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TimeShiftSlot | null>(null);
  const [aiTip, setAiTip] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    loadForecast(selectedPreset.start.lat, selectedPreset.start.lng);
  }, [selectedPreset]);

  const loadForecast = async (lat: number, lng: number) => {
    setIsLoading(true);
    setAiTip('');
    const slots = await fetchHourlyForecast(lat, lng);
    setHourlySlots(slots);
    if (slots.length > 0) {
      // Default to current hour or peak hour slot
      const current = slots.find(s => s.isCurrentHour) || slots[Math.floor(slots.length / 2)];
      setSelectedSlot(current);
      fetchTimeshiftAI(slots);
    }
    setIsLoading(false);
  };

  const fetchTimeshiftAI = async (slots: TimeShiftSlot[]) => {
    setIsLoadingAI(true);
    const context = slots.map(s => ({
      hour: s.displayTime,
      score: s.estimatedExposureScore,
      tempC: s.tempC,
      uvIndex: s.uvIndex,
      tier: s.exposureTier,
    }));
    const result = await getAIAdvice({ type: 'timeshift', context: { hourlySlots: context, city: selectedPreset.city } });
    setAiTip(result.advice || result.error || '');
    setIsLoadingAI(false);
  };

  // Find lowest exposure slot in afternoon/evening
  const bestSlot = hourlySlots.reduce((prev, curr) => {
    if (!prev) return curr;
    return curr.estimatedExposureScore < prev.estimatedExposureScore ? curr : prev;
  }, hourlySlots[0]);

  return (
    <div className="flex-1 bg-stone-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              <span>Predictive Departure Window Optimizer</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-0.5">
              TimeShift — Best Time to Walk
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Compare walking heat exposure across departure hours using diurnal solar irradiance and hourly weather forecasts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors shadow-sm"
            >
              <Compass className="w-4 h-4 text-lime-300" />
              <span>Route Planner</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-8">
        
        {/* Preset Selector Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-stone-900">
            <Clock className="w-4 h-4 text-emerald-800" />
            <span>Select Walking Corridor:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {LOCATION_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPreset(p)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors border ${
                  selectedPreset.id === p.id
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200'
                }`}
              >
                {p.city}: {p.name.split(' to ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Departure Window Recommendation Banner */}
        {bestSlot && (
          <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-2">
              <div className="flex items-center gap-2 text-lime-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Smart Departure Recommendation</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Walking at {bestSlot.displayTime} cuts estimated heat exposure by{' '}
                <span className="text-lime-300 font-mono">
                  {Math.abs(bestSlot.exposureDiffPercent)}%
                </span>
              </h2>
              <p className="text-emerald-100 text-xs leading-relaxed max-w-2xl">
                Midday zenith sun angles generate peak pavement reradiation between 12:00 and 15:00. Departing during the{' '}
                <strong className="text-white font-mono">{bestSlot.displayTime}</strong> window drops the estimated exposure score to{' '}
                <strong className="text-lime-300 font-mono">{bestSlot.estimatedExposureScore} / 100</strong> ({bestSlot.tempC}°C ambient, UV Index {bestSlot.uvIndex}).
              </p>
            </div>

            <div className="md:col-span-4 bg-emerald-950/60 p-4 rounded-xl border border-emerald-800/80 text-center space-y-1">
              <span className="text-[11px] text-emerald-300 uppercase tracking-wider block font-semibold">
                Optimal Window Score
              </span>
              <div className="text-3xl font-extrabold text-lime-300 font-mono tabular-nums">
                {bestSlot.estimatedExposureScore} <span className="text-xs font-normal text-emerald-200">/ 100</span>
              </div>
              <span className="text-xs text-emerald-200 block">
                {bestSlot.exposureTier} &middot; {bestSlot.tempC}°C
              </span>
            </div>
          </div>
        )}

        {/* AI Departure Tip */}
        {(aiTip || isLoadingAI) && (
          <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Departure Advisor</span>
              <span className="ml-auto text-[10px] font-normal text-stone-400 font-mono">Featherless AI · Llama 3.3 70B</span>
            </div>
            {isLoadingAI ? (
              <div className="text-xs text-stone-400 animate-pulse">Analysing hourly heat data...</div>
            ) : (
              <p className="text-xs text-stone-700 leading-relaxed">{aiTip}</p>
            )}
          </div>
        )}

        {/* Hourly Timeline Cards Grid */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                Hourly Heat Exposure Trajectory (07:00 – 19:00)
              </h3>
              <p className="text-xs text-stone-500">
                Click any departure hour to inspect solar irradiance, UV index, and temperature factors
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md font-semibold">
              Open-Meteo Hourly API Sync
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-stone-500 animate-pulse">
              Computing diurnal solar zenith models...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {hourlySlots.map(slot => {
                const isSelected = selectedSlot?.hour === slot.hour;
                const isPeak = slot.estimatedExposureScore >= 65;
                const isCool = slot.estimatedExposureScore <= 38;

                return (
                  <button
                    key={slot.hour}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-700 ring-2 ring-emerald-700/20 shadow-sm'
                        : isPeak
                        ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                        : isCool
                        ? 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-200'
                        : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-1">
                      <span>{slot.displayTime}</span>
                      {slot.isCurrentHour && (
                        <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-mono">
                          NOW
                        </span>
                      )}
                    </div>

                    <div
                      className={`text-xl font-extrabold font-mono tabular-nums mb-1 ${
                        isCool ? 'text-emerald-800' : isPeak ? 'text-red-700' : 'text-stone-800'
                      }`}
                    >
                      {slot.estimatedExposureScore}
                    </div>

                    <div className="text-[11px] text-stone-500 font-mono space-y-0.5">
                      <div>{slot.tempC}°C</div>
                      <div>UV {slot.uvIndex}</div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-stone-200/60 text-[10px] font-semibold">
                      <span
                        className={
                          isCool
                            ? 'text-emerald-700'
                            : isPeak
                            ? 'text-amber-800'
                            : 'text-stone-600'
                        }
                      >
                        {slot.recommendation}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected Slot Factor Inspection */}
          {selectedSlot && (
            <div className="bg-stone-50 rounded-xl p-5 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="font-bold text-stone-900 text-xs">
                  Detailed Physics Breakdown for Departure at {selectedSlot.displayTime}
                </span>
                <span className="text-xs font-mono text-stone-600">
                  {selectedSlot.exposureTier}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                  <div className="text-stone-500 text-[11px]">Ambient Air</div>
                  <div className="font-bold text-stone-900 text-sm">{selectedSlot.tempC}°C</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                  <div className="text-stone-500 text-[11px]">Solar Radiation</div>
                  <div className="font-bold text-stone-900 text-sm">{selectedSlot.solarIrradianceWpm2} W/m²</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                  <div className="text-stone-500 text-[11px]">UV Index</div>
                  <div className="font-bold text-stone-900 text-sm">{selectedSlot.uvIndex} of 12</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                  <div className="text-stone-500 text-[11px]">Exposure Score</div>
                  <div className="font-bold text-emerald-800 text-sm">{selectedSlot.estimatedExposureScore} / 100</div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-stone-200 text-xs text-stone-600 leading-relaxed flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Scientific Uncertainty Notice:</strong> Future estimates rely on meteorological numerical weather predictions and clear-sky solar irradiance geometry. Sudden localized cloud cover or urban wind tunnels will modulate actual pedestrian thermal sensations.
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
