@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Environment tag (e.g. production, staging)')
param environment string = 'production'

@description('Microsoft Entra External ID authority (OIDC metadata base) for API token validation')
param entraAuthority string = 'https://playbookhousehold.ciamlogin.com/15ccd945-4d6b-480a-b762-876b47ceca91/v2.0'

@description('Microsoft Entra API audience (Application ID URI) the API validates tokens against')
param entraAudience string = 'api://8a384714-a967-412d-bb37-f341f851d8ec'

var appServicePlanName = 'household-plan'
var apiAppName = 'household-api'
var storageAccountName = 'hhimg${uniqueString(resourceGroup().id)}'
var imagesContainerName = 'chore-images'

// ── Storage Account + public-read container for chore image uploads ───────────
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: true
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
  tags: {
    environment: environment
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource imagesContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: imagesContainerName
  properties: {
    publicAccess: 'Blob'
  }
}

var storageConnectionString = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=${az.environment().suffixes.storage}'

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
        {
          name: 'AzureStorage__ConnectionString'
          value: storageConnectionString
        }
        {
          name: 'AzureStorage__ContainerName'
          value: imagesContainerName
        }
        {
          name: 'Entra__Authority'
          value: entraAuthority
        }
        {
          name: 'Entra__Audience'
          value: entraAudience
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
output storageAccountName string = storageAccount.name
output imagesBlobEndpoint string = storageAccount.properties.primaryEndpoints.blob
