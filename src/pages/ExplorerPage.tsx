import React, { useState } from 'react';
import {
  TreePine,
  AlertTriangle,
  HelpCircle,
  CheckCircle,
  ThumbsUp,
  MapPin,
  TrendingUp,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { LeafletMap } from '../components/Map/LeafletMap';
import { ShadeGapStreet } from '../types';
import { INITIAL_SHADE_GAPS, INITIAL_COMMUNITY_REPORTS } from '../data/initialData';

export const ExplorerPage: React.FC = () => {
  const [shadeGaps, setShadeGaps] = useState<ShadeGapStreet[]>(INITIAL_SHADE_GAPS);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGap, setSelectedGap] = useState<ShadeGapStreet | null>(INITIAL_SHADE_GAPS[0]);
  const [votedGaps, setVotedGaps] = useState<Record<string, boolean>>({});

  const handleVoteTreePlanting = (id: string) => {
    if (votedGaps[id]) return;

    setShadeGaps(prev =>
      prev.map(g => {
        if (g.id === id) {
          return { ...g, communityPlantingVotes: g.communityPlantingVotes + 1 };
        }
        return g;
      })
    );

    if (selectedGap && selectedGap.id === id) {
      setSelectedGap(prev =>
        prev ? { ...prev, communityPlantingVotes: prev.communityPlantingVotes + 1 } : null
      );
    }

    setVotedGaps(prev => ({ ...prev, [id]: true }));
  };

  const filteredGaps = shadeGaps.filter(g => {
    if (selectedStatus === 'all') return true;
    return g.status === selectedStatus;
  });

  const severeCount = shadeGaps.filter(g => g.status === 'severe_gap').length;
  const lowCount = shadeGaps.filter(g => g.status === 'low_shade').length;
  const unknownCount = shadeGaps.filter(g => g.status === 'unknown_data').length;
  const wellShadedCount = shadeGaps.filter(g => g.status === 'well_shaded').length;

  return (
    <div className="flex-1 bg-stone-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              <span>Urban Planning &amp; Pedestrian Heat Resilience</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-0.5">
              Shade Gap Detector
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Identify pedestrian corridors with missing shade coverage, data voids, and community tree-planting nominations.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="bg-red-50 text-red-800 px-3 py-1.5 rounded-lg border border-red-200 font-semibold">
              {severeCount} Severe Gaps
            </span>
            <span className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 font-semibold">
              {lowCount} Low Shade
            </span>
            <span className="bg-stone-100 text-stone-700 px-3 py-1.5 rounded-lg border border-stone-200">
              {unknownCount} Unknown
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Corridor List & Inspection (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Status Filter Tabs */}
          <div className="bg-white p-1.5 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-1 overflow-x-auto text-xs">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-emerald-800 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              All Streets ({shadeGaps.length})
            </button>
            <button
              onClick={() => setSelectedStatus('severe_gap')}
              className={`px-3 py-1.5 font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedStatus === 'severe_gap'
                  ? 'bg-red-700 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Severe Gaps ({severeCount})
            </button>
            <button
              onClick={() => setSelectedStatus('low_shade')}
              className={`px-3 py-1.5 font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedStatus === 'low_shade'
                  ? 'bg-amber-700 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Low Shade ({lowCount})
            </button>
            <button
              onClick={() => setSelectedStatus('unknown_data')}
              className={`px-3 py-1.5 font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedStatus === 'unknown_data'
                  ? 'bg-stone-700 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Unknown ({unknownCount})
            </button>
          </div>

          {/* List of Street Corridors */}
          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredGaps.map(gap => {
              const isSelected = selectedGap?.id === gap.id;
              const isSevere = gap.status === 'severe_gap';
              const isLow = gap.status === 'low_shade';
              const isUnknown = gap.status === 'unknown_data';
              const isWell = gap.status === 'well_shaded';

              return (
                <div
                  key={gap.id}
                  onClick={() => setSelectedGap(gap)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-emerald-700 ring-2 ring-emerald-700/20 shadow-md'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">{gap.streetName}</h3>
                      <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                        {gap.locality} &middot; {gap.lengthMeters}m corridor
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isSevere
                            ? 'bg-red-100 text-red-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : isUnknown
                            ? 'bg-stone-100 text-stone-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {gap.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed mb-3">
                    {gap.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-stone-100">
                    <span className="text-stone-500 font-mono">
                      Shade Cover: <strong>{gap.shadePercent}%</strong> &middot; Pedestrians: {gap.pedestrianVolume}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVoteTreePlanting(gap.id);
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors border ${
                        votedGaps[gap.id]
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-stone-100 text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 border-stone-200'
                      }`}
                      title="Nominate street corridor for community tree planting"
                    >
                      <ThumbsUp className="w-3 h-3 text-emerald-700" />
                      <span>Plant Trees ({gap.communityPlantingVotes})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Urban Greening Action Callout */}
          {selectedGap && (
            <div className="bg-emerald-900 text-white rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center gap-2">
                <TreePine className="w-5 h-5 text-lime-400" />
                <h3 className="font-bold text-sm">Community Tree-Planting Target</h3>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Corridor <strong className="text-white">{selectedGap.streetName}</strong> has been nominated by{' '}
                <strong className="text-lime-300 font-mono">{selectedGap.communityPlantingVotes} local pedestrians</strong>{' '}
                for native Neem/Peepal sapling plantations to eliminate dangerous midday heat exposure.
              </p>
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-emerald-200 font-mono">
                  Priority: {selectedGap.priorityForGreening}
                </span>
                <button
                  onClick={() => handleVoteTreePlanting(selectedGap.id)}
                  disabled={votedGaps[selectedGap.id]}
                  className="px-3 py-1.5 text-xs font-bold text-emerald-950 bg-lime-400 hover:bg-lime-300 rounded-lg transition-colors disabled:opacity-60"
                >
                  {votedGaps[selectedGap.id] ? 'Vote Recorded ✓' : '+ Vote for This Corridor'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Map with Shade Gaps (lg:col-span-7) */}
        <div className="lg:col-span-7 h-[680px] flex flex-col space-y-3">
          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between text-xs">
            <span className="font-bold text-stone-900">
              Corridor Shade Spectrum: Red (Severe Gap) &bull; Orange (Low) &bull; Green (Canopy) &bull; Gray (Unknown)
            </span>
            <span className="text-stone-500 font-mono">
              {filteredGaps.length} Visualized Street Segments
            </span>
          </div>

          <div className="flex-1 w-full relative">
            <LeafletMap
              shadeGaps={filteredGaps}
              onSelectShadeGap={(gap) => setSelectedGap(gap)}
              communityReports={INITIAL_COMMUNITY_REPORTS}
              showShadeGaps={true}
              showCommunityPins={true}
              showWaterPoints={true}
              center={selectedGap ? selectedGap.coordinates[0] : [28.6289, 77.2195]}
              zoom={14}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
