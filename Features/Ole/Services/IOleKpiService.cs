//using ProductosApp.Models;

namespace Dashboard.Features.Ole.Services;

public interface IOleKpiService
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerEntregaCrudoTotalAsync(DateOnly fecha);

    Task<object> ObtenerEntregaGlpTotalAsync(DateOnly fecha);
}
