//using ProductosApp.Models;

namespace Dashboard.Features.Pol.Services;

public interface IPolKpiService
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerCumplimientoAsync(DateOnly fecha);

    Task<object> ObtenerCumplimientoRecepcionesAsync(DateOnly fecha);

    Task<object> ObtenerCumplimientoEntregasAsync(DateOnly fecha);
    Task<object> ObtenerCumplimientoAyerAsync(DateOnly fecha);
}
