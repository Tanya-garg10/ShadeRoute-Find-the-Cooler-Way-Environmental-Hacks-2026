import { Router, Request, Response } from 'express';
import { calculateExposureScore } from '../utils/scoringEngine';
import { INITIAL_COMMUNITY_REPORTS } from '../data/initialData';
import { CommunityReport, RouteAlternative } from '../types';
import { fetchPedestrianRoutes } from '../services/routingService';

export const apiRouter = Router();

// In-memory reports store for local backend
let reportsStore: CommunityReport[] = [...INITIAL_COMMUNITY_REPORTS];

// Health Check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'ShadeRoute Backend Engine',
    version: '1.2.0',
    awsDeploymentStatus: 'Local backend active (AWS Lambda export ready in /aws/lambda)',
    timestamp: new Date().toISOString(),
  });
});

// Compare Routes
apiRouter.post('/routes/compare', async (req: Request, res: Response) => {
  try {
    const { start, end, ambientTempC = 34, timeOfDayHour = 13 } = req.body;

    if (!start || !end || typeof start.lat !== 'number' || typeof end.lat !== 'number') {
      res.status(400).json({ error: 'Valid start and end coordinates [lat, lng] are required.' });
      return;
    }

    const routes: RouteAlternative[] = await fetchPedestrianRoutes(
      start,
      end,
      Number(ambientTempC),
      Number(timeOfDayHour)
    );

    res.json({
      success: true,
      routes,
      evaluatedAt: new Date().toISOString(),
      ambientTempC,
      timeOfDayHour,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown routing error';
    res.status(500).json({ error: 'Routing calculation failed', details: message });
  }
});

// Get Community Reports
apiRouter.get('/reports', (req: Request, res: Response) => {
  const category = req.query.category as string;
  let list = reportsStore;
  if (category && category !== 'all') {
    list = reportsStore.filter(r => r.category === category);
  }
  res.json(list);
});

// Submit Community Report
apiRouter.post('/reports', (req: Request, res: Response) => {
  const { category, title, description, lat, lng, locationName, reportedBy } = req.body;

  if (!title || title.trim().length < 5) {
    res.status(400).json({ error: 'Title must be at least 5 characters long.' });
    return;
  }

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    res.status(400).json({ error: 'Valid latitude and longitude numbers are required.' });
    return;
  }

  const newReport: CommunityReport = {
    id: `rep-${Date.now()}`,
    category: category || 'tree_canopy',
    title: title.trim(),
    description: (description || '').trim(),
    lat,
    lng,
    locationName: locationName || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    createdAt: new Date().toISOString(),
    verificationCount: 1,
    status: 'community_submitted',
    reportedBy: (reportedBy || 'Anonymous Pedestrian').trim(),
  };

  reportsStore = [newReport, ...reportsStore];
  res.status(201).json(newReport);
});

// Upvote / Verify Report
apiRouter.post('/reports/:id/verify', (req: Request, res: Response) => {
  const { id } = req.params;
  const report = reportsStore.find(r => r.id === id);

  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }

  report.verificationCount += 1;
  if (report.verificationCount >= 10 && report.status === 'community_submitted') {
    report.status = 'verified';
  }

  res.json({ success: true, verificationCount: report.verificationCount, status: report.status });
});
