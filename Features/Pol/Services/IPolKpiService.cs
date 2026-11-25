//using ProductosApp.Models;

namespace Dashboard.Features.Pol.Services;

public interface IPolKpiService
{
    // Task<IEnumerable<object>> ObtenerTodosAsync();
    Task<object> ObtenerCumplimientoAsync(DateOnly fecha);

    Task<object> ObtenerKpiCumplimientoRecepcionesAsync(DateOnly fecha);

    Task<object> ObtenerKpiCumplimientoEntregasAsync(DateOnly fecha);
    Task<object> ObtenerCumplimientoAyerAsync(DateOnly fecha);
}
