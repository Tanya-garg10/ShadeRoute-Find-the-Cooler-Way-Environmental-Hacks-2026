import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-100 border-t border-stone-200 mt-auto text-stone-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Column 1: Brand & Direct Action */}
          <div className="md:col-span-5 space-y-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-base font-bold text-emerald-950 hover:text-emerald-800 transition-colors"
            >
              <div className="w-6 h-6 rounded-md bg-emerald-800 text-lime-300 flex items-center justify-center text-xs font-black shadow-xs">
                S
              </div>
              <span>ShadeRoute — Find the Cooler Way</span>
            </Link>
            <p className="text-stone-600 max-w-sm leading-relaxed text-xs">
              Pedestrian heat-risk and shade-aware walking navigation. Helping students, delivery workers, and daily commuters choose cooler walking routes during extreme heat.
            </p>
            <div className="pt-2">
              <Link
                to="/planner"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-900 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-lg transition-colors border border-emerald-200"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-800" />
                <span>Start Planning a Route</span>
              </Link>
            </div>
          </div>

          {/* Column 2: Application Navigation (All working clickable internal links) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
              Navigation &amp; Features
            </h4>
            <ul className="space-y-2 text-stone-600">
              <li>
                <Link to="/planner" className="hover:text-emerald-900 transition-colors flex items-center gap-1">
                  <span>Route Planner</span>
                </Link>
              </li>
              <li>
                <Link to="/explorer" className="hover:text-emerald-900 transition-colors flex items-center gap-1">
                  <span>Shade Gap Explorer</span>
                </Link>
              </li>
              <li>
                <Link to="/timeshift" className="hover:text-emerald-900 transition-colors flex items-center gap-1">
                  <span>TimeShift Departure Optimizer</span>
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-emerald-900 transition-colors flex items-center gap-1">
                  <span>Community Shade &amp; Water Spots</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-900 transition-colors flex items-center gap-1">
                  <span>Urban Heat Action Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Data Sources & Methodology (All working clickable links) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
              Data &amp; Transparency
            </h4>
            <ul className="space-y-2 text-stone-600">
              <li>
                <Link to="/methodology" className="hover:text-emerald-900 transition-colors">
                  Scoring Engine Formula
                </Link>
              </li>
              <li>
                <Link to="/methodology" className="hover:text-emerald-900 transition-colors">
                  AWS Serverless Architecture
                </Link>
              </li>
              <li>
                <a
                  href="https://www.openstreetmap.org"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-900 transition-colors inline-flex items-center gap-1"
                >
                  <span>OpenStreetMap Data</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://open-meteo.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-900 transition-colors inline-flex items-center gap-1"
                >
                  <span>Open-Meteo Solar &amp; Weather API</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </li>
            </ul>

            <div className="pt-2 text-[11px] text-stone-500 leading-relaxed flex items-start gap-1.5 border-t border-stone-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
              <span>Calculated algorithmic heat exposure estimates based on tree canopy surveys and solar models.</span>
            </div>
          </div>

        </div>

        {/* Bottom Sub-bar */}
        <div className="border-t border-stone-200 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
          <p>&copy; 2026 ShadeRoute. Open pedestrian heat resilience platform.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/planner" className="hover:text-stone-800 transition-colors">Route Planner</Link>
            <span aria-hidden="true">&middot;</span>
            <Link to="/explorer" className="hover:text-stone-800 transition-colors">Shade Explorer</Link>
            <span aria-hidden="true">&middot;</span>
            <Link to="/timeshift" className="hover:text-stone-800 transition-colors">TimeShift</Link>
            <span aria-hidden="true">&middot;</span>
            <Link to="/methodology" className="hover:text-stone-800 transition-colors">Methodology</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
