using Dashboard.Services;

namespace Dashboard.Endpoints;

public static class DatosGasEndpoints
{
    public static void MapDatosGasEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/gas");

        grupo.MapGet("/entregas-plantas", async (DateOnly fecha, IGasEntregasPlantasService servicio) =>
        {
            return Results.Ok(await servicio.ObtenerPorFechaAsync(fecha));
        });
        grupo.MapGet("/entregas-ductos", async (DateOnly fecha, IGasEntregasDuctosService servicio) =>
        {
            return Results.Ok(await servicio.ObtenerPorFechaAsync(fecha));
        });

        grupo.MapGet("/consumo-termoelectricas", async (DateOnly fecha, IGasConsumoXTermoelectricaService servicio) =>
        {
            return Results.Ok(await servicio.ObtenerPorFechaAsync(fecha));
        });

        grupo.MapGet("/capacidad", async (DateOnly fecha, IGasCapacidadService servicio) =>
        {
            return Results.Ok(await servicio.ObtenerPorFechaAsync(fecha));
        });

        grupo.MapGet("/recepciones", async (DateOnly fecha, IGasRecepciones servicio) =>
        {
            return Results.Ok(await servicio.ObtenerPorFechaAsync(fecha));
        });

        grupo.MapGet("/participacion-cargador", async (DateOnly fecha, IGasParticipacionXCargador servicio) =>
        {
            return Results.Ok(await servicio.ObtenerPorFechaAsync(fecha));
        });

        grupo.MapGet("/transporte-sistema", async (DateOnly fecha, IGasTransporteXSistema servicio) =>
        {
            return Results.Ok(await servicio.ObtenerPorFechaAsync(fecha));
        });
        
        grupo.MapGet("/consumo-ciudad", async (DateOnly fecha, IGasConsumoXCiudad servicio) =>
        {
            return Results.Ok(await servicio.ObtenerPorFechaAsync(fecha));
        });

        grupo.MapGet("/transportado-mensual", async (DateOnly fecha, IGasTransportadoMensual servicio) =>
        {
            return Results.Ok(await servicio.ObtenerPorFechaAsync(fecha));
        });
    }
}