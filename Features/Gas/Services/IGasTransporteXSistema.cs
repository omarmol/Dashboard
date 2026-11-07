//using ProductosApp.Models;

namespace Dashboard.Features.Gas.Services;

public interface IGasTransporteXSistema
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
