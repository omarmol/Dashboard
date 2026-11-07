//using ProductosApp.Models;

namespace Dashboard.Services;

public interface IGasConsumoXTermoelectricaService
{
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
