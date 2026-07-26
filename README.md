# Playbook

**Playbook** (formerly Household) is a household task management app that helps families organize and coordinate chores. It combines visual guides (images and step-by-step instructions) with task assignments and progress tracking to ensure chores are done correctly and fairly.

## Primary Features

- **Task Management** — Create chores with detailed descriptions, categories, and step-by-step visual guides using images
- **Profile-Based Assignments** — Group related tasks into profiles (e.g., "Kitchen Duty", "Laundry Day") and assign profiles to household members by week
- **Visual Instructions** — Upload and organize images for each chore to show exactly how tasks should be completed
- **Weekly Assignments** — View and manage your personal weekly assignments with progress tracking
- **Progress Tracking** — See completion status for your assigned tasks and compare progress across household members
- **Command Center** — Bulk-assign tasks to profiles and dispatch profile blueprints to family members for weekly coordination
- **Responsive Design** — Works on desktop and mobile for easy access from anywhere

## Stack

- **Frontend**: React 18, TypeScript, TanStack React Query, Reactstrap, SCSS
- **Backend**: .NET 8 (C#), Entity Framework Core
- **Database**: SQL Server
- **Auth**: Microsoft Entra External ID (MSAL, Google sign-in; JWT Bearer tokens validated by the API)
- **Storage**: Azure Blob Storage (image uploads — uploaded via the API, served from a public-read container)
- **Deployment**: Azure App Service (API), Azure Static Web Apps (frontend)
- **CI/CD**: Azure Pipelines

## Getting Started

### Prerequisites

- **Node.js** 22.x
- **.NET 8 SDK**
- **SQL Server** (local or remote)
- **Microsoft Entra External ID tenant** (for Auth, with Google federation configured)
- **Azure subscription** (for deployment and Blob Storage)
- **Azurite** (optional — local Azure Storage emulator for image uploads in dev)

### Frontend Setup

```bash
cd HowToDoIt.ui
npm ci
npm run dev
```

Frontend runs on `http://localhost:3000`

### Backend Setup

```bash
cd HowToDoItApp
dotnet restore
dotnet build
dotnet run
```

Backend API runs on `http://localhost:5000`

**Database Setup**: Update `appsettings.json` with your SQL Server connection string, then run migrations:

```bash
dotnet ef database update
```

### Environment Variables

**Frontend** (`.env.local`):
```
VITE_API_BASE_URL=https://localhost:5001/api
VITE_ENTRA_CLIENT_ID=<spa-app-registration-client-id>
VITE_ENTRA_TENANT_ID=<external-tenant-id>
VITE_ENTRA_AUTHORITY=https://<tenant-subdomain>.ciamlogin.com/
VITE_ENTRA_API_SCOPE=api://<spa-app-registration-client-id>/access_as_user
```

**Backend** (`appsettings.json`):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=Household;Trusted_Connection=true;"
  },
  "Entra": {
    "Authority": "https://<tenant-subdomain>.ciamlogin.com/<tenant-id>/v2.0",
    "Audience": "api://<spa-app-registration-client-id>"
  },
  "AzureStorage": {
    "ConnectionString": "UseDevelopmentStorage=true",
    "ContainerName": "chore-images"
  }
}
```

> Auth uses Microsoft Entra External ID. The frontend signs in with MSAL (Google federation) and sends a bearer token; the API validates it and requires auth on all write (POST/PATCH/DELETE) endpoints, while reads stay anonymous so signed-out visitors can still view a household. In Azure, the Entra settings are injected into the App Service by the Bicep deployment.

> Image uploads go through the API to Azure Blob Storage. For local development, run the **Azurite** emulator (`UseDevelopmentStorage=true`) or point `AzureStorage:ConnectionString` at a real storage account. In Azure, the connection string and container name are injected into the App Service automatically by the Bicep deployment.

## Testing

```bash
# Frontend unit tests
cd HowToDoIt.ui
npm test

# Frontend E2E smoke tests
npm run test:e2e

# Backend unit tests
cd ../HowToDoItApp
dotnet test
```

## Deploying to Azure

### Prerequisites

1. **Azure subscription** with permissions to create resources
2. **Azure CLI** installed and authenticated
3. **Service Principal** for CI/CD (configured in Azure Pipelines)
4. **SQL Database** on Azure
5. **Azure Storage Account** for image uploads (provisioned automatically by `infra/main.bicep`)

### Manual Deployment

1. **Provision Infrastructure** (one-time setup):
   ```bash
   az deployment group create \
     --resource-group your-rg \
     --template-file infra/main.bicep
   ```

2. **Build and Deploy Backend**:
   ```bash
   cd HowToDoItApp
   dotnet publish -c Release -o ./publish
   # Deploy publish folder to App Service via Azure Portal or CLI
   ```

3. **Build and Deploy Frontend**:
   ```bash
   cd HowToDoIt.ui
   npm run build
   # Deploy build folder to Static Web Apps via Azure Portal or CLI
   ```

### CI/CD Pipeline (Recommended)

Push to `main` branch — Azure Pipelines automatically:
1. Builds and tests backend (.NET 8 + xUnit)
2. Builds and tests frontend (Vitest + Playwright E2E)
3. Provisions/updates Azure infrastructure via Bicep
4. Deploys backend to App Service (ZIP Deploy)
5. Deploys frontend to Static Web Apps

**Pipeline Configuration**: `azure-pipelines.yml`

### Environment Configuration on Azure

**App Service**:
- `ConnectionStrings__DefaultConnection` — SQL Server connection string
- `ASPNETCORE_ENVIRONMENT` — Set to `Production`

**Static Web Apps**:
- API backend URL in environment config
- Firebase credentials

### Database Migrations on Azure

Connect to your Azure SQL Database and run the schema setup scripts, or configure EF Core migrations in the deployment pipeline.

---

### Original Concept (Capstone Project)

This project was initially created as a capstone for Nashville Software School. It evolved from the concept that households need a way to visually communicate how tasks should be done — not just track that they're completed. By pairing step-by-step photo guides with assignments, Playbook helps families maintain consistent standards and learn from each other's approach to household organization.

