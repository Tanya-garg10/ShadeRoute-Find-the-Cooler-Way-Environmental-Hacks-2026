import { Router, Request, Response } from 'express';
import { calculateExposureScore } from '../utils/scoringEngine';
import { INITIAL_COMMUNITY_REPORTS } from '../data/initialData';
import { CommunityReport, RouteAlternative } from '../types';
import { fetchPedestrianRoutes } from '../services/routingService';

const FEATHERLESS_API_KEY = process.env.FEATHERLESS_API_KEY || '';
const FEATHERLESS_MODEL = process.env.FEATHERLESS_MODEL || 'meta-llama/Llama-3.3-70B-Instruct';

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

// AI Heat Advisory — powered by Featherless AI (OpenAI-compatible)
apiRouter.post('/ai/advice', async (req: Request, res: Response) => {
  const { type, context } = req.body;

  if (!FEATHERLESS_API_KEY) {
    res.status(503).json({ error: 'FEATHERLESS_API_KEY not configured' });
    return;
  }

  const prompts: Record<string, string> = {
    route: `You are ShadeRoute's heat-safety advisor for Indian pedestrians. Given this route comparison data:
${JSON.stringify(context, null, 2)}
In 2-3 concise sentences, give a practical heat-safety tip for a pedestrian choosing between these routes. Mention specific shade % or score numbers. Be direct, no intro fluff.`,

    timeshift: `You are ShadeRoute's departure-time advisor. Given this hourly heat data for an Indian city:
${JSON.stringify(context, null, 2)}
In 2 sentences, recommend the best departure window and briefly explain why, referencing the UV index and temperature. Be specific and direct.`,

    community: `You are ShadeRoute's urban heat analyst. Given these community-submitted shade reports from an Indian city:
${JSON.stringify(context, null, 2)}
In 2-3 sentences, summarize the key shade gaps or infrastructure needs highlighted by these reports. Be concise and actionable.`,
  };

  const prompt = prompts[type];
  if (!prompt) {
    res.status(400).json({ error: 'Invalid advice type. Use: route | timeshift | community' });
    return;
  }

  try {
    const response = await fetch('https://api.featherless.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FEATHERLESS_API_KEY}`,
      },
      body: JSON.stringify({
        model: FEATHERLESS_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      res.status(502).json({ error: 'Featherless AI error', details: err });
      return;
    }

    const data = await response.json();
    const advice = data.choices?.[0]?.message?.content?.trim() || '';

    res.json({ advice, model: FEATHERLESS_MODEL });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: 'AI request failed', details: message });
  }
});
