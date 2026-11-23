using Dashboard.Features.Pol.Services;

namespace Dashboard.Features.Pol.Endpoints;

public static class DatosPolEndpoints
{
    public static void MapDatosPolEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/pol");


        grupo.MapGet("/cumplimiento", async (DateOnly fecha, IPolKpiService servicio) =>
        {
            return Results.Ok(await servicio.ObtenerCumplimientoAsync(fecha));
        });
    }
}