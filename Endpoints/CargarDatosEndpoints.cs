using Microsoft.AspNetCore.Mvc;
using Dashboard.Services;

namespace Dashboard.Endpoints;

public static class CargarDatosEndpoints
{
    public static void MapCargarDatosEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/cargar-datos");

        grupo.MapPost("/cargar-excel", async (
            [FromForm] DateOnly fecha, 
            IFormFile archivo,
            ICargarExcelService servicio,
            ILogger<Program> log) =>
        {
            try
            {
                var resultado = await servicio.CargarExcelAsync(fecha, archivo);
                return Results.Ok(resultado);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                log.LogError(ex, "Error al recibir el archivo");
                return Results.Problem("No se pudo procesar la solicitud.");
            }
        }).DisableAntiforgery();
    }
}