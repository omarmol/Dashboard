
namespace Dashboard.Services;

public interface IGasEntregasDuctosService
{
    Task<object> ObtenerPorFechaAsync(DateOnly fecha);
}
