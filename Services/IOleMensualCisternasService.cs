//using ProductosApp.Models;

namespace Dashboard.Services;

public interface IOleMensualCisternasService
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
