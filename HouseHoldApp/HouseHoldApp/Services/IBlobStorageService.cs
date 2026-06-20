using System.IO;
using System.Threading.Tasks;

namespace HouseHoldApp.Services
{
    public interface IBlobStorageService
    {
        /// <summary>
        /// Uploads a file to blob storage under the given chore and returns the public URL.
        /// </summary>
        Task<string> UploadAsync(Stream content, string fileName, string contentType, int choreId);

        /// <summary>
        /// Deletes the blob identified by its public URL. No-op if the URL is not from this account.
        /// </summary>
        Task DeleteAsync(string blobUrl);
    }
}
