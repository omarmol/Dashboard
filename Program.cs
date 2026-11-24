using Dashboard.Features.DataImport.Endpoints;
using Dashboard.Features.Gas.Endpoints;
using Dashboard.Features.Generic.Endpoints;
using Dashboard.Features.Ole.Endpoints;
using Dashboard.Features.Profiles.Endpoints;
using Dashboard.Extensions;
using Dashboard.Features.Pol.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDashboardServices();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapDatosGasEndpoints();
app.MapDatosGenericEndpoints();
app.MapDatosOleEndpoints();
app.MapDatosPolEndpoints();
app.MapCargarDatosEndpoints();
app.MapDatosPerfilesEndpoints();

app.Run();
