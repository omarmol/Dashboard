
namespace Dashboard.Features.Gas.Services;

public interface IGasEntregasDuctosService
{
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
