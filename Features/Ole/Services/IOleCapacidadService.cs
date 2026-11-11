//using ProductosApp.Models;

namespace Dashboard.Features.Ole.Services;

public interface IOleCapacidadService
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
