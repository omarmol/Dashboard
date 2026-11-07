//using ProductosApp.Models;

namespace Dashboard.Services;

public interface IGasCapacidadService
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
