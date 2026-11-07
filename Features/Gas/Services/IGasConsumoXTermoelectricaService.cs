//using ProductosApp.Models;

namespace Dashboard.Features.Gas.Services;

public interface IGasConsumoXTermoelectricaService
{
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
