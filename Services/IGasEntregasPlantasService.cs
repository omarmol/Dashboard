//using ProductosApp.Models;

namespace Dashboard.Services;

public interface IGasEntregasPlantasService
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
