using Dashboard.Features.DataImport.Models;

namespace Dashboard.Features.DataImport.Services;

public record DatosRecepcion(string NombreArchivo, long TamanoBytes, DateOnly Fecha);

public interface ICargarExcelService
{
    Task<RespuestaCargaDatos<DatosRecepcion>> CargarExcelAsync(DateOnly? fecha, IFormFile? archivo);
}