@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Environment tag (e.g. production, staging)')
param environment string = 'production'

@description('Microsoft Entra External ID authority (OIDC metadata base) for API token validation')
param entraAuthority string = 'https://playbookhousehold.ciamlogin.com/15ccd945-4d6b-480a-b762-876b47ceca91/v2.0'

@description('Microsoft Entra API audience (Application ID URI) the API validates tokens against')
param entraAudience string = 'api://8a384714-a967-412d-bb37-f341f851d8ec'

@description('App Service plan name. To share Household\'s plan set createAppServicePlan=false and point this at household-plan.')
param appServicePlanName string = 'howtodoit-plan'

@description('When true, provision a dedicated App Service plan (~+$13/mo). When false, reuse an existing plan named appServicePlanName.')
param createAppServicePlan bool = true

@description('Resource group holding the existing App Service plan when createAppServicePlan=false. Defaults to this resource group.')
param appServicePlanResourceGroup string = resourceGroup().name

@description('.NET API App Service name (must be globally unique).')
param apiAppName string = 'howtodoit-api'

@description('Storage account name. Defaults to Household\'s shared account (same resource group) so images live in one account.')
param storageAccountName string = 'hhimg${uniqueString(resourceGroup().id)}'

@description('Blob container for step-image uploads. A distinct container keeps HowToDoIt images isolated from Household\'s chore-images.')
param imagesContainerName string = 'howtodoit-images'

@description('Emails allowed to perform writes (server-enforced by RequireAuthForWritesFilter). Emitted as Auth:AllowedWriters.')
param allowedWriters array = [
  'wkotheimer@gmail.com'
]

// ── Storage Account + public-read container for step image uploads ────────────
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
// Either provision a dedicated plan or reference Household's existing shared one.
resource newAppServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = if (createAppServicePlan) {
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

resource existingAppServicePlan 'Microsoft.Web/serverfarms@2023-01-01' existing = if (!createAppServicePlan) {
  name: appServicePlanName
  scope: resourceGroup(appServicePlanResourceGroup)
}

var appServicePlanId = createAppServicePlan ? newAppServicePlan.id : existingAppServicePlan.id

// ── Auth:AllowedWriters as indexed app settings (Auth__AllowedWriters__0, ...) ─
var writerAppSettings = [for (email, i) in allowedWriters: {
  name: 'Auth__AllowedWriters__${i}'
  value: email
}]

var baseAppSettings = [
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

// ── .NET 8 API App Service ────────────────────────────────────────────────────
resource apiApp 'Microsoft.Web/sites@2023-01-01' = {
  name: apiAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlanId
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|8.0'
      alwaysOn: true
      minTlsVersion: '1.2'
      appSettings: concat(baseAppSettings, writerAppSettings)
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
