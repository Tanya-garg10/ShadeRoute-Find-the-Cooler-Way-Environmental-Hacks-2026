import React, { useState, useEffect } from 'react';
import {
  MapPin,
  TreePine,
  Droplets,
  AlertTriangle,
  Plus,
  ThumbsUp,
  CheckCircle,
  Filter,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import { LeafletMap } from '../components/Map/LeafletMap';
import { CommunityReport, CommunityCategory, LatLng } from '../types';
import { getCommunityReports, submitCommunityReport, upvoteReport } from '../services/reportService';
import { reverseGeocode } from '../services/routingService';
import { getAIAdvice } from '../services/aiService';

export const CommunityPage: React.FC = () => {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [pinDropMode, setPinDropMode] = useState(false);
  const [droppedPin, setDroppedPin] = useState<LatLng | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Form fields
  const [formCategory, setFormCategory] = useState<CommunityCategory>('tree_canopy');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLocationName, setFormLocationName] = useState('');
  const [formReporter, setFormReporter] = useState('');
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const list = await getCommunityReports();
    setReports(list);
    fetchCommunityAI(list);
  };

  const fetchCommunityAI = async (list: CommunityReport[]) => {
    if (list.length === 0) return;
    setIsLoadingAI(true);
    setAiSummary('');
    const context = list.slice(0, 10).map(r => ({
      category: r.category,
      title: r.title,
      locationName: r.locationName,
      verificationCount: r.verificationCount,
      status: r.status,
    }));
    const result = await getAIAdvice({ type: 'community', context: { reports: context } });
    setAiSummary(result.advice || result.error || '');
    setIsLoadingAI(false);
  };

  const handleMapClick = async (latLng: LatLng) => {
    if (pinDropMode || showSubmitModal) {
      setDroppedPin(latLng);
      setPinDropMode(false);
      setShowSubmitModal(true);
      const addr = await reverseGeocode(latLng.lat, latLng.lng);
      setFormLocationName(addr);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!droppedPin) {
      setFormFeedback({
        type: 'error',
        message: 'Please drop a pin on the map or click "Pick Map Location" first.',
      });
      return;
    }

    setIsSubmitting(true);
    setFormFeedback(null);

    const res = await submitCommunityReport({
      category: formCategory,
      title: formTitle,
      description: formDescription,
      lat: droppedPin.lat,
      lng: droppedPin.lng,
      locationName: formLocationName || `Coord (${droppedPin.lat.toFixed(4)}, ${droppedPin.lng.toFixed(4)})`,
      reportedBy: formReporter.trim() || 'Anonymous Pedestrian',
    });

    setIsSubmitting(false);

    if (res.success && res.report) {
      setFormFeedback({
        type: 'success',
        message: 'Report submitted! It is marked as Community Submitted (unverified) until local pedestrian verification.',
      });
      setFormTitle('');
      setFormDescription('');
      setFormLocationName('');
      setDroppedPin(null);
      await loadReports();
      setTimeout(() => {
        setShowSubmitModal(false);
        setFormFeedback(null);
      }, 2000);
    } else if (res.duplicateWarning) {
      setFormFeedback({
        type: 'error',
        message: `${res.error} (Category: ${res.duplicateWarning.category.replace('_', ' ')})`,
      });
    } else {
      setFormFeedback({
        type: 'error',
        message: res.error || 'Failed to submit report. Please check input requirements.',
      });
    }
  };

  const handleForceSubmit = async () => {
    if (!droppedPin) return;
    setIsSubmitting(true);
    const res = await submitCommunityReport(
      {
        category: formCategory,
        title: formTitle,
        description: formDescription,
        lat: droppedPin.lat,
        lng: droppedPin.lng,
        locationName: formLocationName || `Coord (${droppedPin.lat.toFixed(4)}, ${droppedPin.lng.toFixed(4)})`,
        reportedBy: formReporter.trim() || 'Anonymous Pedestrian',
      },
      true // force allow duplicate
    );
    setIsSubmitting(false);
    if (res.success) {
      setFormFeedback({
        type: 'success',
        message: 'Duplicate confirmed and recorded as a distinct observation point.',
      });
      setFormTitle('');
      setFormDescription('');
      setDroppedPin(null);
      await loadReports();
      setTimeout(() => {
        setShowSubmitModal(false);
        setFormFeedback(null);
      }, 2000);
    }
  };

  const handleUpvote = async (id: string) => {
    await upvoteReport(id);
    await loadReports();
  };

  const filteredReports = reports.filter(r => {
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  });

  return (
    <div className="flex-1 bg-stone-100 flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Community Shade Intelligence
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Crowdsourced pedestrian cooling spots, drinking water points, and broken shade warnings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setPinDropMode(true);
                setShowSubmitModal(false);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all shadow-sm ${
                pinDropMode
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                  : 'bg-emerald-800 text-white hover:bg-emerald-900'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{pinDropMode ? 'Click on Map to Drop Pin' : 'Report Shade or Water Spot'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Filterable Reports List (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">

          {/* AI Community Summary */}
          {(aiSummary || isLoadingAI) && (
            <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI Infrastructure Analysis</span>
                <span className="ml-auto text-[10px] font-normal text-stone-400 font-mono">Featherless AI · Llama 3.3 70B</span>
              </div>
              {isLoadingAI ? (
                <div className="text-xs text-stone-400 animate-pulse">Analysing community reports...</div>
              ) : (
                <p className="text-xs text-stone-700 leading-relaxed">{aiSummary}</p>
              )}
            </div>
          )}

          {/* Category Filter Tabs */}
          <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-1 overflow-x-auto text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-emerald-800 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              All Reports ({reports.length})
            </button>
            <button
              onClick={() => setSelectedCategory('tree_canopy')}
              className={`px-3 py-1.5 font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'tree_canopy'
                  ? 'bg-emerald-800 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              🌳 Trees
            </button>
            <button
              onClick={() => setSelectedCategory('water_point')}
              className={`px-3 py-1.5 font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'water_point'
                  ? 'bg-emerald-800 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              💧 Water
            </button>
            <button
              onClick={() => setSelectedCategory('shaded_bench')}
              className={`px-3 py-1.5 font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'shaded_bench'
                  ? 'bg-emerald-800 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              🪑 Benches
            </button>
            <button
              onClick={() => setSelectedCategory('broken_shade')}
              className={`px-3 py-1.5 font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'broken_shade'
                  ? 'bg-emerald-800 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              ⚠️ Broken
            </button>
          </div>

          {/* List of Reports */}
          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredReports.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-2">
                <MapPin className="w-8 h-8 text-stone-400 mx-auto" />
                <div className="font-bold text-stone-800 text-sm">No reports in this category yet</div>
                <p className="text-xs text-stone-500">
                  Be the first to submit a shade point or water station in this area!
                </p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const isVerified = report.status === 'verified';
                const isWater = report.category === 'water_point';
                const isBroken = report.category === 'broken_shade';

                return (
                  <div
                    key={report.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5 transition-all hover:border-stone-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">{report.title}</span>
                          {isVerified ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                              Community Submitted
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{report.locationName}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-mono text-stone-500 block">
                          {report.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed">
                      {report.description}
                    </p>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <div>
                        <span>By {report.reportedBy}</span>
                      </div>

                      <button
                        onClick={() => handleUpvote(report.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-emerald-900 bg-stone-100 hover:bg-emerald-50 rounded-lg transition-colors border border-stone-200"
                        title="Confirm that this shade/water amenity is accurate"
                      >
                        <ThumbsUp className="w-3 h-3 text-emerald-700" />
                        <span>Confirm ({report.verificationCount})</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Interactive Pin Drop Map (lg:col-span-7) */}
        <div className="lg:col-span-7 h-[680px] flex flex-col space-y-3">
          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between text-xs">
            <span className="font-bold text-stone-900">
              {pinDropMode
                ? '📍 Click anywhere on the map to place your report pin'
                : 'Click "Report Shade or Water Spot" to add a community point'}
            </span>
            <span className="text-stone-500 font-mono">
              {reports.length} Mapped Community Assets
            </span>
          </div>

          <div className="flex-1 w-full relative">
            <LeafletMap
              communityReports={filteredReports}
              showCommunityPins={true}
              showWaterPoints={true}
              onMapClick={handleMapClick}
              pinDropMode={pinDropMode}
              droppedPin={droppedPin}
              center={[28.6289, 77.2195]}
              zoom={15}
            />
          </div>
        </div>

      </div>

      {/* Submit Report Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-base font-bold text-stone-900">Submit New Shade or Water Point</h2>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setDroppedPin(null);
                }}
                className="text-stone-400 hover:text-stone-700 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {formFeedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  formFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}
              >
                {formFeedback.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                )}
                <div>
                  <div>{formFeedback.message}</div>
                  {formFeedback.type === 'error' && formFeedback.message.includes('already registered') && (
                    <button
                      type="button"
                      onClick={handleForceSubmit}
                      className="mt-1.5 font-bold underline hover:text-red-950 block"
                    >
                      Record as a distinct nearby observation anyway &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Amenity Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as CommunityCategory)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-stone-50"
                >
                  <option value="tree_canopy">🌳 Dense Tree Canopy Walkway</option>
                  <option value="shaded_path">🏛️ Covered Arcade / Verandah</option>
                  <option value="water_point">💧 Free Public RO Drinking Water</option>
                  <option value="shaded_bench">🪑 Shaded Resting Spot / Bench</option>
                  <option value="broken_shade">⚠️ Broken / Removed Shade Canopy</option>
                  <option value="tree_planting_target">🌱 Tree Planting Target Nomination</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Deep Neem Tree Canopy on East Walkway"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-stone-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Location / Landmark Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Near Janpath Metro Gate 2"
                  value={formLocationName}
                  onChange={(e) => setFormLocationName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-stone-50"
                />
                {droppedPin && (
                  <div className="text-[11px] text-stone-500 font-mono mt-1">
                    Pinned Coordinates: {droppedPin.lat.toFixed(5)}, {droppedPin.lng.toFixed(5)}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Detailed Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Describe shade coverage percentage, water pressure, cleanliness, or best times of day..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-stone-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Your Name or Handle (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Ananya (Daily Walker)"
                  value={formReporter}
                  onChange={(e) => setFormReporter(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-stone-50"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 font-medium text-stone-600 hover:text-stone-900 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
