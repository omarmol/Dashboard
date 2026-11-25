//using ProductosApp.Models;

namespace Dashboard.Features.Pol.Services;

public interface IPolCumplimientoService
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);

}
