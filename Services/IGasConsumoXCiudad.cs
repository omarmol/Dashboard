//using ProductosApp.Models;

namespace Dashboard.Services;

public interface IGasConsumoXCiudad
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
