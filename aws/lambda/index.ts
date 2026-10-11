import { calculateExposureScore } from '../../src/utils/scoringEngine';

interface APIGatewayProxyEventV2 {
  rawPath: string;
  requestContext: {
    http: {
      method: string;
      path: string;
    };
  };
  queryStringParameters?: Record<string, string>;
  body?: string;
  isBase64Encoded?: boolean;
}

interface APIGatewayProxyResultV2 {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

// In-memory fallback if DynamoDB is not provisioned
const fallbackReports = [
  {
    id: 'rep-aws-01',
    category: 'tree_canopy',
    title: 'Verified Neem Tree Corridor',
    description: 'Continuous tree canopy coverage over 300m pedestrian sidewalk.',
    lat: 28.6288,
    lng: 77.2215,
    locationName: 'Janpath Walkway, New Delhi',
    createdAt: new Date().toISOString(),
    verificationCount: 15,
    status: 'verified',
    reportedBy: 'Pedestrian Survey Team',
  },
];

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const method = event.requestContext.http.method;
  const path = event.rawPath || event.requestContext.http.path;

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // 1. Health check
  if (method === 'GET' && (path === '/health' || path === '/api/health')) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        status: 'healthy',
        service: 'ShadeRoute AWS Lambda Service',
        runtime: 'Node.js 22 LTS (ARM64)',
        awsRegion: process.env.AWS_REGION || 'local',
        dynamoTable: process.env.DYNAMODB_TABLE || 'in-memory-fallback',
        timestamp: new Date().toISOString(),
      }),
    };
  }

  // 2. Route comparison & scoring
  if (method === 'POST' && (path === '/routes/compare' || path === '/api/routes/compare')) {
    try {
      const body = event.body ? JSON.parse(event.body) : {};
      const { start, end, ambientTempC = 35, timeOfDayHour = 13 } = body;

      if (!start || !end) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Start and End coordinates required.' }),
        };
      }

      // Calculate score for shaded route
      const shadeResult = calculateExposureScore({
        ambientTempC,
        timeOfDayHour,
        routeDurationMin: 18,
        shadeCoveragePercent: 74,
        treeCanopyPercent: 62,
        coveredWalkwayPercent: 12,
        dataConfidencePercent: 88,
      });

      // Calculate score for direct unshaded route
      const directResult = calculateExposureScore({
        ambientTempC,
        timeOfDayHour,
        routeDurationMin: 15,
        shadeCoveragePercent: 18,
        treeCanopyPercent: 10,
        coveredWalkwayPercent: 8,
        dataConfidencePercent: 82,
      });

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          shadeRoute: {
            exposureScore: shadeResult.score,
            tier: shadeResult.tier,
            shadeCoverage: 74,
            breakdown: shadeResult.breakdown,
          },
          directRoute: {
            exposureScore: directResult.score,
            tier: directResult.tier,
            shadeCoverage: 18,
            breakdown: directResult.breakdown,
          },
        }),
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown parsing error';
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Routing execution failed', message }),
      };
    }
  }

  // 3. Get Community Reports
  if (method === 'GET' && (path === '/reports' || path === '/api/reports')) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(fallbackReports),
    };
  }

  // 4. Submit Community Report
  if (method === 'POST' && (path === '/reports' || path === '/api/reports')) {
    try {
      const body = event.body ? JSON.parse(event.body) : {};
      const { title, category, lat, lng, description, locationName } = body;

      if (!title || !lat || !lng) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Title, latitude, and longitude are required.' }),
        };
      }

      const report = {
        id: `rep-${Date.now()}`,
        category: category || 'tree_canopy',
        title,
        description: description || '',
        lat,
        lng,
        locationName: locationName || `Location (${lat}, ${lng})`,
        createdAt: new Date().toISOString(),
        verificationCount: 1,
        status: 'community_submitted',
        reportedBy: 'AWS Lambda Client',
      };

      fallbackReports.push(report);

      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify(report),
      };
    } catch {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid JSON request payload' }),
      };
    }
  }

  return {
    statusCode: 404,
    headers: corsHeaders,
    body: JSON.stringify({ error: `Route ${method} ${path} not found.` }),
  };
};
