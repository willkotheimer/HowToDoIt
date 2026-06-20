using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;

namespace HouseHoldApp.Services
{
    public class BlobStorageService : IBlobStorageService
    {
        private readonly BlobContainerClient _container;
        private readonly SemaphoreSlim _initLock = new(1, 1);
        private bool _containerEnsured;

        public BlobStorageService(IConfiguration configuration)
        {
            var connectionString = configuration["AzureStorage:ConnectionString"];
            var containerName = configuration["AzureStorage:ContainerName"] ?? "chore-images";

            // No network call here — just builds the client. The container is
            // provisioned by infra in Azure and ensured lazily on first upload
            // (so read-only endpoints don't require storage connectivity).
            _container = new BlobContainerClient(connectionString, containerName);
        }

        private async Task EnsureContainerAsync()
        {
            if (_containerEnsured) return;
            await _initLock.WaitAsync();
            try
            {
                if (!_containerEnsured)
                {
                    await _container.CreateIfNotExistsAsync(PublicAccessType.Blob);
                    _containerEnsured = true;
                }
            }
            finally
            {
                _initLock.Release();
            }
        }

        public async Task<string> UploadAsync(Stream content, string fileName, string contentType, int choreId)
        {
            await EnsureContainerAsync();

            var extension = Path.GetExtension(fileName);
            var blobName = $"{choreId}/{Guid.NewGuid():N}{extension}";
            var blob = _container.GetBlobClient(blobName);

            await blob.UploadAsync(content, new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders { ContentType = contentType },
            });

            return blob.Uri.ToString();
        }

        public async Task DeleteAsync(string blobUrl)
        {
            if (string.IsNullOrWhiteSpace(blobUrl))
            {
                return;
            }

            // Only attempt deletion for blobs that live in this container.
            var containerUri = _container.Uri.ToString().TrimEnd('/');
            if (!blobUrl.StartsWith(containerUri, StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            var blobName = blobUrl.Substring(containerUri.Length).TrimStart('/');
            await _container.GetBlobClient(blobName).DeleteIfExistsAsync();
        }
    }
}
