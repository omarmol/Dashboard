using Dashboard.Features.Ole.Services;

namespace Dashboard.Features.Ole.Endpoints;

public static class DatosOleEndpoints
{
    public static void MapDatosOleEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/ole");

        grupo.MapGet("/tanques-arica", async (DateOnly fecha, IOleTanquesAricaService servicio) =>
        {
            return Results.Ok(await servicio.ObtenerPorFechaAsync(fecha));
        });

        grupo.MapGet("/cisternas-arica", async (DateOnly fecha, IOleCisternasAricaService servicio) =>
        {
            return Results.Ok(await servicio.ObtenerPorFechaAsync(fecha));
        });

        grupo.MapGet("/mensual-cisternas", async (DateOnly fecha, IOleMensualCisternasService servicio) =>
        {
            return Results.Ok(await servicio.ObtenerPorFechaAsync(fecha));
        });

        grupo.MapGet("/capacidad", async (DateOnly fecha, IOleCapacidadService servicio) =>
        {
            return Results.Ok(await servicio.ObtenerPorFechaAsync(fecha));
        });
        
        grupo.MapGet("/entregas-crudo", async (DateOnly fecha, IOleEntregasCrudoService servicio) =>
        {
            return Results.Ok(await servicio.ObtenerPorFechaAsync(fecha));
        });

        grupo.MapGet("/entregas-glp", async (DateOnly fecha, IOleEntregasGlpService servicio) =>
        {
            return Results.Ok(await servicio.ObtenerPorFechaAsync(fecha));
        });
    }
}