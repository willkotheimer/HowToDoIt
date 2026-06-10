@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Environment tag (e.g. production, staging)')
param environment string = 'production'

var appServicePlanName = 'household-plan'
var apiAppName = 'household-api'

// ── App Service Plan (Linux) ──────────────────────────────────────────────────
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  kind: 'linux'
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
  tags: {
    environment: environment
  }
}

// ── .NET 8 API App Service ────────────────────────────────────────────────────
resource apiApp 'Microsoft.Web/sites@2023-01-01' = {
  name: apiAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|8.0'
      alwaysOn: true
      minTlsVersion: '1.2'
      appSettings: [
        {
          name: 'ASPNETCORE_ENVIRONMENT'
          value: 'Production'
        }
      ]
    }
  }
  tags: {
    environment: environment
  }
}

// ── Outputs ───────────────────────────────────────────────────────────────────
output apiAppHostName string = apiApp.properties.defaultHostName
