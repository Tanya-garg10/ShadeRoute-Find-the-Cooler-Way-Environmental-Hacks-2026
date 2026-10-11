# ShadeRoute — AWS Cloud Deployment Guide

This guide walks through configuring and deploying the ShadeRoute serverless backend to AWS for the **Environmental Hacks 2026 | Bharat Builds Tour**.

---

## 1. Architecture Overview

```
React 19 SPA (Client) ──▶ Amazon API Gateway (HTTP API v2)
                                 │
                                 ▼
                         AWS Lambda (Node.js 22 LTS, ARM64)
                                 │
                     ┌───────────┴───────────┐
                     ▼                       ▼
            Open-Meteo & OSRM       Amazon DynamoDB
            Pedestrian Network      (ShadeReports Table)
```

- **Frontend**: React 19 + TypeScript + Tailwind CSS + Leaflet (hosted on S3 + CloudFront or Cloud Run).
- **API Gateway**: Cost-effective HTTP API (low latency, auto-scaling).
- **AWS Lambda**: Stateless execution of solar irradiance scoring and route aggregation.
- **Amazon DynamoDB**: Single-table key-value storage for crowdsourced shade points and drinking water kiosks.

---

## 2. Prerequisites

1. **AWS CLI** installed and configured:
   ```bash
   aws configure
   # Provide AWS Access Key ID, Secret Access Key, and Region (e.g., ap-south-1 for Mumbai)
   ```
2. **AWS SAM CLI**:
   ```bash
   sam --version
   ```
3. **Node.js 22+ & npm**:
   ```bash
   node -v
   ```

---

## 3. Local Testing & Verification

Test the Lambda handler locally using AWS SAM CLI:

```bash
cd aws
sam local start-api --port 8080
```

Verify the health check endpoint:
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "ShadeRoute AWS Lambda Service",
  "runtime": "Node.js 22 LTS (ARM64)",
  "awsRegion": "local",
  "timestamp": "2026-10-11T..."
}
```

---

## 4. Production Deployment

Deploy the serverless stack using SAM:

```bash
cd aws
sam build
sam deploy --guided
```

When prompted:
- **Stack Name**: `shaderoute-production`
- **AWS Region**: `ap-south-1` (Mumbai) or your preferred region
- **Confirm changes before deploy**: `y`
- **Allow SAM CLI IAM role creation**: `y`
- **Disable rollback on failure**: `n`

---

## 5. Connecting Frontend to AWS API Gateway

Once deployed, copy the `ApiEndpoint` output from SAM:

1. Update your `.env` file:
   ```env
   VITE_API_URL="https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com"
   ```
2. Rebuild the frontend:
   ```bash
   npm run build
   ```

---

## 6. Local Fallback Mode

If AWS credentials are not configured, ShadeRoute runs in **Local Parity Mode**:
- `server.ts` provides the exact same endpoints (`/health`, `/api/routes/compare`, `/api/reports`) with in-memory & localStorage persistence.
- The UI explicitly displays the local status and never claims AWS services are deployed unless credentials exist.
