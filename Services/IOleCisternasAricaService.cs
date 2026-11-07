//using ProductosApp.Models;

namespace Dashboard.Services;

public interface IOleCisternasAricaService
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
