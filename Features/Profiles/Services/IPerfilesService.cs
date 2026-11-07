//using ProductosApp.Models;

namespace Dashboard.Features.Profiles.Services;

public interface IPerfilesService
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaYDuctoAsync(DateOnly fecha, String ducto);
}
