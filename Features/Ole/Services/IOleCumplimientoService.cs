//using ProductosApp.Models;

namespace Dashboard.Features.Ole.Services;

public interface IOleCumplimientoService
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
