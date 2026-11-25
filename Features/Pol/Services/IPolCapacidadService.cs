//using ProductosApp.Models;

namespace Dashboard.Features.Pol.Services;

public interface IPolCapacidadService
{
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
