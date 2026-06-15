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
- **Auth**: Firebase (JWT Bearer tokens)
- **Storage**: Firebase Storage (image uploads)
- **Deployment**: Azure App Service (API), Azure Static Web Apps (frontend)
- **CI/CD**: Azure Pipelines

## Getting Started

### Prerequisites

- **Node.js** 22.x
- **.NET 8 SDK**
- **SQL Server** (local or remote)
- **Firebase project** (for Auth and Storage)
- **Azure subscription** (for deployment)

### Frontend Setup

```bash
cd HouseholdApp.ui
npm ci
npm run dev
```

Frontend runs on `http://localhost:3000`

### Backend Setup

```bash
cd HouseHoldApp
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
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_API_URL=http://localhost:5000
```

**Backend** (`appsettings.json`):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=Household;Trusted_Connection=true;"
  },
  "Firebase": {
    "ProjectId": "your-firebase-project"
  }
}
```

## Testing

```bash
# Frontend unit tests
cd HouseholdApp.ui
npm test

# Frontend E2E smoke tests
npm run test:e2e

# Backend unit tests
cd ../HouseHoldApp
dotnet test
```

## Deploying to Azure

### Prerequisites

1. **Azure subscription** with permissions to create resources
2. **Azure CLI** installed and authenticated
3. **Service Principal** for CI/CD (configured in Azure Pipelines)
4. **SQL Database** on Azure
5. **Azure Storage Account** for Firebase integration

### Manual Deployment

1. **Provision Infrastructure** (one-time setup):
   ```bash
   az deployment group create \
     --resource-group your-rg \
     --template-file infra/main.bicep
   ```

2. **Build and Deploy Backend**:
   ```bash
   cd HouseHoldApp
   dotnet publish -c Release -o ./publish
   # Deploy publish folder to App Service via Azure Portal or CLI
   ```

3. **Build and Deploy Frontend**:
   ```bash
   cd HouseholdApp.ui
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

