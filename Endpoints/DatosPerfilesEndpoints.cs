using Dashboard.Services;

namespace Dashboard.Endpoints;

public static class DatosPerfilesEndpoints
{
    public static void MapDatosPerfilesEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/perfil");

        grupo.MapGet("/general", async (DateOnly fecha, String ducto, IPerfilesService servicio) =>
        {
            return Results.Ok(await servicio.ObtenerPorFechaYDuctoAsync(fecha, ducto));
        });
       
    }
}