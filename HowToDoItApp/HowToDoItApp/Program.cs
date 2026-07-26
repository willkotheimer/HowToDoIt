using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HowToDoItApp.DataAccess;

namespace HowToDoItApp
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var host = CreateHostBuilder(args).Build();

            // Apply pending migrations (creates the howtodoit schema + tables) and
            // seed the example sequences. Idempotent — a no-op once data exists.
            // Wrapped so a DB hiccup (unreachable / missing permission) is logged
            // but never crashes the app: the SPA and read endpoints still serve.
            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    DbSeeder.Seed(services.GetRequiredService<HowToDoItContext>());
                }
                catch (Exception ex)
                {
                    services.GetRequiredService<ILogger<Program>>()
                        .LogError(ex, "Startup migrate/seed failed; continuing without it.");
                }
            }

            host.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
