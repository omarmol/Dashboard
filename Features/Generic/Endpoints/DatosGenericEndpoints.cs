using Dashboard.Features.Generic.Services;

namespace Dashboard.Features.Generic.Endpoints;

public static class DatosGenericEndpoints
{
    public static void MapDatosGenericEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/generic");

        grupo.MapGet("/leyendas", async (
            DateOnly fecha,
            string tipo_leyenda,
            ILeyendasService servicio) =>
            TypedResults.Ok(await servicio.ObtenerPorFechaAsync(fecha, tipo_leyenda)))
            .WithName("ObtenerLeyenda")
            .WithSummary("Obtiene una leyenda por fecha y tipo.");
    }
}
