
namespace Dashboard.Features.Ole.Services;

public interface IOleEntregasCrudoService
{
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
