//using ProductosApp.Models;

namespace Dashboard.Services;

public interface IPerfilesService
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaYDuctoAsync(DateOnly fecha, String ducto);
}
