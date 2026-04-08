# Azure Deployment — Cheapest Strategy

## Raffle Web Application

---

## 1. Overview

This document describes the lowest-cost strategy for deploying the Raffle application to Microsoft Azure. The application consists of three components:

| Component | Technology | Package |
|---|---|---|
| **Client** | React 19 SPA (Vite, Tailwind CSS) | `@raffle/client` |
| **Server** | Express.js API (Node.js ≥ 20) | `@raffle/server` |
| **Database** | PostgreSQL (Prisma ORM) | — |

### Target Monthly Cost

| Tier | Estimated Cost | Trade-offs |
|---|---|---|
| **Ultra-cheap** | **~$0/month** | Free-tier limits, cold starts, 12-month Azure free services |
| **Budget production** | **~$13–18/month** | Always-on API, managed PostgreSQL, suitable for light production use |

---

## 2. Recommended Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Internet                         │
└──────────┬──────────────────────────────┬───────────────┘
           │                              │
           ▼                              ▼
┌─────────────────────┐     ┌──────────────────────────┐
│  Azure Static Web   │     │   Azure App Service      │
│  Apps (Free tier)   │────▶│   (Free F1 or Basic B1)  │
│                     │     │                          │
│  React SPA          │     │  Express.js API          │
│  CDN + SSL          │     │  Node.js 20 LTS          │
│  $0/month           │     │  $0 or ~$13/month        │
└─────────────────────┘     └────────────┬─────────────┘
                                         │
                                         ▼
                            ┌──────────────────────────┐
                            │  Azure Database for      │
                            │  PostgreSQL Flexible      │
                            │  Server (Burstable B1ms) │
                            │                          │
                            │  ~$12.41/month           │
                            │  (free for 12 months*)   │
                            └──────────────────────────┘
```

\* Azure free account includes 12 months of Burstable B1ms with 32 GB storage.

---

## 3. Component Breakdown

### 3.1 Client — Azure Static Web Apps (Free Tier)

**Cost: $0/month**

Azure Static Web Apps is purpose-built for SPAs and is the cheapest option for hosting the React client.

| Feature | Free Tier |
|---|---|
| Custom domains | 2 |
| SSL certificates | Included (automatic) |
| Storage | 0.5 GB |
| Bandwidth | 100 GB/month |
| Global CDN | ✅ |
| SPA fallback routing | ✅ |

**Why this is the best choice:**

- The Vite build output (`dist/`) is a set of static files — no server required.
- Built-in CDN provides fast global delivery.
- Automatic HTTPS with free managed SSL certificates.
- Native SPA routing support via `navigationFallback`.

**Build configuration:**

The client builds with `tsc -b && vite build`, producing static output in `packages/client/dist/`.

**Required route configuration** (`packages/client/staticwebapp.config.json`):

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/*.{png,jpg,gif,css,js,ico,svg,woff,woff2}"]
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY"
  }
}
```

### 3.2 Server — Azure App Service

The Express.js API requires a persistent server process. Two tiers are available:

#### Option A: Free F1 Tier ($0/month) — Ultra-Cheap

| Feature | Free F1 |
|---|---|
| Cost | $0/month |
| CPU | 60 minutes/day shared |
| RAM | 1 GB |
| Storage | 1 GB |
| Always On | ❌ (sleeps after ~20 min inactivity) |
| Custom domain SSL | ❌ |
| SLA | None |

**Limitations to understand:**

- The app sleeps after ~20 minutes of inactivity, causing **cold starts of 10–30 seconds**.
- CPU is capped at 60 minutes/day of compute time — sufficient for a low-traffic raffle app.
- No custom domain with SSL (uses `*.azurewebsites.net`).

**When F1 is appropriate:** Development, staging, demos, or raffles used only a few times per week.

#### Option B: Basic B1 Tier (~$13.14/month) — Budget Production

| Feature | Basic B1 |
|---|---|
| Cost | ~$13.14/month |
| CPU | 1 core (dedicated) |
| RAM | 1.75 GB |
| Storage | 10 GB |
| Always On | ✅ |
| Custom domain SSL | ✅ |
| SLA | 99.95% |

**When B1 is appropriate:** Production use where cold starts are unacceptable and you need a custom domain.

**App Service configuration (both tiers):**

- Runtime: Node.js 20 LTS
- Startup command: `node packages/server/dist/index.js`
- Environment variables: `DATABASE_URL`, `SESSION_SECRET`, `CORS_ORIGIN`, `NODE_ENV=production`

### 3.3 Database — Azure Database for PostgreSQL Flexible Server

**Cost: ~$12.41/month** (or $0 for first 12 months on Azure free account)

| Feature | Burstable B1ms |
|---|---|
| Cost | ~$12.41/month |
| vCores | 1 (burstable) |
| RAM | 2 GB |
| Storage | 32 GB included |
| Backups | 7-day retention (free) |
| High availability | Not included |
| SLA | 99.9% |

**Why Flexible Server Burstable B1ms:**

- Smallest managed PostgreSQL tier available on Azure.
- Burstable means it can handle occasional spikes (raffle draws) efficiently.
- Prisma connects via standard `DATABASE_URL` — no code changes required.
- Automated backups included at no extra cost.

**Cost-saving tips:**

- **Stop the server when not in use.** Flexible Server supports stop/start — you are not billed for compute while stopped (storage charges still apply at ~$0.115/GB/month).
- **Use the Azure free account offer.** New accounts get Burstable B1ms free for 12 months with 32 GB storage.

---

## 4. Cost Summary

### Ultra-Cheap Tier (with Azure free account)

| Resource | SKU | Monthly Cost |
|---|---|---|
| Static Web Apps | Free | $0 |
| App Service | Free F1 | $0 |
| PostgreSQL Flexible Server | Burstable B1ms | $0 (free 12 months) |
| **Total** | | **$0/month** |

### Budget Production Tier

| Resource | SKU | Monthly Cost |
|---|---|---|
| Static Web Apps | Free | $0 |
| App Service | Basic B1 | ~$13.14 |
| PostgreSQL Flexible Server | Burstable B1ms | ~$12.41 |
| **Total** | | **~$25.55/month** |

### Ongoing After Free Period Expires

| Resource | SKU | Monthly Cost |
|---|---|---|
| Static Web Apps | Free | $0 |
| App Service | Free F1 | $0 |
| PostgreSQL Flexible Server | Burstable B1ms | ~$12.41 |
| **Total** | | **~$12.41/month** |

---

## 5. Deployment Steps

### 5.1 Prerequisites

- An Azure account ([free account](https://azure.microsoft.com/free/) recommended for the 12-month offers)
- Azure CLI installed (`az`)
- Azure Developer CLI installed (`azd`) — preferred for IaC deployments
- Node.js ≥ 20

### 5.2 Infrastructure as Code (Bicep)

Place all Bicep files under `infra/`.

**`infra/main.bicep`** — defines all three resources:

```bicep
targetScope = 'resourceGroup'

@description('Base name prefix for all resources')
param resourcePrefix string = 'raffle'

@description('Location for all resources')
param location string = resourceGroup().location

@description('PostgreSQL administrator login')
@secure()
param dbAdminLogin string

@description('PostgreSQL administrator password')
@secure()
param dbAdminPassword string

@description('App Service SKU (F1 = free, B1 = basic)')
@allowed(['F1', 'B1'])
param appServiceSku string = 'F1'

@description('Session secret for the Express API')
@secure()
param sessionSecret string

var uniqueSuffix = uniqueString(resourceGroup().id)

// ──────────────────────────────────────────────
// Static Web App (React Client)
// ──────────────────────────────────────────────
resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: '${resourcePrefix}-swa-${uniqueSuffix}'
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    buildProperties: {
      appLocation: '/packages/client'
      outputLocation: 'dist'
    }
  }
}

// ──────────────────────────────────────────────
// App Service Plan + Web App (Express API)
// ──────────────────────────────────────────────
resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: '${resourcePrefix}-plan-${uniqueSuffix}'
  location: location
  sku: {
    name: appServiceSku
  }
  properties: {
    reserved: true // Linux
  }
}

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: '${resourcePrefix}-api-${uniqueSuffix}'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appCommandLine: 'node packages/server/dist/index.js'
      alwaysOn: appServiceSku == 'B1'
      appSettings: [
        { name: 'NODE_ENV', value: 'production' }
        { name: 'SESSION_SECRET', value: sessionSecret }
        { name: 'DATABASE_URL', value: 'postgresql://${dbAdminLogin}:${dbAdminPassword}@${postgresServer.properties.fullyQualifiedDomainName}:5432/raffle?sslmode=require' }
        { name: 'CORS_ORIGIN', value: 'https://${staticWebApp.properties.defaultHostname}' }
      ]
    }
    httpsOnly: true
  }
}

// ──────────────────────────────────────────────
// PostgreSQL Flexible Server
// ──────────────────────────────────────────────
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-12-01-preview' = {
  name: '${resourcePrefix}-db-${uniqueSuffix}'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    administratorLogin: dbAdminLogin
    administratorLoginPassword: dbAdminPassword
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

resource postgresDb 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-12-01-preview' = {
  parent: postgresServer
  name: 'raffle'
}

// Allow Azure services to connect to PostgreSQL
resource firewallRule 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-12-01-preview' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// ──────────────────────────────────────────────
// Outputs
// ──────────────────────────────────────────────
output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'
output apiUrl string = 'https://${webApp.properties.defaultHostName}'
output dbHost string = postgresServer.properties.fullyQualifiedDomainName
```

### 5.3 Azure Developer CLI Setup

**`azure.yaml`** (project root):

```yaml
name: raffle
services:
  web:
    project: ./packages/client
    language: js
    host: staticwebapp
  api:
    project: ./packages/server
    language: ts
    host: appservice
```

### 5.4 Deploy

```bash
# Login to Azure
az login

# Initialize (first time only)
azd init

# Preview the infrastructure changes
azd provision --preview

# Deploy everything (infrastructure + code)
azd up

# Run database migrations after deployment
# (connect to the API app's SSH console or run locally against the Azure DB)
npx prisma migrate deploy
```

---

## 6. Further Cost Optimizations

| Optimization | Saving | Effort |
|---|---|---|
| **Stop the PostgreSQL server** when not running a raffle | ~60–80% of DB cost | Low — manual or scheduled via Azure Automation |
| **Use App Service F1** instead of B1 if cold starts are acceptable | ~$13/month | None |
| **Azure free account** 12-month offers | ~$12/month for DB | None — sign up with a new account |
| **Use Azure Container Apps** (Consumption plan) instead of App Service | Potentially $0 within free grant (180K vCPU-sec/month) | Medium — requires Dockerfile |
| **Switch to Azure SQL Database free offer** | $0 for 100K vCore-seconds + 32 GB | High — requires changing Prisma provider from `postgresql` to `sqlserver` |

---

## 7. What This Strategy Does NOT Include

To keep costs at the absolute minimum, this deployment omits:

- **Custom domain** — uses `*.azurewebsites.net` and `*.azurestaticapps.net` default hostnames (free).
- **High availability / geo-redundancy** — single-region, no failover.
- **Azure Key Vault** — secrets are stored in App Service configuration (acceptable for budget tier; add Key Vault for ~$0.03/10K operations if needed).
- **Application Insights / monitoring** — no telemetry (can be added on free tier with 5 GB/month ingestion).
These can all be added incrementally as the application grows without re-architecting.

---

## 8. CI/CD Pipeline

A GitHub Actions workflow (`.github/workflows/deploy.yml`) is included to automatically build, test, and deploy on every push to `main`. It deploys both the client SPA and server API in parallel after a shared build-and-test job.

### 8.1 Required GitHub Configuration

Before the pipeline will work, configure the following secrets and variables in your GitHub repository settings (**Settings → Secrets and variables → Actions**).

#### Secrets

| Secret | Description | How to obtain |
|---|---|---|
| `SWA_DEPLOYMENT_TOKEN` | Deployment token for the Static Web App | Azure Portal → Static Web App resource → **Manage deployment token** |
| `AZURE_CLIENT_ID` | Service principal (or managed identity) application ID | `az ad sp create-for-rbac --name "raffle-ci"` → `appId` |
| `AZURE_TENANT_ID` | Azure AD tenant ID | `az account show` → `tenantId` |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID | `az account show` → `id` |

#### Variables

| Variable | Description | Example |
|---|---|---|
| `AZURE_RESOURCE_GROUP` | Resource group name | `raffle-rg` |
| `AZURE_API_APP_NAME` | App Service name for the Express API | `raffle-api-abc123` |

### 8.2 OIDC Authentication Setup (Recommended)

The pipeline uses **OpenID Connect (OIDC) federated credentials** — no long-lived secrets to rotate.

```bash
# 1. Create a service principal
az ad sp create-for-rbac --name "raffle-ci" --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/<RESOURCE_GROUP> \
  --sdk-auth

# 2. Add a federated credential for GitHub Actions
az ad app federated-credential create \
  --id <APP_OBJECT_ID> \
  --parameters '{
    "name": "github-main",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:<OWNER>/<REPO>:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

### 8.3 Pipeline Architecture

```
push to main
     │
     ▼
┌─────────────────────┐
│   Build & Test       │
│   npm ci → build →  │
│   lint → test        │
└──────┬──────┬───────┘
       │      │
       ▼      ▼
┌────────────┐ ┌─────────────────┐
│ Deploy SWA │ │ Deploy App Svc  │
│ (client)   │ │ (server + DB    │
│            │ │  migrations)    │
└────────────┘ └─────────────────┘
```

- **Build & Test** — installs deps, runs `turbo build`, lint, and tests. Produces two artifacts: `client-dist` and `server-package`.
- **Deploy Client** — uploads pre-built `dist/` to Azure Static Web Apps.
- **Deploy Server** — zip-deploys the server package to App Service. The startup command runs `prisma migrate deploy` before starting the Express server, so database schema is always up to date.

### 8.4 App Service Environment Variables

Ensure the following are configured on the App Service resource (via Bicep, Azure Portal, or CLI):

```bash
az webapp config appsettings set \
  --resource-group <RESOURCE_GROUP> \
  --name <APP_NAME> \
  --settings \
    NODE_ENV=production \
    DATABASE_URL="postgresql://<user>:<pass>@<host>:5432/raffle?sslmode=require" \
    SESSION_SECRET="<random-64-char-string>" \
    CORS_ORIGIN="https://<swa-hostname>.azurestaticapps.net"
```
