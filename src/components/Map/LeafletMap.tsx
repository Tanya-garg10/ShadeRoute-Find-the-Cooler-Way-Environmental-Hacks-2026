import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RouteAlternative, CommunityReport, LatLng, ShadeGapStreet } from '../../types';

interface LeafletMapProps {
  start?: LatLng | null;
  end?: LatLng | null;
  routes?: RouteAlternative[];
  selectedRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
  communityReports?: CommunityReport[];
  shadeGaps?: ShadeGapStreet[];
  onSelectShadeGap?: (gap: ShadeGapStreet) => void;
  showShadePolygons?: boolean;
  showWaterPoints?: boolean;
  showCommunityPins?: boolean;
  showShadeGaps?: boolean;
  onMapClick?: (latLng: LatLng) => void;
  pinDropMode?: boolean;
  droppedPin?: LatLng | null;
  center?: [number, number];
  zoom?: number;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  start,
  end,
  routes = [],
  selectedRouteId,
  onSelectRoute,
  communityReports = [],
  shadeGaps = [],
  onSelectShadeGap,
  showShadePolygons = true,
  showWaterPoints = true,
  showCommunityPins = true,
  showShadeGaps = true,
  onMapClick,
  pinDropMode = false,
  droppedPin = null,
  center = [28.6289, 77.2195], // Default: Central Delhi
  zoom = 15,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayersRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const featuresLayerRef = useRef<L.LayerGroup | null>(null);
  const gapsLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Fix default Leaflet icon paths in bundlers
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      attributionControl: true,
    });

    // High quality OpenStreetMap carto tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors | ShadeRoute Engine',
    }).addTo(map);

    routeLayersRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    featuresLayerRef.current = L.layerGroup().addTo(map);
    gapsLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle map click events
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [onMapClick]);

  // Update center if explicitly shifted
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (routes.length === 0 && shadeGaps.length === 0 && !start && !end) {
      map.setView(center, zoom);
    }
  }, [center, zoom, routes.length, shadeGaps.length, start, end]);

  // Render Routes and Alternatives
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = routeLayersRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    if (routes.length === 0) return;

    const bounds = L.latLngBounds([]);

    // Sort routes so selected route renders on top
    const sorted = [...routes].sort((a, b) => {
      if (a.id === selectedRouteId) return 1;
      if (b.id === selectedRouteId) return -1;
      return 0;
    });

    sorted.forEach(route => {
      const isSelected = route.id === selectedRouteId;
      const isShade = route.id === 'shade-optimized' || route.id === 'canopy-max';

      // Style routes with non-color differentiators (pattern, line weight, opacity)
      const polyline = L.polyline(route.coordinates, {
        color: isShade ? '#047857' : '#d97706',
        weight: isSelected ? (isShade ? 7 : 5) : 4,
        opacity: isSelected ? 0.95 : 0.45,
        dashArray: isShade ? undefined : '8, 8', // Dashed for direct/unshaded route
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Background casing halo for selected route
      if (isSelected) {
        const halo = L.polyline(route.coordinates, {
          color: isShade ? '#a7f3d0' : '#fde68a',
          weight: isShade ? 12 : 9,
          opacity: 0.5,
          lineCap: 'round',
        });
        halo.addTo(layerGroup);
      }

      polyline.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (onSelectRoute) onSelectRoute(route.id);
      });

      const popupContent = `
        <div style="font-family: inherit; min-width: 180px;">
          <div style="font-weight: 700; color: ${isShade ? '#065f46' : '#92400e'}; margin-bottom: 4px;">
            ${route.name}
          </div>
          <div style="font-size: 12px; color: #4b5563; margin-bottom: 6px;">
            <strong>${(route.distanceMeters / 1000).toFixed(2)} km</strong> &bull; 
            <strong>${route.durationMinutes} min walk</strong>
          </div>
          <div style="font-size: 12px; color: ${isShade ? '#047857' : '#b45309'}; font-weight: 600;">
            ${route.shadeCoveragePercent}% Shade Coverage &bull; Score: ${route.exposureScore}/100
          </div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
            ${route.tradeoffSummary}
          </div>
        </div>
      `;
      polyline.bindPopup(popupContent);

      polyline.addTo(layerGroup);
      route.coordinates.forEach(c => bounds.extend(c));
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
    }
  }, [routes, selectedRouteId, onSelectRoute]);

  // Render Shade Gap Street Segments
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = gapsLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    if (!showShadeGaps || shadeGaps.length === 0) return;

    const bounds = L.latLngBounds([]);

    shadeGaps.forEach(gap => {
      let strokeColor = '#dc2626'; // Severe gap: red
      let dashPattern: string | undefined = undefined;
      let strokeWidth = 5;

      if (gap.status === 'well_shaded') {
        strokeColor = '#059669'; // Green
        strokeWidth = 6;
      } else if (gap.status === 'low_shade') {
        strokeColor = '#ea580c'; // Orange
        dashPattern = '6, 6';
      } else if (gap.status === 'unknown_data') {
        strokeColor = '#64748b'; // Slate
        dashPattern = '2, 6';
        strokeWidth = 4;
      }

      const polyline = L.polyline(gap.coordinates, {
        color: strokeColor,
        weight: strokeWidth,
        opacity: 0.85,
        dashArray: dashPattern,
        lineCap: 'round',
      });

      polyline.on('click', () => {
        if (onSelectShadeGap) onSelectShadeGap(gap);
      });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; min-width: 200px;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">${gap.streetName}</div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">${gap.locality} &bull; ${gap.lengthMeters}m</div>
          <div style="margin-bottom: 4px; font-weight: 600; color: ${strokeColor};">
            Status: ${gap.status.replace('_', ' ').toUpperCase()} (${gap.shadePercent}% Shade)
          </div>
          <p style="color: #334155; font-size: 11px; margin-bottom: 6px; line-height: 1.4;">${gap.description}</p>
          <div style="font-size: 11px; color: #047857; font-weight: 600;">
            🌱 Community Greening Votes: ${gap.communityPlantingVotes}
          </div>
        </div>
      `;
      polyline.bindPopup(popupHtml);
      polyline.addTo(layer);

      gap.coordinates.forEach(c => bounds.extend(c));
    });

    if (routes.length === 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [shadeGaps, showShadeGaps, onSelectShadeGap, routes.length]);

  // Render Start, End, and Dropped Pin Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    if (start) {
      const startIcon = L.divIcon({
        className: 'sr-marker-start',
        html: `
          <div style="background-color: #047857; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); border: 3px solid white; font-weight: 800; font-size: 13px;">
            A
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([start.lat, start.lng], { icon: startIcon })
        .bindTooltip('Starting Point (A)', { permanent: false, direction: 'top' })
        .addTo(layer);
    }

    if (end) {
      const endIcon = L.divIcon({
        className: 'sr-marker-end',
        html: `
          <div style="background-color: #0f172a; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); border: 3px solid white; font-weight: 800; font-size: 13px;">
            B
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([end.lat, end.lng], { icon: endIcon })
        .bindTooltip('Destination (B)', { permanent: false, direction: 'top' })
        .addTo(layer);
    }

    if (droppedPin) {
      const pinIcon = L.divIcon({
        className: 'sr-marker-dropped',
        html: `
          <div style="background-color: #2563eb; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(37,99,235,0.4); border: 3px solid white; font-size: 16px;">
            📍
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([droppedPin.lat, droppedPin.lng], { icon: pinIcon })
        .bindTooltip('Selected Pin Location', { permanent: true, direction: 'top' })
        .addTo(layer);
    }
  }, [start, end, droppedPin]);

  // Render Community Points & Infrastructure
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = featuresLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    if (!showCommunityPins && !showWaterPoints) return;

    communityReports.forEach(report => {
      if (report.category === 'water_point' && !showWaterPoints) return;
      if (report.category !== 'water_point' && !showCommunityPins) return;

      const isWater = report.category === 'water_point';
      const isBench = report.category === 'shaded_bench';
      const isBroken = report.category === 'broken_shade';
      const isTreePlanting = report.category === 'tree_planting_target';

      let bg = '#10b981';
      let symbol = '🌳';
      if (isWater) {
        bg = '#0284c7';
        symbol = '💧';
      } else if (isBench) {
        bg = '#84cc16';
        symbol = '🪑';
      } else if (isBroken) {
        bg = '#ef4444';
        symbol = '⚠️';
      } else if (isTreePlanting) {
        bg = '#059669';
        symbol = '🌱';
      }

      const icon = L.divIcon({
        className: 'sr-marker-shade',
        html: `
          <div style="background-color: ${bg}; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.25); border: 2px solid white; font-size: 13px;">
            ${symbol}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([report.lat, report.lng], { icon });
      const popupHtml = `
        <div style="font-family: inherit; font-size: 13px; max-width: 220px;">
          <div style="font-weight: 700; margin-bottom: 2px; color: #111827;">${report.title}</div>
          <div style="font-size: 11px; color: #6b7280; margin-bottom: 6px;">
            ${report.category.replace('_', ' ').toUpperCase()} &bull; ${report.verificationCount} verifications
          </div>
          <p style="font-size: 12px; color: #374151; margin-bottom: 6px;">${report.description}</p>
          <div style="font-size: 10px; color: #9ca3af;">Status: ${report.status}</div>
        </div>
      `;
      marker.bindPopup(popupHtml);
      marker.addTo(layer);
    });
  }, [communityReports, showCommunityPins, showWaterPoints]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden shadow-inner border border-stone-200">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Legend (High contrast, accessible, clear non-color symbols) */}
      <div className="absolute bottom-4 left-4 z-[500] bg-white/95 backdrop-blur-md rounded-xl p-3 border border-stone-200 shadow-md text-xs text-stone-700 max-w-xs pointer-events-auto">
        <div className="font-bold text-stone-900 mb-2 flex items-center justify-between">
          <span>Map Legend</span>
          <span className="text-[11px] font-normal text-stone-500">Accessible Symbols</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-1.5 rounded-full bg-emerald-700 block"></span>
            <span className="font-medium text-stone-800">Cooler Canopy Route (Solid)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-1.5 border-b-2 border-dashed border-amber-600 block"></span>
            <span className="text-stone-700">Standard Direct Route (Dashed)</span>
          </div>
          {shadeGaps.length > 0 && (
            <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
              <span className="w-5 h-1 bg-red-600 block"></span>
              <span className="text-stone-800 text-[11px]">Severe Shade Gap Street</span>
            </div>
          )}
          <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
            <span className="text-xs">🌳 Mapped Trees / Shade</span>
            <span className="text-xs ml-auto">💧 Water Kiosk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">🪑 Shaded Bench</span>
            <span className="text-xs ml-auto">⚠️ Broken Shade</span>
          </div>
        </div>
      </div>

      {pinDropMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-blue-900 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg pointer-events-none flex items-center gap-2">
          <span>Click anywhere on the map to place your report pin</span>
        </div>
      )}
    </div>
  );
};
