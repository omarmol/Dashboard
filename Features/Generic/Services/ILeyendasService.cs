namespace Dashboard.Features.Generic.Services;

public interface ILeyendasService
{
    Task<object> ObtenerPorFechaAsync(DateOnly fecha, string tipo_leyenda);
}
