//using ProductosApp.Models;

namespace Dashboard.Services;

public interface IGasTransportadoMensual
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
