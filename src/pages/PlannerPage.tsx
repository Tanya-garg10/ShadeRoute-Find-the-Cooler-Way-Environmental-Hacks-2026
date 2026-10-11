import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  ArrowUpDown,
  Navigation,
  RotateCcw,
  TreePine,
  Droplets,
  Sun,
  Clock,
  Layers,
  Info,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { LeafletMap } from '../components/Map/LeafletMap';
import { LatLng, RouteAlternative, WeatherData, LocationPreset, ComfortMode } from '../types';
import { LOCATION_PRESETS, INITIAL_COMMUNITY_REPORTS } from '../data/initialData';
import { fetchPedestrianRoutes, searchLocations, GeocodingResult, reverseGeocode } from '../services/routingService';
import { fetchLiveWeather } from '../services/weatherService';
import { LiveDecisionCard } from '../components/LiveDecisionCard';

export const PlannerPage: React.FC = () => {
  // Navigation input states
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [startPoint, setStartPoint] = useState<LatLng | null>(null);
  const [endPoint, setEndPoint] = useState<LatLng | null>(null);

  // Suggestions state
  const [startSuggestions, setStartSuggestions] = useState<GeocodingResult[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<GeocodingResult[]>([]);
  const [isSearchingStart, setIsSearchingStart] = useState(false);
  const [isSearchingEnd, setIsSearchingEnd] = useState(false);

  // Routing state
  const [routes, setRoutes] = useState<RouteAlternative[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('shade-optimized');
  const [comfortMode, setComfortMode] = useState<ComfortMode>('balanced');
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [routingError, setRoutingError] = useState<string | null>(null);

  // Environmental simulation controls
  const [simulatedTemp, setSimulatedTemp] = useState<number>(36);
  const [simulatedHour, setSimulatedHour] = useState<number>(13);
  const [liveWeather, setLiveWeather] = useState<WeatherData | null>(null);
  const [showSimControls, setShowSimControls] = useState(false);

  // Map layer controls
  const [showCanopyLayer, setShowCanopyLayer] = useState(true);
  const [showWaterLayer, setShowWaterLayer] = useState(true);
  const [showCommunityLayer, setShowCommunityLayer] = useState(true);

  // Load initial preset (Delhi Connaught Place to Janpath) by default so map is immediately loaded with working routes!
  useEffect(() => {
    const defaultPreset = LOCATION_PRESETS[0];
    setStartQuery(defaultPreset.start.name);
    setStartPoint({ lat: defaultPreset.start.lat, lng: defaultPreset.start.lng });
    setEndQuery(defaultPreset.end.name);
    setEndPoint({ lat: defaultPreset.end.lat, lng: defaultPreset.end.lng });

    // Fetch initial weather and routes
    fetchLiveWeather(defaultPreset.start.lat, defaultPreset.start.lng).then(w => {
      setLiveWeather(w);
      setSimulatedTemp(w.temperatureC);
    });

    calculateRoutesForPoints(
      { lat: defaultPreset.start.lat, lng: defaultPreset.start.lng },
      { lat: defaultPreset.end.lat, lng: defaultPreset.end.lng },
      36,
      13,
      'balanced'
    );
  }, []);

  const calculateRoutesForPoints = async (
    start: LatLng,
    end: LatLng,
    temp: number,
    hour: number,
    mode: ComfortMode = comfortMode
  ) => {
    setIsLoadingRoutes(true);
    setRoutingError(null);
    try {
      const results = await fetchPedestrianRoutes(start, end, temp, hour, mode);
      if (results.length === 0) {
        setRoutingError('Could not find pedestrian walking routes between these locations. Please check the pins.');
      } else {
        setRoutes(results);
        const recommended = results.find(r => r.isRecommended) || results[0];
        setSelectedRouteId(recommended.id);
      }
    } catch {
      setRoutingError('Pedestrian routing service encountered a network error. Please try again or choose a preset.');
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  // Debounced search for Start input
  useEffect(() => {
    if (!startQuery || startPoint) return;
    const timer = setTimeout(async () => {
      setIsSearchingStart(true);
      const results = await searchLocations(startQuery);
      setStartSuggestions(results);
      setIsSearchingStart(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [startQuery, startPoint]);

  // Debounced search for End input
  useEffect(() => {
    if (!endQuery || endPoint) return;
    const timer = setTimeout(async () => {
      setIsSearchingEnd(true);
      const results = await searchLocations(endQuery);
      setEndSuggestions(results);
      setIsSearchingEnd(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [endQuery, endPoint]);

  // Swap Start & Destination
  const handleSwap = () => {
    const tempQuery = startQuery;
    const tempPoint = startPoint;
    setStartQuery(endQuery);
    setStartPoint(endPoint);
    setEndQuery(tempQuery);
    setEndPoint(tempPoint);

    if (endPoint && startPoint) {
      calculateRoutesForPoints(endPoint, startPoint, simulatedTemp, simulatedHour);
    }
  };

  // Use Current Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setRoutingError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setStartPoint(coords);
        const name = await reverseGeocode(coords.lat, coords.lng);
        setStartQuery(name);
        if (endPoint) {
          calculateRoutesForPoints(coords, endPoint, simulatedTemp, simulatedHour);
        }
      },
      (err) => {
        setRoutingError(`GPS Permission notice: ${err.message}. You can manually pick a location or preset.`);
      },
      { timeout: 8000 }
    );
  };

  // Reset inputs
  const handleReset = () => {
    setStartQuery('');
    setStartPoint(null);
    setEndQuery('');
    setEndPoint(null);
    setRoutes([]);
    setRoutingError(null);
  };

  // Select a preset
  const handleSelectPreset = (preset: LocationPreset) => {
    setStartQuery(preset.start.name);
    setStartPoint({ lat: preset.start.lat, lng: preset.start.lng });
    setEndQuery(preset.end.name);
    setEndPoint({ lat: preset.end.lat, lng: preset.end.lng });
    calculateRoutesForPoints(
      { lat: preset.start.lat, lng: preset.start.lng },
      { lat: preset.end.lat, lng: preset.end.lng },
      simulatedTemp,
      simulatedHour
    );
  };

  // Recompute when simulation controls change
  const handleRecalculateSimulation = () => {
    if (startPoint && endPoint) {
      calculateRoutesForPoints(startPoint, endPoint, simulatedTemp, simulatedHour);
    }
  };

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  return (
    <div className="flex-1 flex flex-col bg-stone-100">
      {/* Top Context Subheader */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-stone-900">Pedestrian Navigation Engine</span>
            <span aria-hidden="true" className="text-stone-300">&middot;</span>
            <span className="text-stone-600">OpenStreetMap Walking Network</span>
            <span aria-hidden="true" className="text-stone-300">&middot;</span>
            <span className="text-stone-600 font-mono tabular-nums">
              Solar Model: {simulatedHour}:00 ({simulatedTemp}°C)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSimControls(!showSimControls)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-stone-600" />
              <span>Simulate Sun &amp; Heat ({simulatedHour}:00 / {simulatedTemp}°C)</span>
            </button>
          </div>
        </div>

        {/* Collapsible Simulation Drawer */}
        {showSimControls && (
          <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-stone-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
            <div>
              <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
                <span>Time of Day (Solar Elevation Angle)</span>
                <span className="font-mono tabular-nums font-bold text-emerald-800">{simulatedHour}:00</span>
              </div>
              <input
                type="range"
                min="7"
                max="19"
                value={simulatedHour}
                onChange={(e) => setSimulatedHour(parseInt(e.target.value))}
                className="w-full accent-emerald-800 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-0.5">
                <span>07:00 (Low Sun)</span>
                <span>13:00 (Peak Zenith)</span>
                <span>19:00 (Sunset)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
                <span>Ambient Air Temperature</span>
                <span className="font-mono tabular-nums font-bold text-amber-800">{simulatedTemp}°C</span>
              </div>
              <input
                type="range"
                min="22"
                max="46"
                value={simulatedTemp}
                onChange={(e) => setSimulatedTemp(parseInt(e.target.value))}
                className="w-full accent-amber-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-0.5">
                <span>22°C (Mild)</span>
                <span>35°C (Hot)</span>
                <span>46°C (Extreme Heatwave)</span>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleRecalculateSimulation}
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-sm"
              >
                Apply Solar Conditions &amp; Recalculate
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Sidebar Controls & Interactive Map */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Route Inputs & Comparison (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Location Input Card */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-stone-900 text-sm">Walking Route Planner</h2>
              <button
                onClick={handleReset}
                className="text-stone-500 hover:text-stone-800 text-xs flex items-center gap-1 font-medium"
                title="Reset points"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-3 relative">
              {/* Origin (A) */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    A
                  </div>
                  <input
                    type="text"
                    value={startQuery}
                    onChange={(e) => {
                      setStartQuery(e.target.value);
                      setStartPoint(null);
                    }}
                    placeholder="Enter starting location or landmark..."
                    className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50"
                  />
                  <button
                    onClick={handleUseCurrentLocation}
                    className="p-2 text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Use GPS current location"
                    aria-label="Use GPS current location"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                </div>

                {/* Suggestions Dropdown for Start */}
                {startSuggestions.length > 0 && !startPoint && (
                  <div className="absolute left-8 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto">
                    {startSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setStartQuery(item.displayName);
                          setStartPoint({ lat: item.lat, lng: item.lng });
                          setStartSuggestions([]);
                          if (endPoint) {
                            calculateRoutesForPoints({ lat: item.lat, lng: item.lng }, endPoint, simulatedTemp, simulatedHour);
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 text-stone-700 border-b border-stone-100 last:border-0 truncate block"
                      >
                        {item.displayName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Swap Button Divider */}
              <div className="flex items-center justify-center -my-1">
                <button
                  onClick={handleSwap}
                  className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-600 transition-colors shadow-2xs"
                  title="Swap start and destination"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Destination (B) */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    B
                  </div>
                  <input
                    type="text"
                    value={endQuery}
                    onChange={(e) => {
                      setEndQuery(e.target.value);
                      setEndPoint(null);
                    }}
                    placeholder="Enter destination location..."
                    className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50"
                  />
                </div>

                {/* Suggestions Dropdown for End */}
                {endSuggestions.length > 0 && !endPoint && (
                  <div className="absolute left-8 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto">
                    {endSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setEndQuery(item.displayName);
                          setEndPoint({ lat: item.lat, lng: item.lng });
                          setEndSuggestions([]);
                          if (startPoint) {
                            calculateRoutesForPoints(startPoint, { lat: item.lat, lng: item.lng }, simulatedTemp, simulatedHour);
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 text-stone-700 border-b border-stone-100 last:border-0 truncate block"
                      >
                        {item.displayName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {routingError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>{routingError}</div>
              </div>
            )}

            {/* Quick Presets */}
            <div className="pt-2 border-t border-stone-100">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                Featured Urban Corridors
              </span>
              <div className="flex flex-wrap gap-1.5">
                {LOCATION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className="px-2.5 py-1 text-[11px] font-medium bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 rounded-lg text-stone-700 border border-stone-200 transition-colors"
                  >
                    {preset.city}: {preset.name.split(' to ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comfort Mode Segmented Selector */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Comfort Mode Preferences
              </span>
              <span className="text-[11px] text-stone-500 font-mono">Personalized Weights</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-stone-100 rounded-xl text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setComfortMode('balanced');
                  if (startPoint && endPoint) {
                    calculateRoutesForPoints(startPoint, endPoint, simulatedTemp, simulatedHour, 'balanced');
                  }
                }}
                className={`py-1.5 px-2 font-medium rounded-lg transition-colors truncate ${
                  comfortMode === 'balanced'
                    ? 'bg-white text-emerald-900 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                🌿 Balanced
              </button>
              <button
                type="button"
                onClick={() => {
                  setComfortMode('max-shade');
                  if (startPoint && endPoint) {
                    calculateRoutesForPoints(startPoint, endPoint, simulatedTemp, simulatedHour, 'max-shade');
                  }
                }}
                className={`py-1.5 px-2 font-medium rounded-lg transition-colors truncate ${
                  comfortMode === 'max-shade'
                    ? 'bg-white text-emerald-900 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                🌳 Max Shade
              </button>
              <button
                type="button"
                onClick={() => {
                  setComfortMode('fastest');
                  if (startPoint && endPoint) {
                    calculateRoutesForPoints(startPoint, endPoint, simulatedTemp, simulatedHour, 'fastest');
                  }
                }}
                className={`py-1.5 px-2 font-medium rounded-lg transition-colors truncate ${
                  comfortMode === 'fastest'
                    ? 'bg-white text-amber-900 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                ⚡ Fastest
              </button>
              <button
                type="button"
                onClick={() => {
                  setComfortMode('accessible-rest');
                  if (startPoint && endPoint) {
                    calculateRoutesForPoints(startPoint, endPoint, simulatedTemp, simulatedHour, 'accessible-rest');
                  }
                }}
                className={`py-1.5 px-2 font-medium rounded-lg transition-colors truncate ${
                  comfortMode === 'accessible-rest'
                    ? 'bg-white text-emerald-900 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                🪑 Rest &amp; Water
              </button>
            </div>
          </div>

          {/* Signature Feature: ShadeRoute Live Decision Card */}
          {routes.length >= 2 && (
            <LiveDecisionCard
              directRoute={routes.find(r => r.id === 'direct')}
              shadeRoute={routes.find(r => r.id === 'shade-optimized') || routes[0]}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
            />
          )}

          {/* Route Alternatives Comparison Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Route Comparison ({routes.length} options)
              </span>
              {isLoadingRoutes && (
                <span className="text-xs text-stone-500 animate-pulse font-medium">Calculating shade paths...</span>
              )}
            </div>

            {routes.map((route) => {
              const isSelected = route.id === selectedRouteId;
              const isShade = route.id === 'shade-optimized' || route.id === 'canopy-max';

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? isShade
                        ? 'bg-emerald-50/70 border-emerald-700 ring-2 ring-emerald-700/20 shadow-md'
                        : 'bg-amber-50/70 border-amber-600 ring-2 ring-amber-600/20 shadow-md'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">{route.name}</span>
                        {route.isRecommended && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-800 text-white px-2 py-0.5 rounded-md">
                            Best Shade
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5 font-mono tabular-nums">
                        {(route.distanceMeters / 1000).toFixed(2)} km &middot; {route.durationMinutes} min walk
                      </div>
                    </div>

                    {/* Heat Exposure Score Box */}
                    <div className="text-right">
                      <div
                        className={`text-base font-extrabold font-mono tabular-nums ${
                          route.exposureScore < 45
                            ? 'text-emerald-800'
                            : route.exposureScore < 70
                            ? 'text-amber-700'
                            : 'text-red-700'
                        }`}
                      >
                        {route.exposureScore} <span className="text-xs font-normal text-stone-500">/ 100</span>
                      </div>
                      <div className="text-[10px] font-semibold text-stone-600">
                        {route.exposureTier}
                      </div>
                    </div>
                  </div>

                  {/* Shade Progress Gauge */}
                  <div className="space-y-1 mb-2.5">
                    <div className="flex justify-between text-[11px] text-stone-600">
                      <span>Tree Canopy &amp; Shade Coverage</span>
                      <span className="font-mono font-bold">{route.shadeCoveragePercent}%</span>
                    </div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isShade ? 'bg-emerald-700' : 'bg-amber-600'
                        }`}
                        style={{ width: `${route.shadeCoveragePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Amenities on Route */}
                  <div className="flex items-center gap-4 text-[11px] text-stone-600 pt-1 border-t border-stone-200/60">
                    <span className="flex items-center gap-1">
                      <TreePine className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{route.treeCanopyPercent}% Canopy</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-600" />
                      <span>{route.waterPointsEnRoute} Water Kiosks</span>
                    </span>
                    <span className="text-stone-400 font-mono ml-auto">
                      Confidence: {route.confidenceScore}%
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 mt-2 leading-relaxed italic">
                    {route.tradeoffSummary}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Selected Route Detailed Inspection Drawer */}
          {selectedRoute && (
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Route Breakdown: {selectedRoute.name}</span>
                </h3>
                <span className="text-xs font-mono text-stone-500">
                  {selectedRoute.segments.length} Segments
                </span>
              </div>

              {/* Score Factor Breakdown */}
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-stone-700 block">Exposure Factor Weights:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-100">
                    <div className="text-stone-500">Base Temp Stress</div>
                    <div className="font-bold text-stone-800">+{selectedRoute.scoreBreakdown.baseTemperaturePenalty} pts</div>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-100">
                    <div className="text-stone-500">Unshaded Direct Sun</div>
                    <div className="font-bold text-stone-800">+{selectedRoute.scoreBreakdown.solarRadiationPenalty} pts</div>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-100">
                    <div className="text-stone-500">Duration Penalty</div>
                    <div className="font-bold text-stone-800">+{selectedRoute.scoreBreakdown.unshadedDurationPenalty} pts</div>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                    <div className="text-emerald-700">Shade Mitigation</div>
                    <div className="font-bold text-emerald-800">-{selectedRoute.scoreBreakdown.shadeMitigationCredit} pts</div>
                  </div>
                </div>
              </div>

              {/* Turn-by-Turn Waypoints with Shade Levels */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <span className="font-semibold text-stone-700 text-xs block">Walking Turn-by-Turn Guidance:</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedRoute.segments.map((seg, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-stone-800">{idx + 1}. {seg.instruction}</span>
                        <span className="font-mono text-stone-500 shrink-0 text-[11px]">{seg.distanceMeters}m</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-stone-500 pt-0.5">
                        <span className={seg.shadeLevel === 'dense_canopy' ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
                          {seg.shadePercent}% Shade ({seg.shadeLevel.replace('_', ' ')})
                        </span>
                        <span>&middot;</span>
                        <span className="capitalize">{seg.surfaceType?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Honest Disclaimer */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 space-y-1">
                <div className="flex items-center gap-1 font-semibold text-stone-800">
                  <ShieldAlert className="w-3.5 h-3.5 text-stone-600" />
                  <span>Uncertainty Notice</span>
                </div>
                <div>
                  Values are relative estimates computed from tree canopy surveys and solar geometry models. Microclimates may vary with building reflections and localized wind.
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Full-Height Interactive Map (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col space-y-3 h-[680px]">
          {/* Map Layer Controls Bar */}
          <div className="bg-white rounded-xl p-3 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-stone-900">
              <Layers className="w-4 h-4 text-emerald-800" />
              <span>Map Overlays</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-900">
                <input
                  type="checkbox"
                  checked={showCanopyLayer}
                  onChange={(e) => setShowCanopyLayer(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span>Tree Canopy</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-900">
                <input
                  type="checkbox"
                  checked={showWaterLayer}
                  onChange={(e) => setShowWaterLayer(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Water Kiosks</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-900">
                <input
                  type="checkbox"
                  checked={showCommunityLayer}
                  onChange={(e) => setShowCommunityLayer(e.target.checked)}
                  className="rounded text-lime-600 focus:ring-lime-500"
                />
                <span>Community Pins</span>
              </label>
            </div>
          </div>

          {/* Leaflet Map Box */}
          <div className="flex-1 w-full relative">
            <LeafletMap
              start={startPoint}
              end={endPoint}
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              communityReports={INITIAL_COMMUNITY_REPORTS}
              showShadePolygons={showCanopyLayer}
              showWaterPoints={showWaterLayer}
              showCommunityPins={showCommunityLayer}
              center={startPoint ? [startPoint.lat, startPoint.lng] : [28.6289, 77.2195]}
              zoom={15}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
