//using ProductosApp.Models;

namespace Dashboard.Services;

public interface IGasRecepciones
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
