
namespace Dashboard.Features.Ole.Services;

public interface IOleEntregasGlpService
{
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
