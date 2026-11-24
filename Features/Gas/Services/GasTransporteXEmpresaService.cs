using Microsoft.Data.SqlClient;
using Dashboard.Features.Shared;
//using ProductosApp.Models;

namespace Dashboard.Features.Gas.Services;

public class GasTransporteXEmpresaService : IGasTransporteXEmpresaService
{
    private readonly string _connectionString;

    public GasTransporteXEmpresaService(IConfiguration configuration)
    {
        _connectionString = SqlDataAccess.GetRequiredConnectionString(configuration);
    }

    
    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {

        var resultado = new List<object>();

        const string sql = @"
                SELECT 
                    sistema,
                    ROUND(ISNULL(programado, 0), 2) AS programado,
                    ROUND(ISNULL(ejecutado, 0), 2) AS ejecutado,
                    ROUND(ISNULL(hoy, 0), 2) AS hoy,
                    ROUND(ISNULL(((ejecutado - programado) / programado) * 100, 0), 2) AS cumplimiento
                FROM gas_transporte_empresas
                WHERE CAST(fecha AS DATE) = @fechaFiltro
                ORDER BY ejecutado ASC";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            resultado.Add(new
            {
                sistema = lector.GetStringOrEmpty("sistema"),
                programado = lector.GetRequiredDouble("programado"),
                ejecutado = lector.GetRequiredDouble("ejecutado"),
                hoy = lector.GetRequiredDouble("hoy"),
                cumplimiento = lector.GetRequiredDouble("cumplimiento")
            });
        }

        return resultado;
    }
}
