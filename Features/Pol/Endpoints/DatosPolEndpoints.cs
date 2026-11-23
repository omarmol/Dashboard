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

        grupo.MapGet("/cumplimiento-recepciones", async (DateOnly fecha, IPolKpiService servicio) =>
        {
            return Results.Ok(await servicio.ObtenerCumplimientoRecepcionesAsync(fecha));
        });

        grupo.MapGet("/cumplimiento-entregas", async (DateOnly fecha, IPolKpiService servicio) =>
        {
            return Results.Ok(await servicio.ObtenerCumplimientoEntregasAsync(fecha));
        });

        grupo.MapGet("/cumplimiento-ayer", async (DateOnly fecha, IPolKpiService servicio) =>
        {
            return Results.Ok(await servicio.ObtenerCumplimientoAyerAsync(fecha));
        });
    }
}