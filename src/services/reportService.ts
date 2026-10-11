import { CommunityReport } from '../types';
import { INITIAL_COMMUNITY_REPORTS } from '../data/initialData';

const STORAGE_KEY = 'shaderoute_community_reports';

export async function getCommunityReports(): Promise<CommunityReport[]> {
  try {
    const res = await fetch('/api/reports', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // API endpoint not reachable yet, fall through to localStorage
  }

  // Local fallback persistence
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }

  // Initialize with curated dataset
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMMUNITY_REPORTS));
  return INITIAL_COMMUNITY_REPORTS;
}

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function detectPotentialDuplicates(
  lat: number,
  lng: number,
  category: string
): Promise<CommunityReport | null> {
  const all = await getCommunityReports();
  for (const report of all) {
    if (report.category === category) {
      const dist = getDistanceMeters(lat, lng, report.lat, report.lng);
      if (dist < 45) {
        return report;
      }
    }
  }
  return null;
}

export async function submitCommunityReport(
  reportData: Omit<CommunityReport, 'id' | 'createdAt' | 'verificationCount' | 'status'>,
  forceAllowDuplicate = false
): Promise<{ success: boolean; report?: CommunityReport; duplicateWarning?: CommunityReport; error?: string }> {
  // Client-side validations
  if (!reportData.title || reportData.title.trim().length < 5) {
    return { success: false, error: 'Please enter a descriptive report title (at least 5 characters).' };
  }
  if (!reportData.lat || !reportData.lng) {
    return { success: false, error: 'Please select a valid location on the map.' };
  }

  // Duplicate detection check
  if (!forceAllowDuplicate) {
    const existing = await detectPotentialDuplicates(reportData.lat, reportData.lng, reportData.category);
    if (existing) {
      return {
        success: false,
        duplicateWarning: existing,
        error: `A similar "${existing.title}" is already registered within 40m. You can verify it or proceed anyway.`,
      };
    }
  }

  const newReport: CommunityReport = {
    ...reportData,
    id: `rep-${Date.now()}`,
    createdAt: new Date().toISOString(),
    verificationCount: 1,
    status: 'community_submitted', // Must start as unverified community report
  };

  // Attempt backend persistence
  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReport),
    });
    if (res.ok) {
      const savedBackendReport = await res.json();
      syncLocalReport(savedBackendReport);
      return { success: true, report: savedBackendReport };
    }
  } catch {
    // If backend is unavailable, store in local fallback
  }

  syncLocalReport(newReport);
  return { success: true, report: newReport };
}

export async function upvoteReport(reportId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/reports/${reportId}/verify`, { method: 'POST' });
    if (res.ok) return true;
  } catch {
    // Local fallback
  }

  const current = await getCommunityReports();
  const updated = current.map(r => {
    if (r.id === reportId) {
      const newCount = r.verificationCount + 1;
      return {
        ...r,
        verificationCount: newCount,
        status: (newCount >= 10 ? 'verified' : r.status) as CommunityReport['status'],
        upvotedBySession: true,
      };
    }
    return r;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return true;
}

function syncLocalReport(report: CommunityReport) {
  const saved = localStorage.getItem(STORAGE_KEY);
  let list: CommunityReport[] = INITIAL_COMMUNITY_REPORTS;
  if (saved) {
    try {
      list = JSON.parse(saved);
    } catch {
      list = INITIAL_COMMUNITY_REPORTS;
    }
  }
  const exists = list.some(r => r.id === report.id);
  if (!exists) {
    list = [report, ...list];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}
