//using ProductosApp.Models;

namespace Dashboard.Services;

public interface IGasTransporteXSistema
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
