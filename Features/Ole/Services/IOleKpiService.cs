//using ProductosApp.Models;

namespace Dashboard.Features.Ole.Services;

public interface IOleKpiService
{
    Task<object> ObtenerCumplimientoAsync(DateOnly fecha);

    Task<object> ObtenerEntregaCrudoTotalAsync(DateOnly fecha);

    Task<object> ObtenerEntregaGlpTotalAsync(DateOnly fecha);
}
