import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-stone-50/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand wordmark (single element, no trailing pills or descriptors) */}
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-emerald-900 whitespace-nowrap shrink-0 hover:text-emerald-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-lime-300 flex items-center justify-center font-black text-base shadow-sm">
              S
            </div>
            <span>ShadeRoute</span>
          </Link>

          {/* Zone 2: 5 concise single-line nav links with hover states */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-600">
            <Link
              to="/planner"
              className={`whitespace-nowrap transition-colors hover:text-emerald-900 ${
                isActive('/planner') ? 'text-emerald-900 font-semibold border-b-2 border-emerald-800 pb-0.5' : ''
              }`}
            >
              Route Planner
            </Link>
            <Link
              to="/explorer"
              className={`whitespace-nowrap transition-colors hover:text-emerald-900 ${
                isActive('/explorer') ? 'text-emerald-900 font-semibold border-b-2 border-emerald-800 pb-0.5' : ''
              }`}
            >
              Shade Explorer
            </Link>
            <Link
              to="/timeshift"
              className={`whitespace-nowrap transition-colors hover:text-emerald-900 ${
                isActive('/timeshift') ? 'text-emerald-900 font-semibold border-b-2 border-emerald-800 pb-0.5' : ''
              }`}
            >
              TimeShift
            </Link>
            <Link
              to="/community"
              className={`whitespace-nowrap transition-colors hover:text-emerald-900 ${
                isActive('/community') ? 'text-emerald-900 font-semibold border-b-2 border-emerald-800 pb-0.5' : ''
              }`}
            >
              Community Shade
            </Link>
            <Link
              to="/dashboard"
              className={`whitespace-nowrap transition-colors hover:text-emerald-900 ${
                isActive('/dashboard') ? 'text-emerald-900 font-semibold border-b-2 border-emerald-800 pb-0.5' : ''
              }`}
            >
              Impact Dashboard
            </Link>
          </nav>

          {/* Zone 3: Exactly 1 primary action */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Plan My Route</span>
            </Link>
          </div>

          {/* Mobile hamburger toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:text-stone-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-stone-50 px-4 pt-3 pb-4 space-y-2">
          <Link
            to="/planner"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-stone-700 hover:bg-emerald-50 rounded-lg"
          >
            Route Planner
          </Link>
          <Link
            to="/explorer"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-stone-700 hover:bg-emerald-50 rounded-lg"
          >
            Shade Explorer
          </Link>
          <Link
            to="/timeshift"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-stone-700 hover:bg-emerald-50 rounded-lg"
          >
            TimeShift
          </Link>
          <Link
            to="/community"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-stone-700 hover:bg-emerald-50 rounded-lg"
          >
            Community Shade
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-stone-700 hover:bg-emerald-50 rounded-lg"
          >
            Impact Dashboard
          </Link>
          <Link
            to="/methodology"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-stone-700 hover:bg-emerald-50 rounded-lg"
          >
            Scoring &amp; AWS
          </Link>
          <div className="pt-2">
            <Link
              to="/planner"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-2.5 text-xs font-semibold text-white bg-emerald-800 rounded-lg"
            >
              Plan My Route
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
