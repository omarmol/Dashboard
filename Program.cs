using Dashboard.Endpoints;
using Dashboard.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDashboardServices();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapDatosGasEndpoints();
app.MapDatosOleEndpoints();
app.MapCargarDatosEndpoints();
app.MapDatosPerfilesEndpoints();

app.Run();
