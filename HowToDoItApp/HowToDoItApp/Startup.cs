using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using HowToDoItApp.DataAccess;
using HowToDoItApp.Services;
using HowToDoItApp.Filters;
namespace HowToDoItApp
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                    policy.AllowAnyHeader().AllowAnyMethod().WithOrigins(
                        "http://localhost:3000",
                        "https://localhost:3000",
                        "http://localhost:3001",
                        "https://localhost:3001",
                        "https://proud-mushroom-0c6ba0d10.7.azurestaticapps.net"
                    ));
            });

            // Require auth on all state-changing requests; reads stay anonymous.
            // IgnoreCycles: entity graphs have back-references (Step -> Sequence,
            // Image -> Step); skip them instead of throwing on serialization.
            services.AddControllers(options =>
                options.Filters.Add<RequireAuthForWritesFilter>())
                .AddJsonOptions(options =>
                    options.JsonSerializerOptions.ReferenceHandler =
                        System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

            // Add EF Core. HowToDoIt's tables + migrations history live under the
            // "howtodoit" SQL schema so this app can share Household's physical
            // database while staying fully isolated (dbo.* vs howtodoit.*).
            services.AddDbContext<HowToDoItContext>(options =>
                options.UseSqlServer(
                    Configuration.GetConnectionString("DefaultConnection"),
                    sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", "howtodoit")));

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
              .AddJwtBearer(options =>
              {
                  options.IncludeErrorDetails = true;
                  // Microsoft Entra External ID (CIAM). The middleware discovers the
                  // issuer + signing keys from the authority's OIDC metadata.
                  options.Authority = Configuration["Entra:Authority"];

                  // Accept both the App ID URI (api://<client-id>) and the bare
                  // client-id GUID, since Entra v2 may issue either as the audience.
                  var audience = Configuration["Entra:Audience"];
                  var validAudiences = new System.Collections.Generic.List<string> { audience };
                  if (audience != null && audience.StartsWith("api://"))
                  {
                      validAudiences.Add(audience.Substring("api://".Length));
                  }

                  options.TokenValidationParameters = new TokenValidationParameters
                  {
                      ValidateLifetime = true,
                      ValidateAudience = true,
                      ValidAudiences = validAudiences,
                      ValidateIssuer = true,
                  };
              });

            services.AddSingleton<IBlobStorageService, BlobStorageService>();

            services.AddScoped<WorkSequenceRepository>();
            services.AddScoped<WorkStepRepository>();
            services.AddScoped<StepImageRepository>();
            services.AddScoped<CategoryRepository>();
        }


        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseCors();

            app.UseAuthentication();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }

    }
}
