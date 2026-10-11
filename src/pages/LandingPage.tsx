import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sun, ShieldCheck, ArrowRight, Droplets, MapPin, TreePine, Clock } from 'lucide-react';
import heroImage from '../assets/images/hero_shade_canopy_1791713210995.jpg';
import walkingImage from '../assets/images/shade_urban_walking_1791713227124.jpg';

export const LandingPage: React.FC = () => {
  const [activePreviewRoute, setActivePreviewRoute] = useState<'shade' | 'direct'>('shade');

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Proposition and Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
                <span>Pedestrian Heat Resilience</span>
                <span aria-hidden="true">&middot;</span>
                <span>Shade-Aware Navigation</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.1] text-balance">
                The shortest way isn’t always the{' '}
                <span className="text-emerald-800 underline decoration-lime-500 decoration-wavy decoration-2">
                  coolest way.
                </span>
              </h1>

              <p className="text-lg text-stone-600 max-w-2xl leading-relaxed">
                Standard navigation apps optimize purely for minutes and distance—often pushing pedestrians onto unshaded, sun-baked blacktop. ShadeRoute maps mature tree canopy corridors, covered verandahs, and municipal water posts to reduce midday heat strain.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/planner"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-md shadow-emerald-900/10 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Compass className="w-4 h-4 text-lime-300" />
                  <span>Plan My Route</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-stone-700 bg-white hover:bg-stone-100 rounded-xl transition-all border border-stone-300 shadow-sm"
                >
                  <span>Explore How It Works</span>
                </a>
              </div>

              {/* Quiet Trust Footnote */}
              <div className="flex items-center gap-6 pt-4 text-xs text-stone-500 border-t border-stone-200">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Transparent 0–100 Exposure Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TreePine className="w-4 h-4 text-emerald-700" />
                  <span>Real Tree Canopy Mapping</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <span>Public Drinking Fountains</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset with Route Comparison Overlay */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-200 bg-white">
                <img
                  src={heroImage}
                  alt="Pedestrian walking in deep cool tree shade canopy along urban boulevard"
                  className="w-full h-72 sm:h-80 object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Interactive Route Comparison Preview Card */}
                <div className="p-5 bg-white border-t border-stone-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-stone-900">Live Heat Exposure Comparison</span>
                    <span className="text-[11px] text-stone-500 font-mono tabular-nums">Delhi Central &middot; 38°C Midday</span>
                  </div>

                  {/* Route Selector Tabs */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl mb-4">
                    <button
                      onClick={() => setActivePreviewRoute('shade')}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                        activePreviewRoute === 'shade'
                          ? 'bg-emerald-800 text-white shadow-sm'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Cooler Canopy Route
                    </button>
                    <button
                      onClick={() => setActivePreviewRoute('direct')}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                        activePreviewRoute === 'direct'
                          ? 'bg-amber-700 text-white shadow-sm'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Standard Direct
                    </button>
                  </div>

                  {/* Dynamic Route Stats */}
                  {activePreviewRoute === 'shade' ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-600">Estimated Heat Exposure</span>
                        <span className="font-bold text-emerald-800 font-mono tabular-nums">34 / 100 &middot; Low Stress</span>
                      </div>
                      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full w-[34%]" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 font-mono tabular-nums">
                        <span>74% Tree Shade</span>
                        <span>1.2 km &middot; 16 mins walk</span>
                        <span>2 Water Points</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-600">Estimated Heat Exposure</span>
                        <span className="font-bold text-amber-800 font-mono tabular-nums">76 / 100 &middot; High Heat Risk</span>
                      </div>
                      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-600 h-full rounded-full w-[76%]" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 font-mono tabular-nums">
                        <span>18% Shade</span>
                        <span>1.0 km &middot; 13 mins walk</span>
                        <span>0 Water Points</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-500">Only +3 minutes for 50%+ less sun</span>
                    <Link
                      to="/planner"
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <span>Try Route Planner</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Problem & Solution Strip */}
      <section className="py-14 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Why Pedestrian Shade Matters</span>
            <h2 className="text-3xl font-bold text-stone-900 tracking-tight">
              Extreme heat is an urban accessibility crisis.
            </h2>
            <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
              During Indian summers, asphalt pavement surface temperatures regularly exceed 55°C (131°F), radiating intense secondary thermal energy. Walking 15 minutes under an unshaded boulevard produces acute dehydration and heat exhaustion risks for delivery riders, students, and elders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-base">Direct Sun Overheating</h3>
              <p className="text-stone-600 text-xs leading-relaxed">
                Traditional GPS routes send walkers across wide, 6-lane paved roads with zero shade canopy, treating pedestrian walking identically to motorized vehicles.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <TreePine className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-base">Microclimate Cooling</h3>
              <p className="text-stone-600 text-xs leading-relaxed">
                Mature Neem, Peepal, and Rain Tree canopies block up to 85% of direct solar radiation and lower apparent radiant temperatures by 4°C to 7°C.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-base">Cooling Infrastructure</h3>
              <p className="text-stone-600 text-xs leading-relaxed">
                We integrate verified community water posts, shaded park benches, and covered colonnade verandas directly into the pedestrian route score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive & Architecture Section */}
      <section id="how-it-works" className="py-16 bg-stone-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Core Engineering</span>
              <h2 className="text-3xl font-bold text-stone-900 tracking-tight mt-1">
                How ShadeRoute scores your path
              </h2>
            </div>
            <Link
              to="/methodology"
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5"
            >
              <span>View full scoring equation &amp; AWS architecture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Visual preview */}
            <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-md">
              <img
                src={walkingImage}
                alt="Pedestrian walking under shaded pergolas near public water point"
                className="w-full h-80 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* 3 Step Breakdown */}
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">1</div>
                  <h4 className="font-bold text-stone-900 text-sm">OSRM Pedestrian Graph Routing</h4>
                </div>
                <p className="text-stone-600 text-xs leading-relaxed pl-8">
                  We query real OpenStreetMap pedestrian routing networks to discover legitimate sidewalks, park trails, and alleyways rather than vehicle-only freeways.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">2</div>
                  <h4 className="font-bold text-stone-900 text-sm">Solar Angle &amp; Canopy Overlay</h4>
                </div>
                <p className="text-stone-600 text-xs leading-relaxed pl-8">
                  We compute the diurnal solar zenith for the exact time of day. Route segments under mapped tree canopy receive solar mitigation credits; segments over bare asphalt accumulate heat penalties.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">3</div>
                  <h4 className="font-bold text-stone-900 text-sm">Honest Missing-Data Accounting</h4>
                </div>
                <p className="text-stone-600 text-xs leading-relaxed pl-8">
                  When tree inventories are absent, we display “Shade data unavailable” with confidence indicators rather than hallucinating safe conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences Grid */}
      <section className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Target Users</span>
            <h2 className="text-3xl font-bold text-stone-900 tracking-tight mt-1">Built for people on foot</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
              <div className="font-bold text-stone-900 text-sm">Delivery Workers</div>
              <p className="text-stone-600 text-xs leading-relaxed">
                Locate shaded waiting points between delivery orders and free municipal RO water refill stations.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
              <div className="font-bold text-stone-900 text-sm">Students &amp; Commuters</div>
              <p className="text-stone-600 text-xs leading-relaxed">
                Find comfortable walking corridors between metro stations, campus gates, and bus stops during peak midday hours.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
              <div className="font-bold text-stone-900 text-sm">Senior Citizens</div>
              <p className="text-stone-600 text-xs leading-relaxed">
                Prioritize routes with frequent shaded resting benches and gentler microclimates with lower thermal stress.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
              <div className="font-bold text-stone-900 text-sm">Urban Planners</div>
              <p className="text-stone-600 text-xs leading-relaxed">
                Analyze community reports of missing shade infrastructure to identify critical pedestrian corridors for tree plantation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-14 bg-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto text-balance">
            Ready to find the cooler walking route?
          </h2>
          <p className="text-emerald-100 max-w-xl mx-auto text-sm leading-relaxed">
            Enter your starting point and destination to compare live walking routes, shade percentages, and estimated heat exposure.
          </p>
          <div className="pt-2">
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-emerald-950 bg-lime-400 hover:bg-lime-300 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Interactive Route Planner</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
