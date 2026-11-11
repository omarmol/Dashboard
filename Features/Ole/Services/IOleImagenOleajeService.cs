//using ProductosApp.Models;

namespace Dashboard.Features.Ole.Services;

public interface IOleImagenOleajeService
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
