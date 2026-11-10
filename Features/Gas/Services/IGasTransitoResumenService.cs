
namespace Dashboard.Features.Gas.Services;

public interface IGasTransitoResumenService
{
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
