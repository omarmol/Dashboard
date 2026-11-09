using Dashboard.Features.Profiles.Services;

namespace Dashboard.Features.Profiles.Endpoints;

public static class DatosPerfilesEndpoints
{
    public static void MapDatosPerfilesEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/perfil");

        grupo.MapGet("/general", async Task<IResult> (DateOnly fecha, String ducto, IPerfilesService servicio) =>
        {
            try
            {
                return Results.Ok(await servicio.ObtenerPorFechaYDuctoAsync(fecha, ducto));
            }
            catch (ArgumentException ex) when (ex.ParamName == nameof(ducto))
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
        });
       
    }
}