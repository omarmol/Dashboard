//using ProductosApp.Models;

namespace Dashboard.Services;

public interface IGasParticipacionXCargador
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
