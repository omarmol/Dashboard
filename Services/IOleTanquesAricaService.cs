//using ProductosApp.Models;

namespace Dashboard.Services;

public interface IOleTanquesAricaService
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
