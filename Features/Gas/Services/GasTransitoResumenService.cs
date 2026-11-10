using Microsoft.Data.SqlClient;
using Dashboard.Features.Shared;

namespace Dashboard.Features.Gas.Services;

public class GasTransitoResumenService : IGasTransitoResumenService
{
    private readonly string _connectionString;

    public GasTransitoResumenService(IConfiguration configuration)
    {
        _connectionString = SqlDataAccess.GetRequiredConnectionString(configuration);
    }

    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {
        var proveedor = new List<string>();
        var cliente = new List<string>();
        var programado = new List<double>();
        var porcentaje_participacion = new List<double>();
        var ejecutado = new List<double>();
        var hoy = new List<double>();
        var entrega_mutun = new List<double>();

        var cantidad_datos = 0;

        const string sql = @"
                SELECT 
                    proveedor,
                    cliente,
                    ROUND(ISNULL(programado, 0), 2) AS programado,
                    ROUND(ISNULL(porcentaje_participacion, 0), 2) AS porcentaje_participacion,
                    ROUND(ISNULL(ejecutado, 0), 2) AS ejecutado,
                    ROUND(ISNULL(hoy, 0), 2) AS hoy,
                    ROUND(ISNULL(entrega_mutun, 0), 2) AS entrega_mutun
                FROM gas_transito_resumen 
                WHERE CAST(fecha AS DATE) = @fechaFiltro";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            proveedor.Add(lector.GetRequiredString("proveedor"));
            cliente.Add(lector.GetRequiredString("cliente"));
            programado.Add(lector.GetRequiredDouble("programado"));
            porcentaje_participacion.Add(lector.GetRequiredDouble("porcentaje_participacion"));
            ejecutado.Add(lector.GetRequiredDouble("ejecutado"));
            hoy.Add(lector.GetRequiredDouble("hoy"));
            entrega_mutun.Add(lector.GetRequiredDouble("entrega_mutun"));
            cantidad_datos++;
        }

        var resultado = new
        {
            proveedor,
            cliente,
            programado,
            porcentaje_participacion,
            ejecutado,
            hoy,
            entrega_mutun,
            cantidad_datos
        };

        return resultado;
    }
}
