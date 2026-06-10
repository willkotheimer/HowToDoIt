@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Environment tag (e.g. production, staging)')
param environment string = 'production'

@description('SQL administrator login')
param sqlAdminLogin string

@description('SQL administrator password')
@secure()
param sqlAdminPassword string

var appServicePlanName = 'household-plan'
var apiAppName = 'household-api'
var sqlServerName = 'household-sql-${uniqueString(resourceGroup().id)}'
var sqlDatabaseName = 'Household'

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

// ── SQL Server ────────────────────────────────────────────────────────────────
resource sqlServer 'Microsoft.Sql/servers@2023-02-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    minimalTlsVersion: '1.2'
  }
  tags: {
    environment: environment
  }
}

resource sqlFirewallAzureServices 'Microsoft.Sql/servers/firewallRules@2023-02-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-02-01-preview' = {
  parent: sqlServer
  name: sqlDatabaseName
  location: location
  sku: {
    name: 'Basic'
    tier: 'Basic'
  }
  tags: {
    environment: environment
  }
}

// ── Outputs ───────────────────────────────────────────────────────────────────
output apiAppHostName string = apiApp.properties.defaultHostName
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output sqlDatabaseName string = sqlDatabaseName
