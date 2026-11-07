//using ProductosApp.Models;

namespace Dashboard.Features.Gas.Services;

public interface IGasEntregasPlantasService
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
